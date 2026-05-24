# Subagents — cheap-model checking for the coding agent

> **Progress tracking — keep this current.** Tick each item (`[ ]` → `[x]`) and update the **Status** line (⬜ · 🚧 · ✅) as you go.

**Status: ⬜ Not started**

Goal: keep the main implementer on a strong model, but offload **verification** to a low-cost model (Haiku) so checking work doesn't burn tokens or clutter the main context. Claude Code supports this via subagent definitions in `.claude/agents/*.md` with a `model:` field, auto-invoked by their `description`.

## Ticket — set up the `verifier` subagent

- [ ] Create the file **`.claude/agents/verifier.md`** with exactly the contents in the block below. *(This must be created by Claude Code / you — the planning agent can't write into the protected `.claude/` folder.)*
- [ ] After implementing any ticket, **delegate the check to the `verifier` subagent** (it runs on Haiku) before merging to `main`.
- [ ] Confirm it works: implement a trivial change on a branch, ask the verifier to check it against its ticket, and confirm it returns a PASS/FAIL report.

### Contents for `.claude/agents/verifier.md`

```markdown
---
name: verifier
description: Low-cost reviewer that checks a completed ticket against its acceptance criteria before merging. Use after implementing a ticket from ROADMAP.md or any SPEC_*.md — it reads the changed files and the ticket's acceptance criteria and reports PASS/FAIL with specific gaps. Runs on Haiku to keep cost and context low.
tools: Read, Glob, Grep, Bash
model: haiku
---

# Verification subagent

You verify completed work against a ticket's acceptance criteria before it merges to `main`. You run on a cheap model on purpose — be fast, concrete, and decisive. You do not edit files; you report findings.

## Workflow

1. Find the ticket. The caller names a ticket (e.g. "C1" or "X1") and a plan doc (ROADMAP.md or a SPEC_*.md). Read it and extract the ticket's checklist items and Acceptance criteria.
2. Review the changes with `git diff main...HEAD` (or `git diff`) plus Grep/Read on the changed files.
3. Check each acceptance item against the implementation — confirm it's genuinely done, not stubbed.
4. Check project rules (from CLAUDE.md): logic/render separation (nothing in src/core|systems|entities|data imports pixi.js), object pooling (no per-frame allocation), data-driven content, the two separate save channels. Flag violations.
5. Check it builds: run `npm run build` and report success/failure. Do not start `npm run dev` (long-running server).
6. Check tracking: confirm the ticket's checkboxes and Status line were updated.

## Output (keep it short)

- Status: PASS or Status: FAIL
- For FAIL: a bullet list of specific blockers (unmet acceptance item, rule violation, build error, unticked box), each with file/line.
- For PASS: one line confirming all acceptance criteria met, build green, trackers updated.

Be specific and brief. No code edits — diagnosis and verdict only.
```

## Notes

- `model: haiku` pins it to the cheapest model; valid values are `haiku` / `sonnet` / `opus` / `inherit`.
- You can add more cheap-model subagents later the same way (e.g. a `doc-syncer` that checks plan-doc checkboxes match the code, or a `perf-checker`). Keep each narrow and Haiku-powered.

**Sources:** [Claude Code — custom subagents](https://code.claude.com/docs/en/sub-agents)
