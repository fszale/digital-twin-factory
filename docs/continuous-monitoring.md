# Continuous Monitoring

## Purpose

Define the ongoing monitoring process that keeps `digital-twin-factory` aligned with the evaluation plan.

## Monitoring Objectives

- detect regressions early
- verify access boundaries continuously
- confirm that twins remain useful and improving
- catch operational failures before they erode trust

## Monitoring Categories

### Access Monitoring

Track:

- failed authentication attempts
- forbidden access attempts
- unexpected cross-deployment access attempts
- super-admin actions

### Workflow Monitoring

Track:

- conversations created
- runs completed
- summaries synthesized
- HITL escalations created
- notifications delivered

### Quality Monitoring

Track:

- usefulness score
- useful completion rate
- clarification burden
- correction burden
- escalation sufficiency

### Reliability Monitoring

Track:

- API error rate
- Supabase request failure rate
- notification failure rate
- dashboard query latency

## Monitoring Process

1. collect operational signals continuously
2. aggregate them into daily and weekly snapshots
3. compare them against thresholds and baselines
4. alert when thresholds break
5. review alerts in weekly operational review
6. feed repeated issues into the improvement backlog

## Suggested Alerts

- repeated auth failures from the same user
- unauthorized access to a foreign deployment
- notification failure rate above threshold
- usefulness score drops more than 10% week over week
- useful completion rate drops for 2 consecutive weeks
- escalation rate spikes unexpectedly

## Operating Review

Weekly review should answer:

- is the factory working as intended?
- are twin owners able to manage their own HITL queues?
- can the super admin see and act on system-wide issues?
- are twins becoming more useful?
- are repeated failures getting converted into improvements?
