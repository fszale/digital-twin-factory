import { randomUUID } from "node:crypto";
import type {
  ConversationRecord,
  ConversationSummaryRecord,
  DeploymentAccessRecord,
  DeploymentConfigRecord,
  DeliveryStatus,
  HitlEscalationRecord,
  MessageRecord,
  NotificationDeliveryRecord,
  PlatformRole,
  PlatformUserRecord,
  RunRecord
} from "./types.ts";

function nowIso(): string {
  return new Date().toISOString();
}

export class MemoryRepository {
  private conversations = new Map<string, ConversationRecord>();
  private messages = new Map<string, MessageRecord[]>();
  private runs = new Map<string, RunRecord>();
  private summaries = new Map<string, ConversationSummaryRecord[]>();
  private escalations = new Map<string, HitlEscalationRecord>();
  private deliveries = new Map<string, NotificationDeliveryRecord[]>();
  private deploymentConfigs = new Map<string, DeploymentConfigRecord>();
  private platformUsers = new Map<string, PlatformUserRecord>();
  private deploymentAccess = new Map<string, DeploymentAccessRecord>();

  async createConversation(input: Omit<ConversationRecord, "id" | "createdAt" | "lastActivityAt">): Promise<ConversationRecord> {
    const now = nowIso();
    const record: ConversationRecord = {
      id: randomUUID(),
      createdAt: now,
      lastActivityAt: now,
      ...input
    };
    this.conversations.set(record.id, record);
    this.messages.set(record.id, []);
    return record;
  }

  async getConversation(conversationId: string): Promise<ConversationRecord | undefined> {
    return this.conversations.get(conversationId);
  }

  async listConversationsForDeployment(deploymentId: string): Promise<ConversationRecord[]> {
    return [...this.conversations.values()]
      .filter((conversation) => conversation.deploymentId === deploymentId)
      .sort((left, right) => right.lastActivityAt.localeCompare(left.lastActivityAt));
  }

  async listConversationMessages(conversationId: string): Promise<MessageRecord[]> {
    return this.messages.get(conversationId) ?? [];
  }

  async appendMessage(input: Omit<MessageRecord, "id" | "createdAt">): Promise<MessageRecord> {
    const conversation = this.conversations.get(input.conversationId);
    if (!conversation) {
      throw new Error("conversation_not_found");
    }
    const record: MessageRecord = {
      id: randomUUID(),
      createdAt: nowIso(),
      ...input
    };
    conversation.lastActivityAt = record.createdAt;
    this.messages.set(input.conversationId, [...(this.messages.get(input.conversationId) ?? []), record]);
    return record;
  }

  async createRun(input: Omit<RunRecord, "id">): Promise<RunRecord> {
    const record: RunRecord = { id: randomUUID(), ...input };
    this.runs.set(record.id, record);
    return record;
  }

  async getRun(runId: string): Promise<RunRecord | undefined> {
    return this.runs.get(runId);
  }

  async createConversationSummary(
    input: Omit<ConversationSummaryRecord, "id" | "createdAt">
  ): Promise<ConversationSummaryRecord> {
    const record: ConversationSummaryRecord = {
      id: randomUUID(),
      createdAt: nowIso(),
      ...input
    };
    this.summaries.set(record.conversationId, [...(this.summaries.get(record.conversationId) ?? []), record]);
    return record;
  }

  async getLatestConversationSummary(conversationId: string): Promise<ConversationSummaryRecord | undefined> {
    const records = this.summaries.get(conversationId) ?? [];
    return [...records].sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  }

