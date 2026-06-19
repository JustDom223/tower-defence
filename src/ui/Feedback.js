/**
 * In-game bug-report system.
 *
 * A small "Report a Bug" button opens a modal where the player types what went
 * wrong; on submit it POSTs the message plus auto-collected game context to a
 * Formspree endpoint (which emails the report to the game owner).
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SETUP: paste your Formspree endpoint below.                              │
 * │   1. Create a free form at https://formspree.io (New Form).             │
 * │   2. Copy its endpoint, e.g. https://formspree.io/f/abcdwxyz            │
 * │   3. Replace the FORMSPREE_ENDPOINT value on the next line.             │
 * │ Until then, the form shows a "not set up yet" message instead of sending.│
 * └─────────────────────────────────────────────────────────────────────────┘
 */
import { getRecentErrors } from '../core/diagnostics.js';

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mlgkvddk';

// Build stamp injected by Vite (see vite.config.js); 'dev' when run unbuilt.
const BUILD = typeof __BUILD__ !== 'undefined' ? __BUILD__ : 'dev';

const isConfigured = () => !FORMSPREE_ENDPOINT.includes('REPLACE_ME');

/**
 * Wire up the bug-report button + modal.
 * @param {object}   opts
 * @param {Function} opts.getState  () => game state object (or null on the menu)
 * @param {Function} [opts.onOpen]  called when the modal opens (e.g. to pause)
 * @param {Function} [opts.onClose] called when the modal closes (e.g. to resume)
 */
