# Digital Twin Factory

> Factories of AI Employees + Human-in-the-Loop. The same agent kernel, plugged into many specialized roles.

This repo holds the methodology and the reference implementation of the **Digital Twin Factory Demo Portal** — a public-facing web app that turns the agentic factory thesis into something a CEO, CTO, investor, or implementation partner can understand and interact with in under 2 minutes.

**Live demo:** `<DEPLOY_URL>/twin-portal/` (Replit Deployment — replace `<DEPLOY_URL>` with the live `*.replit.app` host from the project's Publishing tool, or a configured custom domain such as `solidcage.com`).

The same deployment also serves the sister artifacts referenced below at sub-paths:

| Artifact | Path |
| --- | --- |
| Digital Twin Factory Demo Portal | `<DEPLOY_URL>/twin-portal/` |
| Agent ROI Generator | `<DEPLOY_URL>/agent-roi-generator/` |
| Agentic Readiness Scorecard | `<DEPLOY_URL>/agent-roi-generator/scorecard` |
| OI Lab Rate-of-Improvement Tracker | `<DEPLOY_URL>/oi-tracker/` |
| The Agentic OS Playbook (deck) | `<DEPLOY_URL>/decks/agentic-os-playbook` |
| The ROI of AI Employees (deck) | `<DEPLOY_URL>/decks/roi-ai-employees` |
| Digital Twin Factories (deck) | `<DEPLOY_URL>/decks/digital-twin-factories` |

**Book a session:** [Book a session](https://crm.solidcage.com/widget/bookings/filip-szalewicz-fractional-cto-calendar-vfs0lblxh)

## What is an "Agent Factory"?

An agent factory is a structured environment where:

1. A reusable **agent kernel** (skills, prompts, guardrails, memory) is the substrate.
2. A **digital twin** wraps the kernel with the persona, taste, and decision rights of a specific operator (in this repo's case, [`digital-twin-filip`](https://github.com/fszale/digital-twin-filip)).
3. The same twin is **plugged into multiple roles** — Principal Operator, Fractional CTO, Manufacturing AI Advisor, Engineering Acceleration Advisor — without retraining a model.
4. Work is routed in, executed, **gated by a Human-in-the-Loop** review step, and the outcomes are fed back into the kernel as memory and improvement signals.

The thesis: most "AI" projects fail because they automate a single prompt instead of building a **factory** around it. A factory has work entry, role routing, execution, review gates, HITL approval, an improvement loop, and durable memory. That structure is what compounds.

## What's in the demo portal

The portal in `app/` contains six surfaces:

- **Home / Thesis** — the conceptual stack (prompt → agent → digital twin → agent factory) as interactive layered cards
- **Twin Gallery** — `digital-twin-filip` operating in 4 distinct factory roles, with a visual connector showing it's the same kernel underneath
- **Use Case Scorer** — score a business process across 6 dimensions (revenue, cost, risk, data readiness, adoption difficulty, ROI potential), client-side
- **ROI / Rate-of-Improvement Simulator** — visualizes accelerating vs. stabilizing improvement curves; pairs with the [OI Lab](https://github.com/fszale/agentic-playbook) thesis
- **Architecture Visualizer** — interactive node diagram of how a factory runs end to end
- **Lead Magnet** — a short readiness-review intake that links to a booking calendar

## Ecosystem

| Repo | Layer | What it owns |
|---|---|---|
| [`agent-kernel`](https://github.com/fszale/agent-kernel) | Substrate | Skills, prompts, scoring rubrics, agent-spec templates |
| [`digital-twin-filip`](https://github.com/fszale/digital-twin-filip) | Operator twin | Filip's persona, taste, role bindings, sample interactions |
| [`agent-factory`](https://github.com/fszale/agent-factory) | Factory runtime | Work entry, routing, review gates, HITL, memory |
| [`agentic-playbook`](https://github.com/fszale/agentic-playbook) | Methodology | Operational Intelligence Lab, Rate-of-Improvement framing |
| **`digital-twin-factory`** | **Demo portal** | This repo — the public-facing showcase |

## Repo layout

```
digital-twin-factory/
├── README.md            ← you are here
├── AGENTS.md            ← how AI agents should navigate this repo
├── CLAUDE.md            ← Claude-oriented entry point
├── CONTEXT.md           ← AI-first project map
├── .agents/
│   ├── skills/
│   │   ├── factory-concept/        ← canonical definitions used across the portal
│   │   └── role-assignment/        ← how to bind a twin to a new role
│   └── workflows/
│       └── review-factory-design.md
└── app/                 ← React + Vite portal source (mirror of artifacts/digital-twin-portal in Replit)
```

## Local development

The portal lives in `app/` and is built with React + Vite + TypeScript, Tailwind v4, wouter, framer-motion, and recharts. From `app/`:

```bash
pnpm install
pnpm run dev      # local dev server (requires PORT and BASE_PATH env vars when running standalone)
pnpm run build    # production build to dist/
pnpm run test     # vitest unit tests
```

In Replit, use the configured workflow instead — it wires up the env vars automatically.

## Tests

Unit tests cover:
- The 6-dimension scoring engine (per-dimension calc, composite score, verdict thresholds, edge cases)
- The ROI / rate-of-improvement curve (saturation behavior, inflection detection, accelerating/stabilizing/plateaued classification)
- Lead-form validation (required fields, email format, min lengths)
- URL encode/decode for the shareable scorecard link

## Working with this repo as an AI agent

Read [`AGENTS.md`](./AGENTS.md) first. The TL;DR: the portal is the front door; `.agents/skills/factory-concept` is the source of truth for what each layer means; never invent new layers or roles without updating the skill files.

## License

MIT — see `LICENSE` if present in the published repo.
