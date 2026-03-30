import test from "node:test";
import assert from "node:assert/strict";
import { createHitlEscalationFromRun } from "../lib/server/escalation-service.ts";
import { MemoryRepository } from "../lib/server/store.ts";

test("createHitlEscalationFromRun creates summary, escalation, and deliveries", async () => {
  const repository = new MemoryRepository();
  const conversation = await repository.createConversation({
    factoryId: "factory-1",
    deploymentId: "filip__factory-1",
    channelType: "web_chat",
    requesterId: "user-1",
    status: "open",
    title: "Need review"
  });

  await repository.appendMessage({
    conversationId: conversation.id,
    direction: "inbound",
    authorType: "human",
    authorId: "user-1",
    body: "Please review this and tell me if I should proceed."
  });

  const run = await repository.createRun({
    jobId: "job-1",
    deploymentId: conversation.deploymentId,
    conversationId: conversation.id,
    status: "completed"
  });

  const result = await createHitlEscalationFromRun(repository, {
    runId: run.id,
    reasonCode: "human_judgment_required",
    notifyChannels: ["dashboard", "slack"],
    requestedHumanId: "filip-owner"
  });

  assert.equal(result.summary.isHandoffReady, true);
  assert.equal(result.escalation.runId, run.id);
  assert.equal(result.escalation.reasonCode, "human_judgment_required");
  assert.equal(result.deliveries.length, 2);
  assert.equal(result.deliveries.some((delivery) => delivery.channelType === "dashboard"), true);
  assert.equal(result.deliveries.some((delivery) => delivery.channelType === "slack"), true);
});
