# Schema Conventions

Use these conventions when editing schemas and Prisma models in this repo.

## Rules

- Keep names consistent across docs, schemas, and Prisma models.
- Use snake_case in conceptual docs and JSON property examples when helpful.
- Use clear IDs: `factory_id`, `deployment_id`, `run_id`.
- Keep v1 analysis-only constraints explicit in schemas.
- Preserve memory separation as a first-class contract.

## Alignment Targets

- `docs/data-model.md`
- `docs/twin-package-contract.md`
- `docs/twin-deployment-contract.md`
- `schemas/*.json`
- `prisma/schema.prisma`
