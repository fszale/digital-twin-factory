---
name: role-assignment
description: How to bind the digital-twin-filip kernel to a new factory role without breaking the "same kernel, different role" invariant. Read before adding or substantially editing a role.
---

# Role Assignment Skill

This skill describes how a role is bound to the operator twin (`digital-twin-filip`) and what must be true for that binding to be coherent across this portal and the `digital-twin-filip` repo.

## What a role is

A **role** is a configuration applied to the kernel for a specific class of work. It is **not** a separate model, a separate twin, or a separate codebase. A role is four things:

1. **Context** — what this role is hired to do, expressed as one or two sentences a CEO would understand
2. **Active capabilities** — the subset of kernel skills the role uses; usually 4-6
3. **Active guardrails** — what the role refuses to do, escalates, or routes to HITL; usually 3-4
4. **Sample interaction shape** — one realistic input and the shape of its output (a memo, a triage list, a scorecard, etc.)

Every role displayed on the Twin Gallery (`/twins`) must have a one-to-one match in [`digital-twin-filip/roles/<role-id>.yaml`](https://github.com/fszale/digital-twin-filip/tree/main/roles).

## Adding a new role — the checklist

1. **Decide whether it is actually a new role.** A new role exists when:
   - The work intake is meaningfully different (e.g., code review packages vs. weekly priorities)
   - The active skills overlap less than ~70% with an existing role
   - The HITL pattern is materially different (e.g., "draft only, never send" vs. "approve before deploy")
   If those are not all true, you are probably adding a *capability* to an existing role, not creating a new role.

2. **Write the role spec first** in `digital-twin-filip/roles/<role-id>.yaml` using the `agent-spec-domain-template.yaml` shape from `agent-kernel`. The four currently-displayed roles are:
   - `principal-operator`
   - `fractional-cto`
   - `manufacturing-ai-advisor`
   - `engineering-acceleration-advisor`
   Pick a kebab-case `role-id` that is unambiguous in conversation.

3. **Mirror the role in `digital-twin-factory/app/src/data/roles.ts`** with: id, display name, one-paragraph context, capabilities array, guardrails array, and a `sampleOutput` block. The shape used in the portal must be a faithful, lossy summary of the YAML — not a divergent fork.

4. **Update the Twin Gallery if the count changed.** The page currently presents four roles in a grid that visually emphasizes the "same kernel" connector. If you add a fifth, confirm the visual still works and update copy that says "four roles" anywhere in the portal (Home page, README, CONTEXT.md, this file).

5. **Run the tests.** `pnpm --filter @workspace/digital-twin-portal run test`. The role data is consumed by the page; tests should still pass.

## Editing an existing role — the checklist

1. Find the role in `digital-twin-filip/roles/<role-id>.yaml` and edit there first.
2. Mirror the change to `digital-twin-factory/app/src/data/roles.ts`.
3. If the change involves a new active skill or a new guardrail category, also revisit `factory-concept/SKILL.md` to make sure the four-layer language still fits.
4. Run the tests.

## Anti-patterns

- **A role with no guardrails.** A role with no guardrails is a chatbot, not a factory worker. Always specify at least 3.
- **A role that owns its own model.** Roles do not own models. The kernel owns the substrate; the role is a configuration.
- **A role that bypasses HITL on customer-facing or irreversible actions.** This is a hard constraint of the factory.
- **A role whose sample output reads like marketing copy.** The sample output must look like a real artifact a real operator would produce — a triage list, a memo, a code-review note, a scorecard. Not a polished testimonial.

## Where the boundary sits

If the proposed work is too far from the operator's actual taste — e.g., personal medical, legal, or financial advice — it does not belong on this twin and does not belong in this factory. Decline and document.
