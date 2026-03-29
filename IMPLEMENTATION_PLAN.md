# Digital Twin Factory Implementation Plan

## Purpose

`digital-twin-factory` is the central control plane for running multiple digital twins in a uniform environment.

It is responsible for:

- hosting digital twin deployments
- providing human-facing interfaces
- enforcing budgets and policy
- managing factory-scoped memory and artifacts
- improving twin quality over time in the background
- delivering outputs back to users
- preparing for future voice and agent API access

It is not responsible for defining the portable identity of a twin. That belongs in each twin package, such as `digital-twin-filip`.

## Product Position

The first version should be a simple, centrally managed platform:

- centrally hosted by the operator
- analysis-only twins
- human interaction first
- web chat first
- Slack second
- voice later
- agent-to-agent API later
- no billing in v1
- per-twin model and token budgets in v1

## Core Design Rule

Separate these concerns cleanly:

- `Twin Definition`: portable package for a person-specific digital twin
- `Twin Deployment`: factory-specific instance of that twin
- `Factory Memory`: proprietary data, conversation history, job history, and artifacts for one factory only

The same twin may exist in multiple factories, but each deployment must have its own memory namespace, budgets, channels, and policy.

## Scope for V1

The v1 platform should support:

- factory and workspace management
- twin registry
- twin deployment registry
- web chat interface
- Slack integration
- URL ingestion
- file upload ingestion
- async job execution
- artifact storage and delivery
- audit logging
- budget enforcement
- automatic background self-improvement
- rate-of-improvement tracking and visualization
- human review gates for expensive or exceptional runs

The v1 platform should not support:

- autonomous tool execution
- MCP-driven actions
- inter-factory runtime calls
- billing and payments
- external customer self-service onboarding

## Recommended System Architecture

Use `Next.js` as the control plane application:

- web UI
- authentication
- admin interface
- API routes
- chat thread rendering
- Slack webhook handling
- job creation and run status APIs

Do not use `Next.js` alone as the execution engine for long-running work. Pair it with:

- `Postgres` for metadata, registry, policy, conversations, jobs, and audit
- object storage for uploads and output artifacts
- queue and worker processes for long-running twin execution
- optional cache or pub-sub layer for streaming updates later

## Suggested Runtime Components

1. `factory-admin`
- manage factories, twins, deployments, channels, and policy

2. `conversation-gateway`
- normalize web chat and Slack messages into a common request envelope

3. `job-orchestrator`
- turn conversations, URLs, or uploads into durable jobs

4. `twin-runner`
- execute analysis-only twin runs in workers

5. `artifact-service`
- store, version, and deliver outputs

6. `policy-engine`
- enforce token, model, channel, and approval rules

7. `memory-service`
- store factory-scoped memory and portable memory references separately

8. `audit-service`
- log every run, policy check, approval, and artifact delivery

9. `improvement-observer`
- score runs, detect patterns, and generate improvement candidates automatically

10. `improvement-engine`
- apply safe deployment-local improvements and queue higher-risk improvements for review

11. `roi-service`
- track baseline, weekly improvement, curve classification, and dashboard views per deployment

## Canonical Data Model

The platform should center on these entities:

- `factory`
- `workspace`
- `digital_twin`
- `twin_deployment`
- `conversation`
- `job`
- `run`
- `artifact`
- `policy`
- `approval`
- `usage_event`
- `memory_namespace`
- `improvement_candidate`
- `improvement_event`
- `roi_metric`
- `roi_snapshot`

Key rule:

- a `digital_twin` is portable
- a `twin_deployment` is factory-specific
- a `memory_namespace` belongs to the deployment, not to the portable twin alone

## Memory Separation Rules

These rules should be implemented from the start.

### Portable Twin Memory

Portable memory may travel with the twin across factories and may be exported.

Examples:

- durable identity
- operating style
- generalized frameworks
- non-proprietary lessons
- refined prompt patterns
- reusable heuristics
- approved skill improvements

### Factory-Scoped Memory

Factory memory must never leave the factory unless explicitly redacted and approved.

Examples:

