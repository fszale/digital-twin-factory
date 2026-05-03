# AGENTS.md

How AI coding agents (Claude, Cursor, Codex, Replit Agent, etc.) should navigate and contribute to this repository.

## What this repo is

The `digital-twin-factory` repo is the **public-facing demo portal** for the agentic factory ecosystem. It is the surface where a non-technical visitor first encounters the methodology. Its job is to be **understandable in under 2 minutes** and **interactive**, not exhaustive.

The actual runtime, persona, and methodology live in sibling repos:

- [`agent-kernel`](https://github.com/fszale/agent-kernel) — substrate (skills, prompts, scoring rubrics)
- [`digital-twin-filip`](https://github.com/fszale/digital-twin-filip) — the operator twin and its role bindings
- [`agent-factory`](https://github.com/fszale/agent-factory) — runtime: routing, review gates, HITL, memory
- [`agentic-playbook`](https://github.com/fszale/agentic-playbook) — methodology (Operational Intelligence Lab, Rate-of-Improvement)

If you are about to invent a new concept, **first check whether the canonical definition lives in one of those repos** and link to it instead.

## Where to start reading

1. `README.md` — the one-page overview of the portal and ecosystem.
2. `CONTEXT.md` — the AI-first project map: every directory, what it owns, what depends on it.
3. `.agents/skills/factory-concept/SKILL.md` — the canonical definitions of *prompt*, *agent*, *digital twin*, *agent factory*. **All portal copy must be consistent with this file.** If you need to change terminology, change this file first and let the change propagate.
4. `.agents/skills/role-assignment/SKILL.md` — how to add a new role to the Twin Gallery without breaking the "same kernel, different role" invariant.
5. `.agents/workflows/review-factory-design.md` — the structured review pass to run before merging substantive design or content changes.

## Where the code lives

The portal source is mirrored under `app/`. It is a React + Vite + TypeScript app:

- `app/src/pages/` — route components, one per surface (`/`, `/twins`, `/scorer`, `/roi`, `/architecture`, `/intake`)
- `app/src/components/` — shared UI components (navigation shell, footer, layered cards, etc.)
- `app/src/lib/` — pure logic modules (scoring engine, ROI curve, validation, URL codec). **All non-trivial logic must live here, not inside components.** This is what makes the app testable and what allows other repos to lift the algorithms.
- `app/src/lib/__tests__/` (or co-located `*.test.ts`) — vitest unit tests. Run them with `pnpm --filter @workspace/digital-twin-portal run test`.
- `app/src/data/` — static content (role definitions, copy blocks). When you add or edit a role, update this and the matching role spec in `digital-twin-filip/roles/`.

## House rules for agents

1. **No backend.** This portal is intentionally client-side. Do not introduce a server, database, or API routes. Use `localStorage` for the lead-magnet persistence.
2. **No emojis in product UI.** The brand register is operator-engineer, not consumer.
3. **No placeholder image services** (DiceBear, Unsplash, Lorem Picsum). Use generated images, abstract SVG, gradients, or typographic compositions.
4. **No new pages without a reason.** The six surfaces are deliberate. Adding a seventh requires updating `README.md`, `CONTEXT.md`, and the `factory-concept` skill.
5. **Keep logic out of components.** If you find yourself writing a calculation in a `.tsx` file, move it to `app/src/lib/` and add a test for it.
6. **Run the tests.** Before opening a PR, `pnpm --filter @workspace/digital-twin-portal run test` must pass cleanly.
7. **Stay visually consistent with sister artifacts.** The slide decks (`digital-twin-factories`, `roi-ai-employees`, `agentic-os-playbook`) anchor the brand: deep navy background, warm orange primary (#EB6928), JetBrains Mono. Don't drift.
8. **Update both repos when you change a role.** A change to a role displayed in the Twin Gallery must also land in `digital-twin-filip/roles/<role>.yaml`. The portal and the kernel must tell the same story.

## CI / verification

There is no remote CI in this repo by default. The expected pre-merge check is:

```bash
cd app
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
```

## When in doubt

- Defer to `factory-concept/SKILL.md` for definitions.
- Defer to `role-assignment/SKILL.md` for role boundaries.
- Defer to the [agentic-playbook](https://github.com/fszale/agentic-playbook) repo for methodology.
- When unsure whether a change belongs in this repo or in a sibling, prefer the sibling — this repo is the *display layer*, not the source of truth.
