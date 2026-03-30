import type { ConversationRecord, ConversationSummaryRecord, MessageRecord, RunRecord } from "./types.ts";

function trimLines(value: string, maxLines: number): string {
  return value
    .split("\n")
    .filter(Boolean)
    .slice(0, maxLines)
    .join("\n");
}

export function synthesizeConversationSummary(input: {
  conversation: ConversationRecord;
  messages: MessageRecord[];
  run?: RunRecord;
  reasonCode: string;
}): Omit<ConversationSummaryRecord, "id" | "createdAt"> {
  const latestMessages = input.messages.slice(-6);
  const transcriptSnippet = latestMessages
    .map((message) => `${message.authorType}: ${trimLines(message.body, 2)}`)
    .join("\n");

  const lastHumanMessage = [...input.messages].reverse().find((message) => message.authorType === "human");
  const openQuestions = lastHumanMessage
    ? [
        `Confirm how to respond to the latest requester message: "${trimLines(lastHumanMessage.body, 1)}"`,
        `Resolve escalation reason: ${input.reasonCode}`
      ]
    : [`Resolve escalation reason: ${input.reasonCode}`];

  const recommendedNextSteps = [
    "Review the synthesized conversation context in the dashboard.",
    "Decide whether to respond directly, guide the twin, or request more input.",
    "Capture the resolution so the deployment can learn from the HITL outcome."
  ];

  const content = [
    `Conversation title: ${input.conversation.title ?? "Untitled conversation"}`,
    `Requester: ${input.conversation.requesterId}`,
    `Channel: ${input.conversation.channelType}`,
    `Escalation reason: ${input.reasonCode}`,
    input.run ? `Run status: ${input.run.status}` : "Run status: no bound run provided",
    "",
    "Recent context:",
    transcriptSnippet || "No messages recorded yet."
  ].join("\n");

  return {
    conversationId: input.conversation.id,
    deploymentId: input.conversation.deploymentId,
    sourceRunId: input.run?.id,
    summaryType: "hitl_handoff",
    content,
    openQuestions,
    recommendedNextSteps,
    confidenceScore: 0.72,
    isHandoffReady: true
  };
}
