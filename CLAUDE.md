# CLAUDE.md

Entry point optimized for Claude (and Claude-based agents like Claude Code, Cursor, Replit Agent) working on this repository.

## One-paragraph summary

`digital-twin-factory` is a public-facing demo portal that explains and showcases an "agent factory" — a system where one underlying agent kernel (`digital-twin-filip`) is plugged into many specialized roles inside a Human-in-the-Loop production environment. The portal is a React + Vite + TypeScript single-page app under `app/`. It has six surfaces (Home / Twin Gallery / Use Case Scorer / ROI Simulator / Architecture Visualizer / Lead Magnet) and is deliberately client-side. The methodology is owned by sibling repos: `agent-kernel`, `digital-twin-filip`, `agent-factory`, `agentic-playbook`.

## Read these in order before any non-trivial change

1. `README.md` — the human-facing overview
2. `AGENTS.md` — the rules of engagement for AI agents (read this carefully — it has hard constraints)
3. `CONTEXT.md` — the project map
4. `.agents/skills/factory-concept/SKILL.md` — canonical definitions; the portal copy must match
5. `.agents/skills/role-assignment/SKILL.md` — how roles are bound to the twin
6. `.agents/workflows/review-factory-design.md` — the pre-merge review workflow

## Hard constraints (do not violate)

- **Client-side only.** No server. No database. No fetch() to a backend. localStorage is fine.
- **No emojis in product UI.**
- **No placeholder image services** (DiceBear, Unsplash, Lorem Picsum). Use generated images, abstract SVG, gradients, or typographic compositions.
- **All non-trivial logic lives in `app/src/lib/`** with vitest tests. Components stay thin.
- **Six pages, no more.** Adding a seventh requires updating README, CONTEXT, and the `factory-concept` skill.
- **Brand anchored to the sister artifacts.** Deep navy background, warm orange primary (#EB6928), accent blue (#387CBD), JetBrains Mono.
- **A role change in the Twin Gallery must also update `digital-twin-filip/roles/<role>.yaml`.** The portal and the kernel must tell the same story.

## Common tasks and where they go

| I want to... | Edit |
|---|---|
| Change copy on the home page | `app/src/pages/Home.tsx` (or its data file) |
| Add a new role to the gallery | `app/src/data/roles.ts` AND `digital-twin-filip/roles/<role>.yaml` |
| Tune the scoring algorithm | `app/src/lib/scoring.ts` + matching `__tests__/scoring.test.ts` |
| Tune the ROI curve | `app/src/lib/roi.ts` + matching `__tests__/roi.test.ts` |
| Change the lead-form fields | `app/src/lib/leadValidation.ts` AND `app/src/pages/Intake.tsx` |
| Change the URL share format for scorecards | `app/src/lib/shareLink.ts` (also update tests) |
| Restyle | `app/src/index.css` (Tailwind v4 tokens) |

## Useful commands

```bash
# from app/
pnpm install
pnpm run typecheck
pnpm run test          # vitest
pnpm run build         # production build
```

In Replit, use the configured workflow rather than running `pnpm dev` directly — env vars (`PORT`, `BASE_PATH`) are wired up by the workflow.

## Style of work I expect from you

- Read before writing. Match the existing patterns; do not introduce a second way to do the same thing.
- When you change behavior, change or add a test. Untested logic is debt.
- Keep diffs surgical. The portal is small and opinionated — large refactors should be discussed first.
- If you find a contradiction between this repo's copy and the sister repos, **flag it** instead of silently picking one. The kernel and the demo must agree.
