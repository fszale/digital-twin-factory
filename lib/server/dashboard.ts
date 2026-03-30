import type { Repository } from "./repository.ts";
import type {
  ConversationRecord,
  ConversationSummaryRecord,
  DeploymentConfigRecord,
  HitlEscalationRecord,
  NotificationDeliveryRecord
} from "./types.ts";

export interface DeploymentConversationView {
  conversation: ConversationRecord;
  latestSummary?: ConversationSummaryRecord;
}

export interface DeploymentEscalationView {
  escalation: HitlEscalationRecord;
  deliveries: NotificationDeliveryRecord[];
  latestSummary?: ConversationSummaryRecord;
}

export interface DeploymentDashboardData {
  deploymentId: string;
  deploymentConfig?: DeploymentConfigRecord;
  conversations: DeploymentConversationView[];
  escalations: DeploymentEscalationView[];
}

export async function getDeploymentDashboardData(
  repository: Repository,
  deploymentId: string
): Promise<DeploymentDashboardData> {
  const [deploymentConfig, conversations, escalations] = await Promise.all([
    repository.getDeploymentConfig(deploymentId),
    repository.listConversationsForDeployment(deploymentId),
    repository.listEscalationsForDeployment(deploymentId)
  ]);

  const conversationViews = await Promise.all(
    conversations.map(async (conversation) => ({
      conversation,
      latestSummary: await repository.getLatestConversationSummary(conversation.id)
    }))
  );

  const escalationViews = await Promise.all(
    escalations.map(async (escalation) => ({
      escalation,
      deliveries: await repository.listNotificationDeliveries(escalation.id),
      latestSummary: await repository.getLatestConversationSummary(escalation.conversationId)
    }))
  );

  return {
    deploymentId,
    deploymentConfig,
    conversations: conversationViews,
    escalations: escalationViews
  };
}
