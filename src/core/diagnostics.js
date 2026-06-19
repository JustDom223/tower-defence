/**
 * Lightweight runtime diagnostics for bug reports.
 *
 * Keeps a small ring buffer of the most recent JavaScript errors (uncaught
 * exceptions, unhandled promise rejections, and console.error calls) so that a
 * bug report can include what actually went wrong — usually with a stack trace.
 *
 * Call initDiagnostics() once, as early as possible, before the game starts.
 */

const MAX_ERRORS = 15;
const errors = [];

function record(kind, message, extra = {}) {
  errors.push({
    t:    new Date().toISOString(),
    kind,                                   // 'error' | 'promise' | 'console'
    message: String(message ?? '').slice(0, 500),
    ...extra,
  });
  if (errors.length > MAX_ERRORS) errors.shift();
}

function shortStack(stack) {
  return stack ? String(stack).split('\n').slice(0, 6).join('\n') : undefined;
}

function safeStringify(v) {
  if (v == null) return String(v);
  if (typeof v === 'string') return v;
  if (v instanceof Error) return v.stack || v.message;
  try { return JSON.stringify(v); } catch { return String(v); }
}

let initialised = false;

export function initDiagnostics() {
  if (initialised) return;
  initialised = true;

  window.addEventListener('error', (e) => {
    record('error', e.message, {
      src:   e.filename ? `${e.filename}:${e.lineno}:${e.colno}` : undefined,
      stack: shortStack(e.error?.stack),
    });
  });

  window.addEventListener('unhandledrejection', (e) => {
    const r = e.reason;
    record('promise', r?.message ?? r, { stack: shortStack(r?.stack) });
  });

  // Wrap console.error so logged errors are captured too (game code uses it).
  const orig = console.error.bind(console);
  console.error = (...args) => {
    record('console', args.map(safeStringify).join(' '));
    orig(...args);
  };
}

/** Snapshot of recent errors (newest last). Empty array if none. */
export function getRecentErrors() {
  return errors.slice();
}