- customer documents
- uploaded files
- conversation transcripts
- job history
- internal reports
- proprietary decisions
- factory contacts
- factory-specific instructions
- secrets and tokens
- raw artifacts

### Promotion Rule

Factory learning may only be promoted into portable twin memory if all of the following are true:

- the learning has been abstracted into a general pattern
- proprietary details have been removed
- the change has human approval
- the promoted content is recorded as a memory promotion event

### Export Rule

When a twin leaves a factory, export only:

- portable twin memory
- twin identity metadata
- approved generalized learnings

Do not export:

- raw customer artifacts
- transcripts
- factory reports
- secrets
- proprietary internal context

## Built-In Self-Improvement

V1 should include a background self-improvement loop, but it must stay inside the analysis-only boundary.

That means the twin may improve:

- prompt routing
- capability tagging
- retrieval and memory selection
- artifact packaging
- response structure
- recommended model profile selection
- reusable generalized lessons

That means the twin may not do this in v1:

- call external tools on its own
- mutate customer systems
- auto-promote proprietary factory memory into portable memory
- silently change high-risk identity or policy settings

## Self-Improvement Loop

The loop should be automatic and invisible to the end user.

1. `capture`
- log every request, run, artifact, follow-up question, retry, and delivery outcome

2. `score`
- generate run quality signals automatically from background telemetry

3. `analyze`
- identify failure patterns, recurring clarification gaps, useful artifact shapes, and strong output patterns

4. `propose`
- create structured `improvement_candidate` records

5. `apply`
- auto-apply safe deployment-local improvements within guardrails

6. `promote`
- require human review before promoting generalized learning into portable twin memory

## Default Quality Signals

To avoid requiring manual user feedback, v1 should infer quality from passive signals:

- request resolved without re-run
- low follow-up clarification count
- artifact viewed, downloaded, or reused
- low time-to-first-useful-output
- low correction rate
- low abandonment rate
- operator override frequency

Optional explicit feedback can exist later, but the core loop should not depend on it.

## Usefulness As A First-Class Metric

Each twin deployment should explicitly optimize for usefulness.

For v1, usefulness should be tracked as a composite metric rather than a vague label.

Recommended metric:

- `usefulness_score`

Suggested inputs:

- successful completion without rework
- requester follows through using the output
- artifact opened, downloaded, forwarded, or reused
- low clarification burden
- low correction burden
- positive explicit feedback when provided
- repeat usage of the same twin by the same requester
- low abandonment after first response

Usefulness should be measured at three levels:

- `interaction usefulness`: was this single exchange helpful?
- `job usefulness`: did the entire job produce a usable outcome?
- `deployment usefulness`: is this twin consistently useful over time in this factory?

## Feedback Model

V1 should support lightweight explicit feedback, but keep it optional and fast.

Recommended feedback options:

- thumbs up
- thumbs down
- helpful / not helpful
- quick tags such as `accurate`, `too vague`, `missed context`, `great format`, `too slow`

Feedback should be captured after:

- a chat response
- a delivered artifact
- a completed job

Explicit feedback should enrich the usefulness model, not replace passive signals.

## Usefulness Scoring Rules

The platform should compute usefulness from both passive and explicit inputs.

Suggested weighting for v1:

- passive signals as the primary source of truth
- explicit feedback as a strong adjustment layer
- operator review outcomes as the highest-confidence signal

Examples:

- strong positive signal: output used without correction and artifact reused
- strong negative signal: repeated clarifications followed by abandonment
- high-confidence correction signal: operator marks output as materially flawed

## Usefulness Dashboard

The dashboard should include:

- current `usefulness_score`
- 7-day and 30-day usefulness trend
- usefulness by channel: web, Slack, later voice
- usefulness by request type
- usefulness by output type
- top positive signals
- top negative signals
- explicit feedback distribution
- repeat-user rate

This should sit next to the main rate-of-improvement view because usefulness is one of the best leading indicators of deployment quality.

## Improvement Guardrails

Automatic improvement in v1 should be limited to low-risk changes such as:

