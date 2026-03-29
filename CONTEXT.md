# Digital Twin Factory Context

## What This Repo Is

`digital-twin-factory` is the platform repo for hosting, governing, improving, and measuring multiple digital twin deployments.

It is not the portable twin itself.

## Current Product Scope

V1 is:

- centrally hosted
- analysis-only
- human-facing first
- web chat first
- Slack second
- voice later
- agent API later
- budget-controlled
- self-improving within safe deployment-local boundaries

## Architecture Boundaries

- `digital_twin`: portable package imported from a twin repo
- `twin_deployment`: factory-specific deployment of a twin
- `factory_memory`: private runtime memory that stays in the factory

## Important Docs

- `docs/architecture.md`
- `docs/data-model.md`
- `docs/api-surface.md`
- `docs/self-improvement.md`
- `docs/rate-of-improvement.md`

## Important Directories

- `app/`: future Next.js app router scaffold
- `prisma/`: draft relational model
- `schemas/`: import and deployment schema contracts
- `docs/`: architecture and contract docs
- `diagrams/`: Mermaid sources and registry
- `.agents/`: agent-specific repo guidance
- `scripts/`: doc and diagram maintenance scripts

## Contribution Priorities

1. Keep contracts correct.
2. Keep memory boundaries strict.
3. Keep analysis-only enforcement explicit.
4. Keep docs, diagrams, schemas, and Prisma aligned.
