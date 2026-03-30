import test from "node:test";
import assert from "node:assert/strict";
import { synthesizeConversationSummary } from "../lib/server/hitl.ts";
import type { ConversationRecord, MessageRecord, RunRecord } from "../lib/server/types.ts";

test("synthesizeConversationSummary includes recent context and open questions", () => {
  const conversation: ConversationRecord = {
    id: "conversation-1",
    factoryId: "factory-1",
    deploymentId: "filip__factory-1",
    channelType: "web_chat",
    requesterId: "user-1",
    status: "open",
    title: "Review my architecture",
    createdAt: "2026-03-29T10:00:00.000Z",
    lastActivityAt: "2026-03-29T10:05:00.000Z"
  };
  const messages: MessageRecord[] = [
    {
      id: "message-1",
      conversationId: conversation.id,
      direction: "inbound",
      authorType: "human",
      authorId: "user-1",
      body: "Please review this architecture and tell me what should change.",
      createdAt: "2026-03-29T10:01:00.000Z"
    },
    {
      id: "message-2",
      conversationId: conversation.id,
      direction: "outbound",
      authorType: "digital_twin",
      authorId: "filip",
      body: "I need a human decision before finalizing the recommendation.",
      createdAt: "2026-03-29T10:02:00.000Z"
    }
  ];
  const run: RunRecord = {
    id: "run-1",
    jobId: "job-1",
    deploymentId: conversation.deploymentId,
    conversationId: conversation.id,
    status: "completed"
  };

  const summary = synthesizeConversationSummary({
    conversation,
    messages,
    run,
    reasonCode: "human_judgment_required"
  });

  assert.equal(summary.summaryType, "hitl_handoff");
  assert.equal(summary.isHandoffReady, true);
  assert.match(summary.content, /Review my architecture/);
  assert.match(summary.content, /human_judgment_required/);
  assert.equal(summary.openQuestions.length >= 1, true);
  assert.equal(summary.recommendedNextSteps.length, 3);
});
