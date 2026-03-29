# Twin Deployment Contract

## Purpose

Define how a portable twin package is deployed into a specific factory in `digital-twin-factory`.

The deployment contract is where factory-specific behavior lives.

It must be possible to deploy the same twin into multiple factories with different:

- memory namespaces
- model limits
- budgets
- channel exposure
- primary metrics
- review requirements

## Core Principle

The twin package defines who the twin is.

The deployment overlay defines how that twin operates here.

## Required Deployment Fields

Each deployment must define:

- `deployment_id`
- `factory_id`
- `digital_twin_id`
- `analysis_only`
- `memory_namespace`
- `enabled_channels`
- `allowed_models`
- `default_model_profile`
- `daily_token_limit`
- `max_cost_per_day`
- `primary_metric_name`
- `baseline_value`
- `target_value`
- `review_requirements`

## Recommended Deployment Template

```yaml
deployment_id: filip__acme
factory_id: acme
digital_twin_id: filip
display_name: "Filip at Acme"
analysis_only: true

memory_namespace:
  namespace_key: filip__acme
  portable_memory_enabled: true
  factory_memory_exportable: false

enabled_channels:
  - web_chat
  - slack

allowed_models:
  - provider/model-fast
  - provider/model-balanced
  - provider/model-deep

default_model_profile: balanced

budget_policy:
  daily_token_limit: 300000
  max_cost_per_day: 25.00
  alert_at_pct: 0.80

primary_metric:
  metric_name: usefulness_score
  baseline_value: 0.45
  target_value: 0.75
  direction: higher_is_better
  measurement_method: weekly_scored_runs

review_requirements:
  portable_memory_promotion: required
  policy_change: required
  high_cost_run: required
```

## Required Behavior Rules

### Analysis-Only

All deployments in v1 must set:

- `analysis_only: true`

This must be enforced by the platform, not just declared in config.

### Memory Separation

Every deployment must have a dedicated memory namespace.

Required rules:

- portable twin memory may be referenced
- factory-scoped memory stays in the deployment namespace
- factory-scoped data is not exportable by default
- memory promotion requires review

### Channel Exposure

Only approved channels may be enabled.

Supported v1 values:

- `web_chat`
- `slack`

Reserved for later:

- `voice`
- `agent_api_sync`
- `agent_api_async`

### Budget Policy

Each deployment must define a local budget envelope.

Required fields:

- `daily_token_limit`
- `max_cost_per_day`
- `alert_at_pct`

Optional later:

- weekly and monthly budgets
- per-model caps
- per-request caps

## Primary Metric Contract

Every deployment must declare a primary metric for rate-of-improvement tracking.

Recommended v1 metrics:

- `usefulness_score`
- `useful_completion_rate`
- `percentage_of_requests_resolved`
- `review_turnaround_time`

If the factory does not yet know the right business KPI, start with:

- `usefulness_score`

And always track:

- `useful_completion_rate`

## Review Requirements

Each deployment must explicitly state review expectations.

Required review categories:

- portable memory promotion
- policy changes
- channel changes
- high-cost run exceptions
- capability definition changes

## Platform Validation Rules

The platform should reject a deployment if:

- referenced twin package is missing
- `analysis_only` is false
- no memory namespace is defined
- no allowed models are defined
- no budget policy is defined
- no primary metric is defined
- no enabled channel is defined

## Suggested Naming Rules

Use these conventions:

- twin id: `filip`
- factory id: `acme`
- deployment id: `filip__acme`
- display name: `Filip at Acme`

This keeps the same twin recognizable across many factories.

## Relationship To Self-Improvement

Self-improvement is deployment-local by default.

That means:

- prompt tuning belongs to the deployment
- retrieval tuning belongs to the deployment
- usefulness scoring belongs to the deployment
- improvement candidates belong to the deployment

Portable memory promotion is a separate reviewed step.

## Relationship To Exports

When a twin leaves a factory, the deployment may export:

- approved portable memory updates
- deployment metadata if allowed
- high-level performance summaries if allowed

The deployment may not export by default:

- raw transcripts
- proprietary artifacts
- factory memory
- secrets

## Summary

The deployment contract is the bridge between a portable twin and a specific factory.

It exists to preserve portability without losing factory-specific control.
