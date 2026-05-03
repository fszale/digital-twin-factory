---
name: factory-concept
description: Canonical definitions of the four layers in the agentic factory thesis (prompt, agent, digital twin, agent factory). Read before changing any portal copy that references these terms.
---

# Factory Concept Skill

This skill is the source of truth for the **four layers** that the Digital Twin Factory Demo Portal explains on its Home page and references throughout the rest of the surfaces. If you are about to change any copy that names one of these layers, read this file first; if the copy and this file diverge, fix the copy.

## The four layers

### 1. Prompt
A single instruction sent to a model. The atomic unit. A prompt has no memory, no role, no review, no improvement loop. It is useful but it is not the product. The most common failure mode in industry is mistaking a good prompt for a good system.

### 2. Agent
A prompt wrapped with a goal, a small set of tools, a loop, and (sometimes) a short-lived scratchpad. An agent can take more than one step but it has no persistent identity, no taste, and no accountability. Agents are useful as workers but they are not the unit a business hires.

### 3. Digital twin
An agent with a **persistent identity**: a persona, a body of taste, a calibrated voice, decision rights, and a memory that accumulates over time. A digital twin is named after a real operator and is meant to extend that operator's reach — not to imitate them generically. In this ecosystem, that twin is `digital-twin-filip`.

A digital twin is not a chatbot. It is the thing you would introduce to a customer as a member of the team.

### 4. Agent factory
A structured environment around one or more digital twins. A factory has:
- **Work entry** (Slack messages, scheduled cadences, dashboard actions, inbox triage)
- **Role routing** (the same twin is bound to a specific role for this piece of work)
- **Execution** (the twin does the work using its skills and memory)
- **Review gate** (output is reviewed before it leaves the building)
- **Human-in-the-Loop approval** (a human signs off on anything customer-facing or irreversible)
- **Improvement loop** (outcomes feed back as memory, prompts, or skill updates)
- **Memory** (durable, queryable, scoped per role and per relationship)

The factory is the unit that compounds. A prompt does not compound. An agent does not compound. A twin compounds slowly. A factory compounds fast — because every cycle improves the substrate every other cycle uses.

## The "same kernel, different role" invariant

The Twin Gallery on the portal makes one specific claim that the rest of the system must honor: **the same `digital-twin-filip` kernel is bound to four different roles** (Principal Operator, Fractional CTO, Manufacturing AI Advisor, Engineering Acceleration Advisor) without retraining a model. A role is a configuration of:

- Active skills (a subset of the kernel's skills)
- Active guardrails (which can stack with kernel-wide guardrails)
- Allowed work types (what kinds of inputs the role accepts)
- Sample interaction shape (how a typical request and response look)

A role is **not** a model fine-tune, **not** a separate codebase, and **not** a different twin with the same name. If you find code or copy that implies otherwise, fix it.

## How portal copy must use these terms

- Never use "AI" as the noun for what you are talking about — name the layer (prompt / agent / twin / factory). "AI" is too vague to mean anything precise.
- Never call a role a "twin" or a twin a "role." A role is *worn* by a twin.
- Never call the factory a "platform" — a platform implies multi-tenant SaaS; the factory is a way of working.
- Always link the layered concept (Home page) back to the operating layer (Twin Gallery, Architecture Visualizer). The portal should make clear that the four layers are not abstract — they are running right now.

## Cross-repo references

- The kernel that backs every twin: [`agent-kernel`](https://github.com/fszale/agent-kernel)
- The specific operator twin used by this portal: [`digital-twin-filip`](https://github.com/fszale/digital-twin-filip)
- The factory runtime: [`agent-factory`](https://github.com/fszale/agent-factory)
- The methodology and Rate-of-Improvement framing: [`agentic-playbook`](https://github.com/fszale/agentic-playbook)
