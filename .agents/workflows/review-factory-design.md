# Workflow — Review Factory Design

Run this workflow before merging any substantive change to the portal's structure, copy, or role definitions. It is a structured review pass; it should take 10-15 minutes.

## When to run

Run this workflow when the change touches any of:

- A page's purpose, sections, or primary CTA
- A role on the Twin Gallery (added, removed, or materially edited)
- The four-layer copy on the Home page
- The scoring rubric, the ROI curve, or the architecture diagram nodes/edges
- The brand tokens in `app/src/index.css`

Skip this workflow for cosmetic-only changes (typography polish, hover states, copy nits) and for non-product changes (CI, READMEs).

## Steps

### 1. Cross-repo coherence

- Open the corresponding page in [`digital-twin-filip`](https://github.com/fszale/digital-twin-filip) (for role changes) or the matching skill in [`agent-kernel`](https://github.com/fszale/agent-kernel) (for scoring or methodology changes).
- Confirm the change is consistent with the source-of-truth repo. If not, either align the portal to the source or update the source first and then re-do the portal change.
- Check that any text that names a layer (prompt / agent / twin / factory) matches `.agents/skills/factory-concept/SKILL.md`.

### 2. Same-kernel invariant

- For Twin Gallery changes: confirm the visual still makes the "same kernel, different role" point obvious. The connector must read as one underlying entity, not four separate twins.
- For role changes: confirm the role has context, ≥4 capabilities, ≥3 guardrails, and a realistic sample output (not marketing copy).

### 3. HITL surface

- For any change that adds an action a user can take (new form, new CTA, new flow): confirm the response makes clear what is automated and what is human-reviewed.
- The portal must never imply that the factory does customer-facing or irreversible work without a human in the loop.

### 4. Logic-in-lib check

- Grep the diff for arithmetic, validation, or string-encoding inside `.tsx` files. If any logic snuck into a component, move it to `app/src/lib/` and add a test.
- Confirm any new `lib/` module has a sibling test in `__tests__/` (or co-located `*.test.ts`).

### 5. Test pass

```bash
cd app
pnpm install
pnpm run typecheck
pnpm run test
pnpm run build
```

All four must succeed. If `test` adds new failures, fix them before merging.

### 6. Brand sanity

- Open `artifacts/digital-twin-factories` (or the deployed slide deck) in another tab. Toggle between it and the portal. The two must read as the same brand family — same palette, same type, same register.
- If you intentionally drifted, document why in the PR description.

### 7. Two-minute test

- Open the deployed (or local) portal in an incognito window.
- Pretend you are a CEO who has never heard of any of this.
- Click through Home → Twins → Scorer → ROI → Architecture → Intake.
- After two minutes, can you state, in one sentence, what an "agent factory" is and why you would hire one?
- If no, the change failed the review. Iterate.

## Output

The reviewer leaves a comment on the PR with:

- Pass / fail per step (1-7)
- A note on whether cross-repo updates are required and have been opened
- The two-minute test summary in the reviewer's own words

A failed review blocks merge. A passing review unblocks merge but does not deploy — deployment is manual via the Replit Publish flow.
