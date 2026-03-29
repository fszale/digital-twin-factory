# Rate Of Improvement Design

## Purpose

Define how `digital-twin-factory` measures whether a digital twin deployment is improving over time and how that improvement is visualized.

The goal is to answer:

- is this deployment improving?
- how fast is it improving?
- is it becoming more useful?
- are improvements sustained or noisy?

## Core Principle

Rate of Improvement should measure the business value a deployment creates, not just system internals.

System metrics still matter, but they are secondary.

Primary measurement order for v1:

1. deployment business KPI when available
2. `usefulness_score`
3. `useful_completion_rate`
4. supporting operational metrics

## Metric Layers

### 1. Primary Metric

This is the most important deployment outcome metric.

Examples:

- useful_completion_rate
- review_turnaround_time
- artifact_acceptance_rate
- percentage_of_requests_resolved
- hours_saved_per_week

Each deployment must define:

- `metric_name`
- `baseline_value`
- `target_value`
- `direction`: `higher_is_better` or `lower_is_better`
- `measurement_method`
- `owner`

### 2. Usefulness Metrics

Usefulness should always be present, even if a domain KPI exists.

Required usefulness metrics:

- `usefulness_score`
- `useful_completion_rate`
- `clarification_burden`
- `correction_burden`
- `repeat_requester_rate`

### 3. Supporting Metrics

These help explain movement:

- time to first useful output
- time to final delivery
- artifact open rate
- artifact download rate
- explicit positive feedback rate
- explicit negative feedback rate
- operator override rate
- escalation rate
- token usage per useful completion

## Baseline Rules

Every deployment needs a baseline before meaningful RoI claims.

If historical data exists:

- use the last representative pre-deployment period

If no historical data exists:

- treat the first 1-2 weeks as baseline calibration
- clearly label the deployment as `baseline_forming`

Baseline rules:

- do not compare against ad hoc memories
- keep baseline calculation reproducible
- annotate major deployment changes that affect baseline interpretation

## Weekly Snapshot Model

Store a `roi_snapshot` for each deployment at least weekly.

Suggested fields:

- `deployment_id`
- `week_start`
- `primary_metric_value`
- `baseline_value`
- `improvement_vs_baseline_pct`
- `weekly_roi_delta`
- `usefulness_score`
- `useful_completion_rate`
- `curve_classification`
- `context_notes`
- `data_quality_score`

## Core Calculations

### Improvement vs Baseline

For metrics where higher is better:

```text
improvement_vs_baseline_pct =
  (current_value - baseline_value) / baseline_value
```

For metrics where lower is better:

```text
improvement_vs_baseline_pct =
  (baseline_value - current_value) / baseline_value
```

### Weekly Rate Of Improvement

```text
weekly_roi_delta =
  current_week_improvement_pct - previous_week_improvement_pct
```

### Useful Completion Rate

```text
useful_completion_rate =
  useful_completed_requests / eligible_completed_requests
```

### Usefulness Score

Use the composite score defined in [self-improvement.md](/Users/fszale/projects/personal/digital-twin-factory/docs/self-improvement.md).

## Curve Classification

After at least 4 weeks of data, classify the shape:

- `s_curve`
- `rise_decline`
- `flat`
- `investigate`

### `s_curve`

- strong early improvement
- later taper
- stable useful output

### `rise_decline`

- initial gains followed by regression
- likely caused by drift, bad changes, noisy routing, or adoption decay

### `flat`

- little or no improvement from baseline
- likely means poor fit, bad metric choice, or ineffective improvement loop

### `investigate`

- noisy or implausible movement
- likely means measurement or data quality issue

## Data Quality Rules

Every snapshot should include a `data_quality_score`.

Reduce data quality when:

- too few completed runs exist
- explicit signals are sparse
- request types changed materially
- multiple major configuration changes happened in the same window
- event logging was incomplete

If data quality is low:

- show warnings in the dashboard
- avoid strong automation decisions based on that window

## Dashboard Requirements

### Factory Overview Dashboard

Show:

- deployments ranked by usefulness score
- deployments ranked by weekly RoI delta
- deployments regressing this week
- deployments with low data quality
- deployments with high budget burn and low usefulness
- top applied improvements across the factory

### Deployment Detail Dashboard

Show:

- primary metric current vs baseline vs target
- usefulness score trend
- useful completion trend
- weekly RoI sparkline
- curve classification
- top improvement events
- top regression drivers
- budget consumption vs value
- data quality warning state

## Visualization Recommendations

### Required Charts

- baseline-to-current trend line
- weekly RoI bar or sparkline
- usefulness trend line
- useful completion rate trend
- budget vs usefulness scatter or dual-axis chart

### Required Tables

- recent weekly snapshots
- recent improvement events
- top negative signals
- top positive signals

## Alerting Rules

Generate alerts when:

- usefulness drops by more than threshold week-over-week
- primary metric regresses for 2 consecutive weeks
- budget burn rises while usefulness falls
- data quality falls below threshold
- override or escalation rate spikes

Suggested v1 thresholds:

- `usefulness_drop_alert_pct: 0.10`
- `two_week_regression_alert: true`
- `low_data_quality_threshold: 0.60`

## Review Cadence

### Daily

- monitor fresh regressions
- monitor failed or noisy improvements

### Weekly

- create deployment snapshots
- review top movers
- review regressions
- review pending improvement candidates

### Monthly

- assess whether the deployment is on an S-curve
- recalibrate primary metric if needed
- review whether useful completion proxy should be replaced by a better business metric

## Suggested Data Contracts

### `roi_metric`

```yaml
deployment_id: filip__acme
metric_name: useful_completion_rate
direction: higher_is_better
baseline_value: 0.42
target_value: 0.75
measurement_method: weekly_completed_jobs
owner: factory_operator
```

### `roi_snapshot`

```yaml
deployment_id: filip__acme
week_start: 2026-03-23
primary_metric_value: 0.58
baseline_value: 0.42
improvement_vs_baseline_pct: 0.38
weekly_roi_delta: 0.07
usefulness_score: 0.66
useful_completion_rate: 0.58
curve_classification: s_curve
data_quality_score: 0.82
context_notes:
  - prompt_variant_reorder applied
  - artifact_template_switch applied
```

## Interpretation Guidance

Use these rules:

- high usefulness with low RoI may mean the deployment is already mature
- high RoI with low usefulness may mean the deployment is improving from a poor baseline
- high budget with flat usefulness is a warning sign
- strong metric movement with low data quality should be treated as provisional

## Questions This System Must Answer

- is this deployment getting better?
- is it getting more useful?
- are improvements sustained?
- what changed before improvement?
- what changed before regression?
- are we spending more than the value we are generating?
