# Import And Deployment Flow

## Purpose

Define the lifecycle for bringing a portable twin package into `digital-twin-factory` and deploying it into a factory.

## High-Level Flow

1. import twin package
2. validate package contract
3. register digital twin
4. create deployment overlay
5. create memory namespace
6. enable channels
7. begin conversations and jobs

## Step 1: Import Twin Package

Input:

- source repository or bundle
- branch, tag, or commit reference

The platform should fetch the package and inspect the required twin files:

- `twin/digital-twin.yaml`
- `twin/capabilities.md`
- `twin/input-contracts.md`
- `twin/output-contracts.md`
- `twin/memory-policy.md`

## Step 2: Validate Package Contract

The import should fail if:

- required files are missing
- `analysis_only` is false
- no capabilities are declared
- no accepted inputs are declared
- no produced outputs are declared
- memory policy is incomplete
- budget defaults are missing

## Step 3: Register Digital Twin

If validation succeeds, create or update the `digital_twin` record with:

- twin id
- manifest version
- twin version
- source ref
- imported metadata

No factory-specific memory or settings should be created at this step.

## Step 4: Create Deployment

Deployment creation requires:

- target factory
- imported twin id
- deployment id
- channel selection
- budget policy
- primary metric
- review requirements

This creates:

- `twin_deployment`
- `memory_namespace`
- initial `roi_metric`

## Step 5: Attach Channels

For v1, supported channels are:

- web chat
- Slack

Each enabled channel should be recorded explicitly in the deployment configuration.

## Step 6: Start Operating

Once active, the deployment can:

- receive conversations
- create jobs
- execute runs
- generate artifacts
- collect feedback
- self-improve locally
- accumulate rate-of-improvement data

## Separation Rules During Import

Importing a twin package must not:

- import customer data
- import factory transcripts
- import factory memory
- import secrets

Importing a deployment overlay must not:

- overwrite portable twin identity
- bypass analysis-only rules
- bypass budget and channel validation

## Promotion And Export

Portable memory promotion is not part of import.

It is a separate reviewed flow that may happen later after deployment operation and improvement review.

## Suggested Operator Workflow

1. import `digital-twin-filip`
2. inspect manifest and capabilities
3. create deployment for a target factory
4. set baseline metric and budget envelope
5. enable web chat
6. optionally enable Slack
7. monitor usefulness and rate of improvement
