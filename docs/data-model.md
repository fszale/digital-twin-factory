# Data Model

## Purpose

Define the core entities and relationships for `digital-twin-factory` v1.

The model is designed for:

- centrally hosted operation
- analysis-only digital twins
- human-facing web chat and Slack interaction
- deployment-local self-improvement
- strict separation between portable twin identity and factory-scoped memory

## Core Entity Boundaries

The platform has three major boundaries:

- `digital_twin`: portable twin package definition
- `twin_deployment`: factory-specific deployment of a twin
- `factory_memory`: private runtime data that stays in the factory

This distinction must remain explicit in storage, APIs, and UI.

## Primary Entities

### `factory`

Represents a business unit or deployment environment hosting one or more twins.

Required fields:

- `factory_id`
- `name`
- `slug`
- `status`
- `owner_user_id`
- `created_at`
- `updated_at`

Suggested fields:

- `description`
- `region`
- `default_channel_policy`
- `default_budget_policy`
- `default_memory_policy`

### `workspace`

Optional grouping layer inside a factory for teams, projects, or departments.

Required fields:

- `workspace_id`
- `factory_id`
- `name`
- `slug`
- `status`
- `created_at`

### `digital_twin`

Portable twin package definition imported from a twin repository such as `digital-twin-filip`.

Required fields:

- `digital_twin_id`
- `twin_key`
- `display_name`
- `version`
- `source_type`
- `source_ref`
- `analysis_only`
- `manifest_version`
- `created_at`

Suggested fields:

- `description`
- `owner_name`
- `owner_role`
- `default_model_profiles`
- `default_budget_policy`
- `default_memory_policy`

### `twin_deployment`

A factory-specific deployment of a digital twin.

Required fields:

- `deployment_id`
- `factory_id`
- `workspace_id`
- `digital_twin_id`
- `deployment_key`
- `status`
- `memory_namespace_id`
- `analysis_only`
- `created_at`
- `updated_at`

Suggested fields:

- `display_name`
- `enabled_channels`
- `allowed_models`
- `default_model_profile`
- `daily_token_limit`
- `max_cost_per_day`
- `primary_metric_name`
- `baseline_value`
- `target_value`

### `conversation`

Human-facing interaction thread from web or Slack.

Required fields:

- `conversation_id`
- `factory_id`
- `workspace_id`
- `deployment_id`
- `channel_type`
- `requester_id`
- `status`
- `created_at`

Suggested fields:

- `external_thread_ref`
- `title`
- `last_activity_at`

### `message`

Normalized inbound or outbound message in a conversation.

Required fields:

- `message_id`
- `conversation_id`
- `direction`
- `author_type`
- `author_id`
- `body`
- `created_at`

Suggested fields:

- `channel_message_ref`
- `structured_payload`
- `feedback_state`

### `job`

Durable work item created from a conversation, URL, or uploaded files.

Required fields:

- `job_id`
- `factory_id`
- `workspace_id`
- `deployment_id`
- `conversation_id`
- `job_type`
- `status`
- `created_at`

Suggested fields:

- `request_summary`
- `submitted_by`
- `priority`
- `review_required`

### `run`

Single execution attempt of a twin against a job.

Required fields:

- `run_id`
- `job_id`
- `deployment_id`
- `status`
- `started_at`
- `completed_at`

Suggested fields:

- `model_profile`
- `model_name`
- `token_input`
- `token_output`
- `cost_estimate`
- `usefulness_score`
- `score_confidence`
- `needs_review`

### `artifact`

Input or output file/object associated with a job or run.

Required fields:

- `artifact_id`
- `factory_id`
- `workspace_id`
- `deployment_id`
- `artifact_type`
- `storage_uri`
- `created_at`

Suggested fields:

- `job_id`
- `run_id`
- `source_type`
- `content_type`
- `size_bytes`
- `display_name`
- `is_exportable`

### `memory_namespace`

Deployment-local boundary for factory-scoped memory.

Required fields:

- `memory_namespace_id`
- `deployment_id`
- `scope`
- `created_at`

Suggested fields:

- `retention_policy`
- `export_policy`
- `redaction_policy`

### `memory_entry`

Structured memory item stored in a namespace.

Required fields:

- `memory_entry_id`
- `memory_namespace_id`
- `entry_type`
- `content`
- `created_at`

Suggested fields:

- `source_run_id`
- `sensitivity_level`
- `promotion_candidate`
- `expires_at`

### `feedback_event`

Optional explicit feedback captured from users or operators.

Required fields:

- `feedback_event_id`
- `deployment_id`
- `subject_type`
- `subject_id`
- `feedback_type`
- `created_at`