  async createHitlEscalation(
    input: Omit<HitlEscalationRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<HitlEscalationRecord> {
    const now = nowIso();
    const record: HitlEscalationRecord = {
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
      ...input
    };
    this.escalations.set(record.id, record);
    return record;
  }

  async getHitlEscalation(escalationId: string): Promise<HitlEscalationRecord | undefined> {
    return this.escalations.get(escalationId);
  }

  async listEscalationsForDeployment(deploymentId: string): Promise<HitlEscalationRecord[]> {
    return [...this.escalations.values()].filter((item) => item.deploymentId === deploymentId);
  }

  async updateHitlEscalation(
    escalationId: string,
    input: Partial<
      Pick<
        HitlEscalationRecord,
        "status" | "deliveryStatus" | "requestedHumanId" | "responseDueAt" | "resolutionSummary" | "resolvedByAuthUserId" | "resolvedAt"
      >
    >
  ): Promise<HitlEscalationRecord | undefined> {
    const existing = this.escalations.get(escalationId);
    if (!existing) {
      return undefined;
    }
    const patch = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined)
    ) as Partial<HitlEscalationRecord>;
    const updated: HitlEscalationRecord = {
      ...existing,
      ...patch,
      updatedAt: nowIso()
    };
    this.escalations.set(escalationId, updated);
    return updated;
  }

  async createNotificationDeliveries(
    inputs: Array<Omit<NotificationDeliveryRecord, "id" | "createdAt">>
  ): Promise<NotificationDeliveryRecord[]> {
    const records = inputs.map((input) => ({
      id: randomUUID(),
      createdAt: nowIso(),
      ...input
    }));
    for (const record of records) {
      this.deliveries.set(record.escalationId, [...(this.deliveries.get(record.escalationId) ?? []), record]);
    }
    return records;
  }

  async listNotificationDeliveries(escalationId: string): Promise<NotificationDeliveryRecord[]> {
    return this.deliveries.get(escalationId) ?? [];
  }

  async markNotificationDeliveriesSent(
    escalationId: string,
    channels?: string[]
  ): Promise<NotificationDeliveryRecord[]> {
    const records = [...(this.deliveries.get(escalationId) ?? [])];
    const sentAt = nowIso();
    const updated = records.map((record) => {
      if (channels && !channels.includes(record.channelType)) {
        return record;
      }
      return { ...record, status: "sent" as DeliveryStatus, sentAt };
    });
    this.deliveries.set(escalationId, updated);
    return updated.filter((record) => !channels || channels.includes(record.channelType));
  }

  async getDeploymentConfig(deploymentId: string): Promise<DeploymentConfigRecord | undefined> {
    return this.deploymentConfigs.get(deploymentId);
  }

  async upsertDeploymentConfig(
    input: Omit<DeploymentConfigRecord, "createdAt" | "updatedAt">
  ): Promise<DeploymentConfigRecord> {
    const now = nowIso();
    const existing = this.deploymentConfigs.get(input.deploymentId);
    const record: DeploymentConfigRecord = {
      ...input,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    this.deploymentConfigs.set(record.deploymentId, record);
    return record;
  }

  async listPlatformUsers(role?: PlatformRole): Promise<PlatformUserRecord[]> {
    const users = [...this.platformUsers.values()];
    return role ? users.filter((user) => user.platformRole === role) : users;
  }

  async upsertPlatformUser(
    input: Omit<PlatformUserRecord, "createdAt" | "updatedAt">
  ): Promise<PlatformUserRecord> {
    const now = nowIso();
    const existing = this.platformUsers.get(input.authUserId);
    const record: PlatformUserRecord = {
      ...input,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now
    };
    this.platformUsers.set(record.authUserId, record);
    return record;
  }

  async grantDeploymentAccess(
    input: Omit<DeploymentAccessRecord, "id" | "createdAt">
  ): Promise<DeploymentAccessRecord> {
    const existing = [...this.deploymentAccess.values()].find(
      (record) => record.deploymentId === input.deploymentId && record.authUserId === input.authUserId
    );
    const record: DeploymentAccessRecord = {
      id: existing?.id ?? randomUUID(),
      createdAt: existing?.createdAt ?? nowIso(),
      ...input
    };
    this.deploymentAccess.set(record.id, record);
    return record;
  }
}
