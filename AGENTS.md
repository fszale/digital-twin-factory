# AGENTS.md

Read [CONTEXT.md](CONTEXT.md) first.

## Repo Purpose

`digital-twin-factory` is the shared control plane for hosting portable digital twins inside factory-specific deployments.

The repo currently prioritizes:

- architecture contracts
- deployment boundaries
- self-improvement and rate-of-improvement design
- agent-friendly documentation and scaffolding
- minimal implementation scaffolding for the future app/runtime

## Working Rules

1. Preserve the boundary between `digital_twin`, `twin_deployment`, and factory-scoped memory.
2. V1 is analysis-only. Do not introduce autonomous tool execution into contracts or scaffolding.
3. Prefer configuration and schemas over hardcoded behavior.
4. Keep docs and diagrams synchronized using the scripts in `scripts/`.
5. When changing architecture or core contracts, update:
   - `docs/architecture.md`
   - `docs/data-model.md`
   - relevant diagrams in `diagrams/`
6. When changing API/resource boundaries, update:
   - `docs/api-surface.md`
   - `schemas/`
   - `prisma/schema.prisma`

## First Files To Read

- [CONTEXT.md](CONTEXT.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/data-model.md](docs/data-model.md)
- [docs/twin-package-contract.md](docs/twin-package-contract.md)
- [docs/twin-deployment-contract.md](docs/twin-deployment-contract.md)

## Agent Workflow Hints

- Use `.agents/skills/project-navigation.md` for repo orientation.
- Use `.agents/skills/schema-conventions.md` before editing schemas or Prisma models.
- Use `.agents/workflows/run-doc-checks.md` after updating docs or diagrams.
- Prefer updating diagrams through the marker system rather than pasting copies manually.
