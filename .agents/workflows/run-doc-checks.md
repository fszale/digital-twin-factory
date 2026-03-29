# Run Doc Checks

After changing docs or diagrams:

1. Run `python3 scripts/embed_diagrams.py`
2. Run `python3 scripts/validate_repo.py`
3. Review any marker, registry, or path errors

If schemas changed too:

4. Check `docs/data-model.md`, `schemas/`, and `prisma/schema.prisma` for drift
