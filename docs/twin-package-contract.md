# Twin Package Contract

## Purpose

Define the minimum contract a portable twin package must satisfy before it can be imported into `digital-twin-factory`.

This contract is intentionally simple for v1:

- centrally managed
- analysis-only
- human-facing first
- portable twin identity separated from factory data

## Required Twin Package Deliverables

Every twin package must provide:

1. machine-readable manifest
2. human-readable capability summary
3. input contract
4. output contract
5. memory policy
6. default budget and model policy

## Required Files

The platform should expect these paths in a twin package repository:

```text
twin/
  digital-twin.yaml
  capabilities.md
  input-contracts.md
  output-contracts.md
  memory-policy.md
```

Additional optional files may exist, but these are the minimum import contract.

## Manifest: `twin/digital-twin.yaml`

This is the canonical machine-readable definition of the twin package.

Required fields:

- `manifest_version`
- `twin_version`
- `twin_id`
- `display_name`
- `owner_name`
- `owner_role`
- `description`
- `analysis_only`
- `capabilities`
- `accepted_inputs`
- `produced_outputs`
- `default_model_profiles`
- `default_budget_policy`
- `memory_policy`

Suggested v1 structure:

```yaml
manifest_version: "1.0"
twin_version: "0.1.0"
twin_id: filip
display_name: "Digital Twin Filip"
owner_name: "Filip Szalewicz"
owner_role: "Head of Engineering / Principal Operator"
description: "Portable digital twin package for strategy, architecture, planning, and artifact analysis."
analysis_only: true
capabilities:
  - architecture_review
  - project_review
  - strategy_review
  - planning
accepted_inputs:
  - github_url
  - file_upload
  - markdown
  - pdf
  - freeform_text
produced_outputs:
  - chat_response
  - markdown_report
  - structured_json
  - generated_file
default_model_profiles:
  fast:
    provider: xai
    model: grok-4.2
  balanced:
    provider: xai
    model: grok-4.2
  deep:
    provider: xai
    model: grok-4.2
default_budget_policy:
  daily_token_limit: 500000
  allowed_models:
    - xai/grok-4.2
    - openai/chatgpt-default
memory_policy:
  portable_memory_exportable: true
  factory_memory_exportable: false
```

## Capabilities Document

`twin/capabilities.md` must describe:

- what the twin is good at
- what kinds of requests it handles well
- what it does not do in v1
- expected output types
- areas requiring careful review

This is used for discovery and operator onboarding.

## Input Contracts

`twin/input-contracts.md` must define:

- supported input types
- size or complexity limits if known
- expected metadata for each input type
- failure modes or unsupported cases

Required v1 supported input types should be declared from this set:

- `freeform_text`
- `github_url`
- `http_url`
- `file_upload`
- `markdown`
- `pdf`
- `json_payload`

## Output Contracts

`twin/output-contracts.md` must define:

- supported output types
- when each output type is produced
- formatting expectations
- whether the output is exportable

Required v1 output types should be declared from this set:

- `chat_response`
- `markdown_report`
- `structured_json`
- `generated_file`
- `artifact_bundle`

## Memory Policy

`twin/memory-policy.md` must define:

- what counts as portable memory
- what must remain factory-scoped
- what requires review before promotion
- what can be exported when the twin leaves a factory

Required policy statements:

- portable memory may be exported
- factory-scoped data may not be exported by default
- promotion of learning from factory data requires abstraction and approval

## Budget and Model Defaults

The twin package should provide default guidance, not final authority.

Final authority belongs to the deployment overlay and factory policy.

Required defaults:

- allowed model list
- preferred model profiles
- daily token guidance
- analysis-only confirmation

Each profile should declare both provider and model so a deployment can either inherit or override the preferred runtime cleanly.

## Import Validation Rules

The platform should reject import if:

- manifest file is missing
- `analysis_only` is false in v1
- no capabilities are declared
- no accepted input types are declared
- no produced output types are declared
- memory policy is missing
- default budget policy is missing

## Versioning Rules

Twin packages should be versioned independently from the factory platform.

Required manifest version fields:

- `manifest_version`
- `twin_version`

The platform should store:

- package source repo
- branch, tag, or commit
- import timestamp
- imported manifest version

## Optional Future Extensions

Not required in v1, but worth reserving space for later:

- agent API exposure rules
- voice profile settings
- external tool declarations
- evaluation suites
- portable memory export package format

## Summary

The twin package contract exists to make onboarding predictable.

The package defines the portable twin.

The factory deployment contract defines how that twin operates in a specific factory.
