# API Surface

## Purpose

Define the initial API surface for `digital-twin-factory` v1.

The API is designed for:

- web control plane
- Slack integration
- Supabase-authenticated multi-user access
- twin package import
- twin deployment creation
- conversation and job lifecycle management
- HITL escalation and synthesized human handoff
- artifacts, feedback, and improvement metrics

## Principles

- keep the API resource-oriented
- keep factory and deployment boundaries explicit
- make analysis-only enforcement visible in the contract
- expose enough state for dashboards and background jobs
- enforce super-admin and twin-owner access boundaries

## Authentication And Authorization

Use Supabase user authentication for human access.

Current access model:

- `super_admin`: can access every deployment
- `twin_owner`: can access only assigned deployment(s)

Protected routes should:

- resolve the Supabase-authenticated user
- map that user to `platform_users`
- check `deployment_access` for deployment-scoped resources

Bootstrap route:

- `POST /api/admin/bootstrap-super-admin` uses `PLATFORM_BOOTSTRAP_SECRET` and does not require prior auth

## Core Resource Groups

### Factory Management

#### `GET /api/factories`

List factories visible to the current operator.

#### `POST /api/factories`

Create a factory.

#### `GET /api/factories/:factoryId`

Return factory details.

### Twin Registry

#### `GET /api/twins`

List imported digital twins.

#### `POST /api/twins/import`

Import a twin package into the registry.

Request body:

```json
{
  "sourceType": "git_repo",
  "sourceRef": "github.com/org/digital-twin-filip#main"
}
```

Response:

```json
{
  "digitalTwinId": "filip",
  "manifestVersion": "1.0",
  "twinVersion": "0.1.0",
  "analysisOnly": true,
  "status": "imported"
}
```

#### `GET /api/twins/:digitalTwinId`

Return twin manifest metadata and package summary.

### Twin Deployments

#### `GET /api/factories/:factoryId/deployments`

List deployments in a factory.

#### `POST /api/factories/:factoryId/deployments`

Create a deployment from an imported twin.

Request body:

```json
{
  "digitalTwinId": "filip",
  "deploymentId": "filip__acme",
  "displayName": "Filip at Acme",
  "analysisOnly": true,
  "enabledChannels": ["web_chat", "slack"],
  "allowedModels": ["xai/grok-4.2", "openai/chatgpt-default"],
  "modelPreferences": {
    "preferredProvider": "xai",
    "preferredModel": "grok-4.2",
    "preferredProfile": "deep",
    "fallbackProvider": "openai",
    "fallbackModel": "chatgpt-default"
  },
  "budgetPolicy": {
    "dailyTokenLimit": 300000,
    "maxCostPerDay": 25.0,
    "alertAtPct": 0.8
  },
  "primaryMetric": {
    "metricName": "usefulness_score",
    "baselineValue": 0.45,
    "targetValue": 0.75,
    "direction": "higher_is_better",
    "measurementMethod": "weekly_scored_runs"
  }
}
```

#### `GET /api/factories/:factoryId/deployments/:deploymentId`

Return deployment details.

#### `PATCH /api/factories/:factoryId/deployments/:deploymentId`

Update deployment policy, budget, or metadata.

#### `GET /api/factories/:factoryId/deployments/:deploymentId/config`

Return runtime deployment config including preferred model provider/model and channel/budget limits.

#### `PATCH /api/factories/:factoryId/deployments/:deploymentId/config`

Upsert the runtime deployment config used by the control plane.

### Conversations

#### `GET /api/factories/:factoryId/deployments/:deploymentId/conversations`

List conversations for a deployment.

#### `POST /api/factories/:factoryId/deployments/:deploymentId/conversations`

Create a new conversation.

#### `GET /api/conversations/:conversationId`

Return conversation details and message history.

#### `POST /api/conversations/:conversationId/messages`

Append a message and optionally create a job.

#### `GET /api/conversations/:conversationId/summary`

Return the latest synthesized conversation summary and handoff-ready brief.

### Jobs And Runs

#### `POST /api/conversations/:conversationId/jobs`

Create a job from conversation context.

#### `GET /api/jobs/:jobId`

Return job state.

#### `GET /api/jobs/:jobId/runs`

List runs for a job.

#### `GET /api/runs/:runId`

Return run details including metrics and artifacts.

### HITL Escalations

#### `GET /api/factories/:factoryId/deployments/:deploymentId/escalations`

List active and recent escalations for a deployment.

#### `POST /api/runs/:runId/escalations`

Create a HITL escalation when the real human behind the twin is needed.

Request body:

```json
{
  "reasonCode": "human_judgment_required",
  "notifyChannels": ["dashboard", "slack"],
  "requestedHumanId": "filip-owner"
}
```

#### `GET /api/escalations/:hitlEscalationId`

Return escalation details, synthesized summary, and notification state.

#### `PATCH /api/escalations/:hitlEscalationId`

Resolve, cancel, or otherwise update an escalation.

#### `POST /api/escalations/:hitlEscalationId/notify`

Deliver or redeliver the synthesized handoff packet through configured channels.

### Admin

#### `POST /api/admin/bootstrap-super-admin`

Seed the first `super_admin` using `PLATFORM_BOOTSTRAP_SECRET`.

#### `POST /api/admin/platform-users`

Register or update a platform user record after the user exists in Supabase Auth.

#### `POST /api/admin/deployment-access`

Assign a `twin_owner` to a deployment.

### Artifacts

#### `POST /api/artifacts/uploads`

Create upload session or upload metadata.

#### `GET /api/artifacts/:artifactId`

Return artifact metadata.

#### `GET /api/jobs/:jobId/artifacts`

List artifacts for a job.

### Feedback

#### `POST /api/feedback`

Capture lightweight explicit feedback.

Request body:

```json
{
  "deploymentId": "filip__acme",
  "subjectType": "run",
  "subjectId": "run_123",
  "feedbackType": "thumbs_up",
  "tag": "useful"
}
```

### Improvement And Metrics

#### `GET /api/factories/:factoryId/deployments/:deploymentId/improvements`

List improvement candidates and events.

#### `GET /api/factories/:factoryId/deployments/:deploymentId/metrics/roi`

Return rate-of-improvement data.

#### `GET /api/factories/:factoryId/deployments/:deploymentId/metrics/usefulness`

Return usefulness metrics and trends.

## Slack Integration Endpoints

### `POST /api/integrations/slack/events`

Receive Slack events and map them to conversations and messages.

### `POST /api/integrations/slack/actions`

Receive interactive feedback or action payloads from Slack.

## Validation Rules

The API must reject requests when:

- deployment is not analysis-only in v1
- requested model is not allowed by deployment policy
- daily budget would be exceeded
- channel is not enabled for the deployment
- twin import contract is incomplete

## Background Job Triggers

These API actions should enqueue background work:

- message posted -> evaluate whether a job should be created
- job created -> enqueue run
- run completed -> enqueue scoring job
- run completed or escalation triggered -> enqueue conversation summary synthesis
- escalation created -> enqueue notification delivery
- scoring completed -> enqueue pattern detection when needed
- reviewed promotion approved -> enqueue portable memory update

## V1 Exclusions

Not in the API surface yet:

- voice transport
- external agent sync API
- external agent async API
- billing
- direct tool execution endpoints
