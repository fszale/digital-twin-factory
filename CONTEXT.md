# CONTEXT.md

AI-first project map. Read this when you need a fast structural answer about where something lives or what depends on what.

## Mental model

```
┌──────────────────────────────────────────────────────────────────┐
│ digital-twin-factory  (this repo — the public demo portal)       │
│                                                                  │
│   six pages: Home / Twins / Scorer / ROI / Architecture / Intake │
│   client-side only, React + Vite + TS, Tailwind v4               │
└────────────┬─────────────────────────────────────────────────────┘
             │ tells the same story as ↓
             ▼
┌─────────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│ digital-twin-filip      │  │ agent-kernel         │  │ agent-factory        │
│ (the operator twin +    │  │ (skills, prompts,    │  │ (work entry, routing,│
│  per-role specs)        │  │  scoring rubrics)    │  │  HITL, memory)       │
└─────────────────────────┘  └──────────────────────┘  └──────────────────────┘
                                       │
                                       ▼
                         ┌──────────────────────────┐
                         │ agentic-playbook         │
                         │ (Operational Intelligence│
                         │  Lab, Rate-of-Improvement│
                         │  methodology)            │
                         └──────────────────────────┘
```

This repo is the **display layer**. It is allowed to summarize, dramatize, and visualize — it is not allowed to silently disagree with the source-of-truth repos.

## Directory map

```
digital-twin-factory/
├── README.md                              human overview
├── AGENTS.md                              rules of engagement for AI agents
├── CLAUDE.md                              Claude-oriented entry point
├── CONTEXT.md                             ← you are here
├── .agents/
│   ├── skills/
│   │   ├── factory-concept/
│   │   │   └── SKILL.md                   canonical definitions of the four layers
│   │   └── role-assignment/
│   │       └── SKILL.md                   how a role binds to the twin
│   └── workflows/
│       └── review-factory-design.md       pre-merge review pass
└── app/                                   React + Vite portal
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx                       entry
        ├── App.tsx                        wouter router + layout shell
        ├── index.css                      Tailwind v4 + brand tokens
        ├── components/
        │   ├── Navigation.tsx             top nav with Book-a-Session CTA
        │   ├── Footer.tsx                 GitHub links + solidcage credit
        │   └── ...                        layered cards, role cards, etc.
        ├── pages/
        │   ├── Home.tsx                   /
        │   ├── Twins.tsx                  /twins
        │   ├── Scorer.tsx                 /scorer
        │   ├── Roi.tsx                    /roi
        │   ├── Architecture.tsx           /architecture
        │   └── Intake.tsx                 /intake
        ├── data/
        │   ├── roles.ts                   the 4 displayed roles (mirrors digital-twin-filip/roles/)
        │   ├── layers.ts                  the prompt → agent → twin → factory stack
        │   └── architecture.ts            nodes/edges for the factory diagram
        └── lib/
            ├── scoring.ts                 6-dimension scoring engine (testable)
            ├── roi.ts                     saturating curve + acceleration detection
            ├── leadValidation.ts          react-hook-form / zod validators
            ├── shareLink.ts               URL encode/decode for scorer share-links
            └── __tests__/
                ├── scoring.test.ts
                ├── roi.test.ts
                ├── leadValidation.test.ts
                └── shareLink.test.ts
```

## What each page owns

| Route | Page file | Key data | Key logic |
|---|---|---|---|
| `/` | `Home.tsx` | `data/layers.ts` | none (presentation) |
| `/twins` | `Twins.tsx` | `data/roles.ts` | none (presentation) |
| `/scorer` | `Scorer.tsx` | — | `lib/scoring.ts`, `lib/shareLink.ts` |
| `/roi` | `Roi.tsx` | — | `lib/roi.ts` |
| `/architecture` | `Architecture.tsx` | `data/architecture.ts` | none (presentation) |
| `/intake` | `Intake.tsx` | — | `lib/leadValidation.ts`, `localStorage` |

## What lives where (rules)

- **Logic → `app/src/lib/`**, with a sibling `__tests__/` test. Never inside a `.tsx` component.
- **Static content → `app/src/data/`** (roles, layers, architecture nodes). Easy to diff, easy to mirror to other repos.
- **Visual primitives → `app/src/components/`** (no logic, no fetch).
- **Brand tokens → `app/src/index.css`** (Tailwind v4 `@theme inline`). Anchored to the sister artifacts (`digital-twin-factories`, `roi-ai-employees`, `agentic-os-playbook`).

## Cross-repo invariants

1. The **role list** in `app/src/data/roles.ts` must match the YAML files in [`digital-twin-filip/roles/`](https://github.com/fszale/digital-twin-filip). Adding a role in one place without the other breaks the "same kernel, different role" promise.
2. The **layer definitions** in `app/src/data/layers.ts` must match `factory-concept/SKILL.md`.
3. The **scoring rubric** in `app/src/lib/scoring.ts` is the simplified, demonstrable version of the rubric in [`agent-kernel`](https://github.com/fszale/agent-kernel). If the kernel's rubric changes, this one should be revisited.
4. The **ROI curve** in `app/src/lib/roi.ts` is the visualization of the [Rate-of-Improvement framing in `agentic-playbook`](https://github.com/fszale/agentic-playbook). Changes to the curve's behavior should match changes to the playbook's framing.

## Production environment

The portal is deployed on Replit and is published at the `solidcage`-adjacent demo URL. The "Book a Free Session" CTA on every page links to <https://crm.solidcage.com/widget/bookings/filip-szalewicz-fractional-cto-calendar-vfs0lblxh>. The GitHub URL of the live deployment is referenced from the app's footer and from `README.md`.

## Out of scope (do not add)

- Authentication / user accounts
- Server / API / database
- Analytics that leave the browser without disclosure
- Mobile app shell
- A second product surface that does not fit the six-page layout