export function initFeedback({ getState, onOpen, onClose } = {}) {
  const btn      = document.getElementById('report-btn'); // always-on-top, top-right
  const modal    = document.getElementById('report-modal');
  const textEl   = document.getElementById('report-text');
  const nameEl   = document.getElementById('report-name');
  const sendBtn  = document.getElementById('report-send');
  const cancelBtn= document.getElementById('report-cancel');
  const statusEl = document.getElementById('report-status');
  const ctxEl    = document.getElementById('report-context');
  if (!btn || !modal) return; // markup missing — nothing to wire

  function readSave(key) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
    catch { return null; }
  }

  function summarizeTowers(towers) {
    if (!towers?.length) return [];
    return towers.map(t => ({ type: t.type, a: t.upgradesA, b: t.upgradesB, target: t.targeting }));
  }

  // Which overlay/HUD layers are currently on screen, and how they stack — so a
  // "wrong layer is showing / something's covering the game" bug is visible in
  // the report without a screenshot. Topmost (highest z-index) shown layer first.
  const LAYER_IDS = [
    'report-modal', 'pause-screen', 'end-screen', 'unlock-tree', 'boss-warning',
    'map-select', 'tower-panel', 'tower-shop', 'hud',
  ];
  function rectOf(el) {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  }

  function captureUiLayers() {
    const layers = [];
    for (const id of LAYER_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;
      const cs = getComputedStyle(el);
      const z = cs.zIndex === 'auto' ? 0 : (parseInt(cs.zIndex, 10) || 0);
      const shown = cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0;
      const entry = { id, shown, display: cs.display, z, opacity: +cs.opacity,
        position: cs.position, pointerEvents: cs.pointerEvents };
      if (shown) entry.rect = rectOf(el); // where/how big it actually is on screen
      layers.push(entry);
    }
    // Shown layers first, ordered top→bottom by z-index.
    return layers.sort((a, b) => (b.shown - a.shown) || (b.z - a.z));
  }

  // Container + body state that drives layout (the game canvas is fixed-size and
  // CSS-scaled, so most layout bugs trace back to these).
  function captureLayout() {
    const out = { bodyClasses: document.body.className || '(none)' };
    const gc = document.getElementById('game-container');
    if (gc) {
      const cs = getComputedStyle(gc);
      out.gameContainer = { transform: cs.transform, transformOrigin: cs.transformOrigin, rect: rectOf(gc) };
    }
    return out;
  }

  function collectContext() {
    const s = getState?.() ?? null;
    const ctx = {
      build:     BUILD,
      time:      new Date().toISOString(),
      url:       location.href,
      userAgent: navigator.userAgent,
      viewport:  `${window.innerWidth}x${window.innerHeight}`,
      where:     s ? 'in-game' : 'menu',
      // runtime / environment
      dpr:        window.devicePixelRatio,
      fullscreen: !!document.fullscreenElement,
      pointer:    (navigator.maxTouchPoints > 0 || 'ontouchstart' in window) ? 'touch' : 'mouse',
      language:   navigator.language,
      online:     navigator.onLine,
    };
    if (performance.memory) {
      ctx.jsHeapMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
    }
    // Recent JS errors — usually the most useful part of a report.
    const errs = getRecentErrors();
    if (errs.length) ctx.recentErrors = errs;
    // Save snapshots — let the owner load the exact run to reproduce it.
    ctx.saves = {
      checkpoint: readSave('tower-defence-v1'),
      profile:    readSave('tower-defence-profile-v1'),
    };
    // Which UI layers are showing + their stacking — catches overlay/"frozen" bugs.
    ctx.uiLayers = captureUiLayers();
    ctx.layout   = captureLayout();
    if (s) {
      ctx.map          = s.mapKey;
      ctx.difficulty   = s.diffKey;
      ctx.wave         = `${(s.waveIndex ?? -1) + 1}/${s.totalWaves ?? '?'}`;
      ctx.lives        = s.lives;
      ctx.cash         = s.cash;
      ctx.score        = s.score;
      ctx.sandbox      = !!s.sandbox;
      ctx.gameOver     = !!s.gameOver;
      ctx.enemiesAlive = s.enemies?.length ?? 0;
      ctx.loopSpeed    = s.loopSpeed ?? 1;
      ctx.runSeconds   = s.runStartedAt ? Math.round((performance.now() - s.runStartedAt) / 1000) : undefined;
      ctx.towers       = summarizeTowers(s.towers);
    }
    return ctx;
  }

  function open() {
    statusEl.textContent = '';
    statusEl.className   = 'report-status';
    sendBtn.disabled     = false;
    const ctx = collectContext();
    // Show the player what's being attached (transparency — no surprises).
    const errN   = ctx.recentErrors?.length ?? 0;
    const errStr = errN ? ` · ${errN} JS error${errN > 1 ? 's' : ''} captured` : '';
    ctxEl.textContent = ctx.where === 'in-game'
      ? `Auto-attached: ${ctx.map} · ${ctx.difficulty} · wave ${ctx.wave} · build ${ctx.build}${errStr}`
      : `Auto-attached: menu · build ${ctx.build}${errStr}`;
    modal.dataset.context = JSON.stringify(ctx);
    modal.style.display = 'flex';
    onOpen?.();
    textEl.focus();
  }

  function close() {
    modal.style.display = 'none';
    textEl.value = '';
    onClose?.();
  }

  async function send() {
    const message = textEl.value.trim();
    if (!message) { setStatus('Please describe the bug first.', 'err'); textEl.focus(); return; }
    if (!isConfigured()) {
      setStatus("Bug reporting isn't set up yet (no Formspree endpoint).", 'err');
      return;
    }

    const context = JSON.parse(modal.dataset.context || '{}');
    sendBtn.disabled = true;
    setStatus('Sending…', '');

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          message,
          reporter: nameEl.value.trim() || 'anonymous',
          _subject: `🐞 Tower Defence bug — ${context.map ?? 'menu'} (build ${context.build})`,
          // flattened for at-a-glance email readability
          map: context.map, difficulty: context.difficulty, wave: context.wave,
          build: context.build, where: context.where,
          errorCount: context.recentErrors?.length ?? 0,
          runSeconds: context.runSeconds,
          context: JSON.stringify(context, null, 2),
        }),
      });
      if (res.ok) {
        setStatus('✓ Thanks! Your report was sent.', 'ok');
        textEl.value = '';
        setTimeout(close, 1200);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = data?.errors?.map(e => e.message).join(', ') || `HTTP ${res.status}`;
        setStatus(`Couldn't send: ${msg}`, 'err');
        sendBtn.disabled = false;
      }
    } catch (err) {
      setStatus(`Couldn't send: ${err.message}. Check your connection.`, 'err');
      sendBtn.disabled = false;
    }
  }

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = 'report-status' + (kind ? ` report-status-${kind}` : '');
  }

  btn.addEventListener('click', open);
  cancelBtn.addEventListener('click', close);
  sendBtn.addEventListener('click', send);
  // Click the dimmed backdrop (but not the panel) to dismiss.
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  // Esc closes; Ctrl/Cmd+Enter submits.
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); send(); }
  });
}
