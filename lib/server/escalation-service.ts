import { synthesizeConversationSummary } from "./hitl.ts";
import type { Repository } from "./repository.ts";
import type { ConversationSummaryRecord, HitlEscalationRecord, NotificationDeliveryRecord } from "./types.ts";

export interface CreateHitlEscalationInput {
  runId: string;
  reasonCode: string;
  notifyChannels?: Array<"dashboard" | "slack" | "email">;
  requestedHumanId?: string;
  responseDueAt?: string;
  recipientRef?: string;
}

export interface CreateHitlEscalationResult {
  escalation: HitlEscalationRecord;
  summary: ConversationSummaryRecord;
  deliveries: NotificationDeliveryRecord[];
}

export async function createHitlEscalationFromRun(
  repository: Repository,
  input: CreateHitlEscalationInput
): Promise<CreateHitlEscalationResult> {
  const run = await repository.getRun(input.runId);
  if (!run) {
    throw new Error("run_not_found");
  }

  const conversation = await repository.getConversation(run.conversationId);
  if (!conversation) {
    throw new Error("conversation_not_found");
  }

  const messages = await repository.listConversationMessages(conversation.id);
  const summary = await repository.createConversationSummary(
    synthesizeConversationSummary({
      conversation,
      messages,
      run,
      reasonCode: input.reasonCode
    })
  );

  const escalation = await repository.createHitlEscalation({
    deploymentId: run.deploymentId,
    conversationId: conversation.id,
    jobId: run.jobId,
    runId: run.id,
    conversationSummaryId: summary.id,
    status: "open",
    reasonCode: input.reasonCode,
    requestedHumanId: input.requestedHumanId,
    deliveryStatus: "pending",
    responseDueAt: input.responseDueAt
  });

  const notifyChannels = input.notifyChannels?.length ? input.notifyChannels : ["dashboard"];
  const deliveries = await repository.createNotificationDeliveries(
    notifyChannels.map((channelType) => ({
      escalationId: escalation.id,
      subjectType: "hitl_escalation",
      subjectId: escalation.id,
      channelType,
      recipientRef: input.recipientRef,
      status: channelType === "dashboard" ? "sent" : "pending",
      sentAt: channelType === "dashboard" ? new Date().toISOString() : undefined
    }))
  );

  return { escalation, summary, deliveries };
}
