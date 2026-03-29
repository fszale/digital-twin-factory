# Self-Improvement Design

## Purpose

Define how `digital-twin-factory` improves each twin deployment automatically in the background without requiring extra effort from the human interacting with the twin.

V1 must remain:

- analysis-only
- safe by default
- deployment-local by default
- review-gated for portable memory promotion

## Design Goals

- improve usefulness automatically over time
- avoid requiring manual coaching during normal usage
- keep improvements measurable and auditable
- prevent proprietary factory data from leaking into portable twin memory
- make it obvious which improvements were applied and why

## Core Principle

Self-improvement in v1 is not autonomous action expansion.

It is controlled optimization of:

- response quality
- prompt selection
- retrieval quality
- artifact usefulness
- model profile routing
- packaging and delivery quality

## Improvement Scope

### Safe Auto-Optimizations

These may be applied automatically at the deployment level:

- prompt variant ranking
- retrieval source weighting
- memory selection heuristics
- artifact formatting defaults
- summary depth defaults
- model profile selection from an approved list
- request type routing to predefined capability paths

### Review-Gated Improvements

These require explicit human review:

- portable memory updates
- identity or persona framing changes
- capability additions or removals
- channel exposure changes
- budget threshold changes
- changes to feedback weighting rules
- changes to any compliance or privacy boundary

### Forbidden In V1

- autonomous external tool use
- autonomous system mutation
- automatic export of factory memory
- direct promotion of raw customer information into portable memory
- silent modification of governance policies

## Input Signals

The system should learn from both passive and explicit signals.

### Passive Signals

- request resolved without rerun
- follow-up clarification count
- correction count
- time to first useful output
- time to final usable delivery
- artifact open rate
- artifact download rate
- artifact reuse rate
- repeat requester usage
- abandonment after first response
- operator override rate
- operator escalation rate

### Explicit Signals

- thumbs up
- thumbs down
- helpful / not helpful
- short feedback tags
- operator review outcome

Suggested v1 feedback tags:

- `accurate`
- `useful`
- `too_vague`
- `missed_context`
- `great_format`
- `too_slow`
- `incorrect`
- `needs_follow_up`

## Derived Scores

Each run should produce derived scores normalized to `0.0-1.0`.

### Usefulness Score

Primary composite quality signal.

Suggested v1 formula:

```text
usefulness_score =
  0.30 * completion_success +
  0.20 * low_clarification_burden +
  0.15 * low_correction_burden +
  0.15 * artifact_engagement +
  0.10 * repeat_usage_signal +
  0.10 * explicit_feedback_signal
```

Notes:

- missing explicit feedback should not zero the score
- explicit feedback should adjust, not dominate
- operator review may override automated scoring when present

### Confidence In Score

Because some runs will have sparse evidence, compute `score_confidence`.

Suggested factors:

- number of observed signals
- whether operator review exists
- whether artifact interaction data exists
- whether the request reached a clear terminal state

## Improvement Candidate Generation

The system should convert observed patterns into structured candidates.

Candidate fields:

- `candidate_id`
- `deployment_id`
- `candidate_type`
- `trigger_window`
- `supporting_evidence`
- `expected_metric_impact`
- `risk_level`
- `auto_apply_eligible`
- `status`
- `applied_at`
- `rolled_back_at`

Suggested candidate types:

- `prompt_variant_reorder`
- `retrieval_weight_adjustment`
- `artifact_template_switch`
- `model_profile_preference_update`
- `request_classifier_tuning`
- `memory_selection_tuning`
- `portable_memory_promotion_request`

## Background Jobs

V1 should run the following background jobs.

### 1. Run Scoring Job

Frequency:

- after every completed run

Responsibilities:

- compute usefulness and confidence
- compute completion and correction signals
- attach explicit feedback if present
- store run-level quality features

### 2. Daily Pattern Detection Job

Frequency:

- daily per deployment

Responsibilities:

- aggregate recent run outcomes
- identify repeated failure modes
- identify strong-performing prompt and artifact patterns
- identify rising clarification hotspots
- generate `improvement_candidate` records

### 3. Safe Improvement Application Job

Frequency:

- daily or on candidate creation

Responsibilities:

- apply only low-risk auto-approved candidates
- version each change
- attach rollback metadata
- log `improvement_event`

### 4. Weekly Improvement Review Job

Frequency:

- weekly per deployment

Responsibilities:

- summarize changes applied
- compare pre/post metrics
- flag regressions
- queue review-gated changes

### 5. Portable Memory Promotion Review Job

Frequency:

- weekly or manual

Responsibilities:

- list candidate generalized learnings
- require human approval
- record abstraction and redaction evidence

## Evaluation Windows

Use multiple windows to avoid overreacting to noise.

- `short_window`: 24 hours
- `medium_window`: 7 days
- `long_window`: 30 days

Rules:

- do not auto-apply changes from single-run evidence alone
- prefer changes backed by repeated patterns in the 7-day window
- use the 30-day window to confirm sustained value

## Guardrails

### Auto-Apply Guardrails

An improvement may auto-apply only if:

- risk level is `low`
- candidate has repeated evidence
- score confidence exceeds threshold
- predicted impact is positive
- no recent regression exists for the same area

Suggested thresholds:

- `min_score_confidence_for_auto_apply: 0.70`
- `min_supporting_runs: 10`
- `rollback_if_usefulness_drop_pct: 0.10`

### Rollback Rules

Every auto-applied change must be reversible.

Rollback when:

- usefulness drops materially after application
- clarification burden spikes
- explicit negative feedback rises sharply
- operator override rate increases beyond threshold

## Auditability

Every improvement event should record:

- what changed
- why it changed
- which signals supported it
- whether it was auto-applied or human-approved
- which metrics improved or regressed afterward

## UI Requirements

The control plane should show:

- current improvement queue
- auto-applied improvements
- pending review-gated improvements
- improvement impact by deployment
- rollback history

## Suggested Data Contracts

### `improvement_candidate`

```yaml
candidate_id: ic_123
deployment_id: filip__acme
candidate_type: prompt_variant_reorder
risk_level: low
auto_apply_eligible: true
trigger_window: 7d
supporting_evidence:
  runs_observed: 24
  usefulness_lift_pct: 0.11
  clarification_drop_pct: 0.18
expected_metric_impact:
  metric: usefulness_score
  predicted_delta: 0.04
status: proposed
```

### `improvement_event`

```yaml
event_id: ie_123
deployment_id: filip__acme
candidate_id: ic_123
change_type: prompt_variant_reorder
applied_mode: auto
applied_at: 2026-03-28T12:00:00Z
rollback_available: true
pre_metrics:
  usefulness_score: 0.62
post_metrics_window: pending
```

## Suggested Dashboards

### Deployment Detail

- usefulness trend
- recent improvements
- top failure modes
- top positive signals
- pending review items
- rollback alerts

### Factory Overview

- most improved deployments
- most useful deployments
- deployments regressing this week
- most common improvement candidate types
- portable memory promotion requests pending review

## Questions This System Must Answer

- what makes this deployment more useful?
- what makes it less useful?
- which changes improved outcomes?
- which changes regressed outcomes?
- what can be safely improved automatically?
- what must stay behind a review gate?
