export type ConversationStatus = "open" | "waiting_for_user" | "in_progress" | "completed" | "archived";
export type DeliveryStatus = "pending" | "sent" | "failed";
export type EscalationStatus = "open" | "notified" | "resolved" | "cancelled";
export type PlatformRole = "super_admin" | "twin_owner";
export type ModelProvider = "openai" | "xai";
export type DeploymentAccessRole = "owner";

export interface ConversationRecord {
  id: string;
  factoryId: string;
  workspaceId?: string;
  deploymentId: string;
  channelType: string;
  requesterId: string;
  status: ConversationStatus;
  title?: string;
  externalThreadRef?: string;
  createdAt: string;
  lastActivityAt: string;
}

export interface MessageRecord {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  authorType: "human" | "digital_twin" | "system";
  authorId: string;
  body: string;
  structuredPayload?: Record<string, unknown>;
  createdAt: string;
}

export interface RunRecord {
  id: string;
  jobId: string;
  deploymentId: string;
  conversationId: string;
  status: string;
  modelProvider?: ModelProvider;
  modelProfile?: string;
  modelName?: string;
  usefulnessScore?: number;
  scoreConfidence?: number;
  startedAt?: string;
  completedAt?: string;
}

export interface ConversationSummaryRecord {
  id: string;
  conversationId: string;
  deploymentId: string;
  sourceRunId?: string;
  summaryType: "latest_context" | "hitl_handoff";
  content: string;
  openQuestions: string[];
  recommendedNextSteps: string[];
  confidenceScore?: number;
  isHandoffReady: boolean;
  createdAt: string;
}

export interface HitlEscalationRecord {
  id: string;
  deploymentId: string;
  conversationId: string;
  jobId?: string;
  runId?: string;
  conversationSummaryId?: string;
  status: EscalationStatus;
  reasonCode: string;
  requestedHumanId?: string;
  deliveryStatus: DeliveryStatus;
  responseDueAt?: string;
  resolutionSummary?: string;
  resolvedByAuthUserId?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NotificationDeliveryRecord {
  id: string;
  escalationId: string;
  subjectType: "hitl_escalation";
  subjectId: string;
  channelType: "dashboard" | "slack" | "email";
  recipientRef?: string;
  status: DeliveryStatus;
  sentAt?: string;
  failedAt?: string;
  failureReason?: string;
  createdAt: string;
}

export interface AuthenticatedUser {
  authUserId: string;
  email?: string;
  platformRole: PlatformRole;
  deploymentIds: string[];
}

export interface PlatformUserRecord {
  authUserId: string;
  email?: string;
  platformRole: PlatformRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeploymentAccessRecord {
  id: string;
  deploymentId: string;
  authUserId: string;
  role: DeploymentAccessRole;
  createdAt: string;
}

export interface DeploymentConfigRecord {
  deploymentId: string;
  factoryId: string;
  digitalTwinId: string;
  displayName?: string;
  analysisOnly: true;
  preferredModelProvider: ModelProvider;
  preferredModel: string;
  preferredModelProfile: string;
  fallbackModelProvider?: ModelProvider;
  fallbackModel?: string;
  allowedModels: string[];
  enabledChannels: string[];
  dailyTokenLimit?: number;
  maxCostPerDay?: number;
  alertAtPct?: number;
  requestedHumanId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreData {
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  runs: RunRecord[];
  conversationSummaries: ConversationSummaryRecord[];
  hitlEscalations: HitlEscalationRecord[];
  notificationDeliveries: NotificationDeliveryRecord[];
}
