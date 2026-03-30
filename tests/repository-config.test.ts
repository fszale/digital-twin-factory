import assert from "node:assert/strict";
import test from "node:test";

import { MemoryRepository } from "../lib/server/store.ts";

test("MemoryRepository stores deployment configs and escalation resolution state", async () => {
  const repository = new MemoryRepository();

  const config = await repository.upsertDeploymentConfig({
    deploymentId: "filip__factory-1",
    factoryId: "factory-1",
    digitalTwinId: "filip",
    analysisOnly: true,
    preferredModelProvider: "xai",
    preferredModel: "grok-4.2",
    preferredModelProfile: "deep",
    fallbackModelProvider: "openai",
    fallbackModel: "chatgpt-default",
    allowedModels: ["xai/grok-4.2", "openai/chatgpt-default"],
    enabledChannels: ["web_chat", "slack"],
    dailyTokenLimit: 300000,
    maxCostPerDay: 25,
    alertAtPct: 0.8,
    requestedHumanId: "filip-owner"
  });

  assert.equal(config.preferredModelProvider, "xai");

  const conversation = await repository.createConversation({
    factoryId: "factory-1",
    deploymentId: "filip__factory-1",
    channelType: "web_chat",
    requesterId: "user-1",
    status: "open"
  });

  const escalation = await repository.createHitlEscalation({
    deploymentId: conversation.deploymentId,
    conversationId: conversation.id,
    status: "open",
    reasonCode: "human_judgment_required",
    deliveryStatus: "pending"
  });

  const updated = await repository.updateHitlEscalation(escalation.id, {
    status: "resolved",
    resolutionSummary: "Resolved by owner.",
    resolvedByAuthUserId: "owner-1",
    resolvedAt: "2026-03-29T00:00:00.000Z"
  });

  assert.equal(updated?.status, "resolved");
  assert.equal(updated?.resolutionSummary, "Resolved by owner.");
  assert.equal(updated?.resolvedByAuthUserId, "owner-1");
  assert.equal((await repository.getDeploymentConfig("filip__factory-1"))?.preferredModel, "grok-4.2");
});
