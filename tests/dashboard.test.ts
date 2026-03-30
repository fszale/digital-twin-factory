import test from "node:test";
import assert from "node:assert/strict";
import { getDeploymentDashboardData } from "../lib/server/dashboard.ts";
import { MemoryRepository } from "../lib/server/store.ts";
import { createHitlEscalationFromRun } from "../lib/server/escalation-service.ts";

test("getDeploymentDashboardData returns conversations with summaries and escalations", async () => {
  const repository = new MemoryRepository();
  await repository.upsertDeploymentConfig({
    deploymentId: "filip__factory-1",
    factoryId: "factory-1",
    digitalTwinId: "filip",
    analysisOnly: true,
    preferredModelProvider: "xai",
    preferredModel: "grok-4.2",
    preferredModelProfile: "deep",
    allowedModels: ["xai/grok-4.2"],
    enabledChannels: ["slack"]
  });
  const conversation = await repository.createConversation({
    factoryId: "factory-1",
    deploymentId: "filip__factory-1",
    channelType: "slack",
    requesterId: "user-1",
    status: "open",
    title: "Architecture review"
  });

  await repository.appendMessage({
    conversationId: conversation.id,
    direction: "inbound",
    authorType: "human",
    authorId: "user-1",
    body: "Review this architecture and tell me what the human should decide."
  });

  const run = await repository.createRun({
    jobId: "job-1",
    deploymentId: conversation.deploymentId,
    conversationId: conversation.id,
    status: "completed"
  });

  await createHitlEscalationFromRun(repository, {
    runId: run.id,
    reasonCode: "human_judgment_required",
    notifyChannels: ["dashboard"]
  });

  const dashboard = await getDeploymentDashboardData(repository, conversation.deploymentId);

  assert.equal(dashboard.conversations.length, 1);
  assert.equal(dashboard.escalations.length, 1);
  assert.equal(dashboard.deploymentConfig?.preferredModel, "grok-4.2");
  assert.equal(dashboard.conversations[0]?.latestSummary?.isHandoffReady, true);
  assert.equal(dashboard.escalations[0]?.deliveries.length, 1);
});