Suggested fields:

- `requester_id`
- `tag`
- `score_delta`
- `comment`

### `usage_event`

Tracks token, cost, and runtime consumption.

Required fields:

- `usage_event_id`
- `deployment_id`
- `run_id`
- `event_type`
- `created_at`

Suggested fields:

- `token_input`
- `token_output`
- `cost_usd`
- `model_name`
- `provider_name`

### `approval`

Human review record for gated changes or runs.

Required fields:

- `approval_id`
- `factory_id`
- `subject_type`
- `subject_id`
- `status`
- `requested_at`

Suggested fields:

- `reviewer_user_id`
- `reviewed_at`
- `decision_reason`

### `improvement_candidate`

Proposed quality improvement generated by background analysis.

Required fields:

- `candidate_id`
- `deployment_id`
- `candidate_type`
- `risk_level`
- `status`
- `created_at`

Suggested fields:

- `supporting_run_count`
- `expected_metric_impact`
- `auto_apply_eligible`
- `supporting_evidence`

### `improvement_event`

Applied or rolled back improvement record.

Required fields:

- `improvement_event_id`
- `deployment_id`
- `candidate_id`
- `change_type`
- `applied_mode`
- `created_at`

Suggested fields:

- `rollback_available`
- `rolled_back_at`
- `pre_metrics`
- `post_metrics`

### `roi_metric`

Defines the primary metric contract for a deployment.

Required fields:

- `roi_metric_id`
- `deployment_id`
- `metric_name`
- `direction`
- `baseline_value`
- `created_at`

Suggested fields:

- `target_value`
- `measurement_method`
- `owner`
- `baseline_window`

### `roi_snapshot`

Periodic measurement point for improvement tracking.

Required fields:

- `roi_snapshot_id`
- `deployment_id`
- `week_start`
- `primary_metric_value`
- `improvement_vs_baseline_pct`
- `weekly_roi_delta`
- `created_at`

Suggested fields:

- `usefulness_score`
- `useful_completion_rate`
- `curve_classification`
- `data_quality_score`
- `context_notes`

## Key Relationships

```text
factory -> workspace
factory -> twin_deployment
digital_twin -> twin_deployment
twin_deployment -> conversation
twin_deployment -> job
twin_deployment -> run
twin_deployment -> artifact
twin_deployment -> memory_namespace
twin_deployment -> feedback_event
twin_deployment -> improvement_candidate
twin_deployment -> improvement_event
twin_deployment -> roi_metric
twin_deployment -> roi_snapshot
conversation -> message
conversation -> job
job -> run
run -> artifact
run -> usage_event
memory_namespace -> memory_entry
approval -> job | run | improvement_candidate | memory_promotion
```

## Separation Rules

### Portable vs Factory Data

Portable twin metadata belongs in `digital_twin`.

Factory-specific data belongs in:

- `twin_deployment`
- `conversation`
- `job`
- `run`
- `artifact`
- `memory_namespace`
- `memory_entry`

Portable twin metadata may be exported.

Factory-scoped data may not be exported without explicit redaction and approval.

### Deployment-Local Improvement

Self-improvement changes should attach to `twin_deployment`, not directly to `digital_twin`, unless a reviewed portable memory promotion is approved.

## Suggested Status Enums

### Factory Status

- `draft`
- `active`
- `paused`
- `archived`

### Deployment Status

- `draft`
- `active`
- `paused`
- `disabled`
- `archived`

### Conversation Status

- `open`
- `waiting_for_user`
- `in_progress`
- `completed`
- `archived`

### Job Status

- `queued`
- `running`
- `completed`
- `failed`
- `cancelled`
- `needs_review`

### Run Status

- `queued`
- `running`
- `completed`
- `failed`
- `timed_out`
- `cancelled`

### Improvement Candidate Status

- `proposed`
- `auto_applied`
- `pending_review`
- `approved`
- `rejected`
- `rolled_back`

## Suggested Indexing Priorities

- `deployment_id` on all run, job, feedback, usage, and roi tables
- `factory_id` for all top-level query paths
- `conversation_id` on messages and jobs
- `job_id` on runs and artifacts
- `week_start` on roi snapshots
- `status` on jobs, runs, and approvals

## Initial Build Priority

Implement first:

- `factory`
- `digital_twin`
- `twin_deployment`
- `conversation`
- `message`
- `job`
- `run`
- `artifact`
- `memory_namespace`
- `usage_event`
- `feedback_event`
- `improvement_candidate`
- `improvement_event`
- `roi_metric`
- `roi_snapshot`

Add later only if needed:

- `workspace`
- richer approval subclasses
- fine-grained memory entry types