- ranking of prompt or template variants
- retrieval source weighting
- artifact formatting defaults
- deployment-local model profile choice from an approved list
- deployment-local summarization style

Require human review for:

- changes to portable memory
- changes to identity framing
- changes to capability definitions
- changes to channel exposure
- changes to budget thresholds
- changes to any policy boundary

## Rate of Improvement Design

Rate of Improvement must be built in and visible per twin deployment.

Each deployment should define:

- `primary_metric_name`
- `baseline_value`
- `target_value`
- `measurement_method`
- `measurement_frequency`

The most important rule is to measure the business outcome the deployment is meant to improve, not only system metrics.

For deployments without a custom business metric yet, use a temporary default metric:

- `useful_completion_rate`

Definition:

- percentage of requests that produce a usable output without manual re-run or substantial correction within the review window

If the deployment does not yet have a domain-specific business KPI, `usefulness_score` and `useful_completion_rate` should be the default paired metrics for early-stage measurement.

## Rate of Improvement Dashboard

The v1 dashboard should show, for each deployment:

- current primary metric
- current usefulness score
- baseline value
- target value
- weekly improvement vs baseline
- weekly rate of improvement
- curve classification: `s_curve`, `rise_decline`, `flat`, or `investigate`
- top improvement candidates applied
- top failure modes still unresolved
- budget consumption vs value delivered

This should be visible in both:

- factory-level dashboard
- per-deployment detail view

## Recommended Visualizations

The dashboard should include:

- baseline-to-current trend line
- week-over-week rate-of-improvement sparkline
- usefulness trend by week
- top three drivers of improvement
- top three drivers of regression
- recent improvement events with timestamps
- confidence or data-quality warning if the metric is noisy

## Success Criteria For Self-Improvement

The platform should be able to answer these questions at any time:

- is this deployment improving?
- how fast is it improving?
- is it actually useful to the people interacting with it?
- what changed when it improved?
- what regressed when quality dropped?
- which improvements were deployment-local versus promoted to portable memory?

## Discovery and Onboarding Contract

Every twin package onboarded into the platform should provide:

- machine-readable manifest
- human-readable capability summary
- accepted input contract
- output contract
- budget defaults
- memory policy
- review policy

The platform should validate these before allowing deployment.

## Repo Layout Recommendation

Suggested initial structure:

```text
digital-twin-factory/
  README.md
  IMPLEMENTATION_PLAN.md
  docs/
    architecture.md
    data-model.md
    memory-and-privacy.md
    self-improvement.md
    rate-of-improvement.md
    api-surface.md
    roadmap-30-60-90.md
  app/
  components/
  lib/
  workers/
  schemas/
  tests/
```

## Delivery Plan

### Immediate

- define platform architecture
- define twin package contract
- define twin deployment contract
- define memory and privacy rules
- define self-improvement loop and guardrails
- define per-deployment primary ROI metric contract
- define v1 data model
- define web chat and Slack flows

### Soon

- scaffold `Next.js` control plane
- add auth and admin shell
- add factory and twin registry models
- add job and run models
- add worker execution path
- add artifact storage abstraction
- add run scoring and improvement candidate generation
- add deployment ROI dashboard and weekly snapshots

### Later

- voice transport
- agent API
- self-service onboarding
- multi-factory discovery
- billing
- inter-factory protocols

## Additional Recommendations

- Keep Slack as a channel, not the system of record.
- Keep factory-scoped memory out of git repositories.
- Keep portable memory versioned and exportable.
- Enforce analysis-only mode in v1 at the platform level.
- Require explicit per-deployment budgets and approved model lists.
- Model approval gates now, even if most runs auto-proceed at first.
- Keep self-improvement deployment-local by default, with explicit review for portable memory promotion.

## Immediate Next Documents To Create

- `docs/architecture.md`
- `docs/data-model.md`
- `docs/memory-and-privacy.md`
- `docs/self-improvement.md`
- `docs/rate-of-improvement.md`
- `docs/twin-package-contract.md`
- `docs/twin-deployment-contract.md`
- `docs/api-surface.md`
- `docs/roadmap-30-60-90.md`
