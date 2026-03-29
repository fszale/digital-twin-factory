# API Surface

## Purpose

Define the initial API surface for `digital-twin-factory` v1.

The API is designed for:

- web control plane
- Slack integration
- twin package import
- twin deployment creation
- conversation and job lifecycle management
- artifacts, feedback, and improvement metrics

## Principles

- keep the API resource-oriented
- keep factory and deployment boundaries explicit
- make analysis-only enforcement visible in the contract
- expose enough state for dashboards and background jobs

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
  "allowedModels": ["provider/model-balanced", "provider/model-deep"],
  "defaultModelProfile": "balanced",
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

### Conversations

#### `GET /api/factories/:factoryId/deployments/:deploymentId/conversations`

List conversations for a deployment.

#### `POST /api/factories/:factoryId/deployments/:deploymentId/conversations`

Create a new conversation.

#### `GET /api/conversations/:conversationId`

Return conversation details and message history.

#### `POST /api/conversations/:conversationId/messages`

Append a message and optionally create a job.

### Jobs And Runs

#### `POST /api/conversations/:conversationId/jobs`

Create a job from conversation context.

#### `GET /api/jobs/:jobId`

Return job state.

#### `GET /api/jobs/:jobId/runs`

List runs for a job.

#### `GET /api/runs/:runId`

Return run details including metrics and artifacts.

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
- scoring completed -> enqueue pattern detection when needed
- reviewed promotion approved -> enqueue portable memory update

## V1 Exclusions

Not in the API surface yet:

- voice transport
- external agent sync API
- external agent async API
- billing
- direct tool execution endpoints
