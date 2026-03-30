import type {
  ConversationRecord,
  ConversationSummaryRecord,
  DeploymentAccessRecord,
  DeploymentConfigRecord,
  HitlEscalationRecord,
  MessageRecord,
  NotificationDeliveryRecord,
  PlatformRole,
  PlatformUserRecord,
  RunRecord
} from "./types.ts";
import { requireSupabaseEnv } from "./env.ts";
import { MemoryRepository } from "./store.ts";

export interface Repository {
  createConversation(input: Omit<ConversationRecord, "id" | "createdAt" | "lastActivityAt">): Promise<ConversationRecord>;
  getConversation(conversationId: string): Promise<ConversationRecord | undefined>;
  listConversationsForDeployment(deploymentId: string): Promise<ConversationRecord[]>;
  listConversationMessages(conversationId: string): Promise<MessageRecord[]>;
  appendMessage(input: Omit<MessageRecord, "id" | "createdAt">): Promise<MessageRecord>;
  createRun(input: Omit<RunRecord, "id">): Promise<RunRecord>;
  getRun(runId: string): Promise<RunRecord | undefined>;
  createConversationSummary(
    input: Omit<ConversationSummaryRecord, "id" | "createdAt">
  ): Promise<ConversationSummaryRecord>;
  getLatestConversationSummary(conversationId: string): Promise<ConversationSummaryRecord | undefined>;
  createHitlEscalation(input: Omit<HitlEscalationRecord, "id" | "createdAt" | "updatedAt">): Promise<HitlEscalationRecord>;
  getHitlEscalation(escalationId: string): Promise<HitlEscalationRecord | undefined>;
  listEscalationsForDeployment(deploymentId: string): Promise<HitlEscalationRecord[]>;
  updateHitlEscalation(
    escalationId: string,
    input: Partial<
      Pick<
        HitlEscalationRecord,
        "status" | "deliveryStatus" | "requestedHumanId" | "responseDueAt" | "resolutionSummary" | "resolvedByAuthUserId" | "resolvedAt"
      >
    >
  ): Promise<HitlEscalationRecord | undefined>;
  createNotificationDeliveries(
    inputs: Array<Omit<NotificationDeliveryRecord, "id" | "createdAt">>
  ): Promise<NotificationDeliveryRecord[]>;
  listNotificationDeliveries(escalationId: string): Promise<NotificationDeliveryRecord[]>;
  markNotificationDeliveriesSent(escalationId: string, channels?: string[]): Promise<NotificationDeliveryRecord[]>;
  getDeploymentConfig(deploymentId: string): Promise<DeploymentConfigRecord | undefined>;
  upsertDeploymentConfig(
    input: Omit<DeploymentConfigRecord, "createdAt" | "updatedAt">
  ): Promise<DeploymentConfigRecord>;
  listPlatformUsers(role?: PlatformRole): Promise<PlatformUserRecord[]>;
  upsertPlatformUser(input: Omit<PlatformUserRecord, "createdAt" | "updatedAt">): Promise<PlatformUserRecord>;
  grantDeploymentAccess(input: Omit<DeploymentAccessRecord, "id" | "createdAt">): Promise<DeploymentAccessRecord>;
}

interface SupabaseEnv {
  url: string;
  serviceRoleKey: string;
}

type FetchLike = typeof fetch;

function queryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      search.set(key, value);
    }
  }
  return search.toString();
}

type SupabaseConversationRow = {
  id: string;
  factory_id: string;
  workspace_id: string | null;
  deployment_id: string;
  channel_type: string;
  requester_id: string;
  status: string;
  title: string | null;
  external_thread_ref: string | null;
  created_at: string;
  last_activity_at: string;
};

type SupabaseMessageRow = {
  id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  author_type: "human" | "digital_twin" | "system";
  author_id: string;
  body: string;
  structured_payload: Record<string, unknown> | null;
  created_at: string;
};

type SupabaseRunRow = {
  id: string;
  job_id: string;
  deployment_id: string;
  conversation_id: string;
  status: string;
  model_provider: "openai" | "xai" | null;
  model_profile: string | null;
  model_name: string | null;
  usefulness_score: number | null;
  score_confidence: number | null;
  started_at: string | null;
  completed_at: string | null;
};

type SupabaseConversationSummaryRow = {
  id: string;
  conversation_id: string;
  deployment_id: string;
  source_run_id: string | null;
  summary_type: "latest_context" | "hitl_handoff";
  content: string;
  open_questions: string[] | null;
  recommended_next_steps: string[] | null;
  confidence_score: number | null;
  is_handoff_ready: boolean;
  created_at: string;
};

type SupabaseHitlEscalationRow = {
  id: string;
  deployment_id: string;
  conversation_id: string;
  job_id: string | null;
  run_id: string | null;
  conversation_summary_id: string | null;
  status: string;
  reason_code: string;
  requested_human_id: string | null;
  delivery_status: string;
  response_due_at: string | null;
  resolution_summary: string | null;
  resolved_by_auth_user_id: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

type SupabaseNotificationDeliveryRow = {
  id: string;
  escalation_id: string;
  subject_type: "hitl_escalation";
  subject_id: string;
  channel_type: "dashboard" | "slack" | "email";
  recipient_ref: string | null;
  status: string;
  sent_at: string | null;
  failed_at: string | null;
  failure_reason: string | null;
  created_at: string;
};

type SupabaseDeploymentConfigRow = {
  deployment_id: string;
  factory_id: string;
  digital_twin_id: string;
  display_name: string | null;
  analysis_only: boolean;
  preferred_model_provider: "openai" | "xai";
  preferred_model: string;
  preferred_model_profile: string;
  fallback_model_provider: "openai" | "xai" | null;
  fallback_model: string | null;
  allowed_models: string[] | null;
  enabled_channels: string[] | null;
  daily_token_limit: number | null;
  max_cost_per_day: number | null;
  alert_at_pct: number | null;
  requested_human_id: string | null;
  created_at: string;
  updated_at: string;
};

type SupabasePlatformUserRow = {
  auth_user_id: string;
  email: string | null;
  role: PlatformRole;
  created_at: string;
  updated_at: string;
};

type SupabaseDeploymentAccessRow = {
  id: string;
  deployment_id: string;
  auth_user_id: string;
  role: "owner";
  created_at: string;
};

function mapConversation(row: SupabaseConversationRow): ConversationRecord {
  return {
    id: row.id,
    factoryId: row.factory_id,
    workspaceId: row.workspace_id ?? undefined,
    deploymentId: row.deployment_id,
    channelType: row.channel_type,
    requesterId: row.requester_id,
    status: row.status as ConversationRecord["status"],
    title: row.title ?? undefined,
    externalThreadRef: row.external_thread_ref ?? undefined,
    createdAt: row.created_at,
    lastActivityAt: row.last_activity_at
  };
}

function mapMessage(row: SupabaseMessageRow): MessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    direction: row.direction,
    authorType: row.author_type,
    authorId: row.author_id,
    body: row.body,
    structuredPayload: row.structured_payload ?? undefined,
    createdAt: row.created_at
  };
}

function mapRun(row: SupabaseRunRow): RunRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    deploymentId: row.deployment_id,
    conversationId: row.conversation_id,
    status: row.status,
    modelProvider: row.model_provider ?? undefined,
    modelProfile: row.model_profile ?? undefined,
    modelName: row.model_name ?? undefined,
    usefulnessScore: row.usefulness_score ?? undefined,
    scoreConfidence: row.score_confidence ?? undefined,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined
  };
}

function mapSummary(row: SupabaseConversationSummaryRow): ConversationSummaryRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    deploymentId: row.deployment_id,
    sourceRunId: row.source_run_id ?? undefined,
    summaryType: row.summary_type,
    content: row.content,
    openQuestions: row.open_questions ?? [],
    recommendedNextSteps: row.recommended_next_steps ?? [],
    confidenceScore: row.confidence_score ?? undefined,
    isHandoffReady: row.is_handoff_ready,
    createdAt: row.created_at
  };
}

function mapEscalation(row: SupabaseHitlEscalationRow): HitlEscalationRecord {
  return {
    id: row.id,
    deploymentId: row.deployment_id,
    conversationId: row.conversation_id,
    jobId: row.job_id ?? undefined,
    runId: row.run_id ?? undefined,
    conversationSummaryId: row.conversation_summary_id ?? undefined,
    status: row.status as HitlEscalationRecord["status"],
    reasonCode: row.reason_code,
    requestedHumanId: row.requested_human_id ?? undefined,
    deliveryStatus: row.delivery_status as HitlEscalationRecord["deliveryStatus"],
    responseDueAt: row.response_due_at ?? undefined,
    resolutionSummary: row.resolution_summary ?? undefined,
    resolvedByAuthUserId: row.resolved_by_auth_user_id ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDelivery(row: SupabaseNotificationDeliveryRow): NotificationDeliveryRecord {
  return {
    id: row.id,
    escalationId: row.escalation_id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    channelType: row.channel_type,
    recipientRef: row.recipient_ref ?? undefined,
    status: row.status as NotificationDeliveryRecord["status"],
    sentAt: row.sent_at ?? undefined,
    failedAt: row.failed_at ?? undefined,
    failureReason: row.failure_reason ?? undefined,
    createdAt: row.created_at
  };
}

function mapDeploymentConfig(row: SupabaseDeploymentConfigRow): DeploymentConfigRecord {
  return {
    deploymentId: row.deployment_id,
    factoryId: row.factory_id,
    digitalTwinId: row.digital_twin_id,
    displayName: row.display_name ?? undefined,
    analysisOnly: true,
    preferredModelProvider: row.preferred_model_provider,
    preferredModel: row.preferred_model,
    preferredModelProfile: row.preferred_model_profile,
    fallbackModelProvider: row.fallback_model_provider ?? undefined,
    fallbackModel: row.fallback_model ?? undefined,
    allowedModels: row.allowed_models ?? [],
    enabledChannels: row.enabled_channels ?? [],
    dailyTokenLimit: row.daily_token_limit ?? undefined,
    maxCostPerDay: row.max_cost_per_day ?? undefined,
    alertAtPct: row.alert_at_pct ?? undefined,
    requestedHumanId: row.requested_human_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapPlatformUser(row: SupabasePlatformUserRow): PlatformUserRecord {
  return {
    authUserId: row.auth_user_id,
    email: row.email ?? undefined,
    platformRole: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapDeploymentAccess(row: SupabaseDeploymentAccessRow): DeploymentAccessRecord {
  return {
    id: row.id,
    deploymentId: row.deployment_id,
    authUserId: row.auth_user_id,
    role: row.role,
    createdAt: row.created_at
  };
}

class SupabaseRepository implements Repository {
  private readonly baseUrl: string;
  private readonly headers: HeadersInit;
  private readonly fetchImpl: FetchLike;

  constructor(env: SupabaseEnv, fetchImpl: FetchLike = fetch) {
    this.baseUrl = `${env.url.replace(/\/$/, "")}/rest/v1`;
    this.fetchImpl = fetchImpl;
    this.headers = {
      apikey: env.serviceRoleKey,
      Authorization: `Bearer ${env.serviceRoleKey}`,
      "Content-Type": "application/json"
    };
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}/${path}`, {
      ...init,
      headers: {
        ...this.headers,
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`supabase_request_failed:${response.status}:${body}`);
    }

    return (await response.json()) as T;
  }

  async createConversation(
    input: Omit<ConversationRecord, "id" | "createdAt" | "lastActivityAt">
  ): Promise<ConversationRecord> {
    const rows = await this.request<SupabaseConversationRow[]>("conversations", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        factory_id: input.factoryId,
        workspace_id: input.workspaceId ?? null,
        deployment_id: input.deploymentId,
        channel_type: input.channelType,
        requester_id: input.requesterId,
        status: input.status,
        title: input.title ?? null,
        external_thread_ref: input.externalThreadRef ?? null
      })
    });
    return mapConversation(rows[0]);
  }

  async getConversation(conversationId: string): Promise<ConversationRecord | undefined> {
    const query = queryString({ select: "*", id: `eq.${conversationId}` });
    const rows = await this.request<SupabaseConversationRow[]>(`conversations?${query}`);
    return rows[0] ? mapConversation(rows[0]) : undefined;
  }

  async listConversationsForDeployment(deploymentId: string): Promise<ConversationRecord[]> {
    const query = queryString({
      select: "*",
      deployment_id: `eq.${deploymentId}`,
      order: "last_activity_at.desc"
    });
    const rows = await this.request<SupabaseConversationRow[]>(`conversations?${query}`);
    return rows.map(mapConversation);
  }

  async listConversationMessages(conversationId: string): Promise<MessageRecord[]> {
    const query = queryString({
      select: "*",
      conversation_id: `eq.${conversationId}`,
      order: "created_at.asc"
    });
    const rows = await this.request<SupabaseMessageRow[]>(`messages?${query}`);
    return rows.map(mapMessage);
  }

  async appendMessage(input: Omit<MessageRecord, "id" | "createdAt">): Promise<MessageRecord> {
    const rows = await this.request<SupabaseMessageRow[]>("messages", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        conversation_id: input.conversationId,
        direction: input.direction,
        author_type: input.authorType,
        author_id: input.authorId,
        body: input.body,
        structured_payload: input.structuredPayload ?? null
      })
    });
    await this.request<SupabaseConversationRow[]>(
      `conversations?${queryString({ id: `eq.${input.conversationId}` })}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ last_activity_at: new Date().toISOString() })
      }
    );
    return mapMessage(rows[0]);
  }

  async createRun(input: Omit<RunRecord, "id">): Promise<RunRecord> {
    const rows = await this.request<SupabaseRunRow[]>("runs", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        job_id: input.jobId,
        deployment_id: input.deploymentId,
        conversation_id: input.conversationId,
        status: input.status,
        model_provider: input.modelProvider ?? null,
        model_profile: input.modelProfile ?? null,
        model_name: input.modelName ?? null,
        usefulness_score: input.usefulnessScore ?? null,
        score_confidence: input.scoreConfidence ?? null,
        started_at: input.startedAt ?? null,
        completed_at: input.completedAt ?? null
      })
    });
    return mapRun(rows[0]);
  }

  async getRun(runId: string): Promise<RunRecord | undefined> {
    const query = queryString({ select: "*", id: `eq.${runId}` });
    const rows = await this.request<SupabaseRunRow[]>(`runs?${query}`);
    return rows[0] ? mapRun(rows[0]) : undefined;
  }

  async createConversationSummary(
    input: Omit<ConversationSummaryRecord, "id" | "createdAt">
  ): Promise<ConversationSummaryRecord> {
    const rows = await this.request<SupabaseConversationSummaryRow[]>("conversation_summaries", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        conversation_id: input.conversationId,
        deployment_id: input.deploymentId,
        source_run_id: input.sourceRunId ?? null,
        summary_type: input.summaryType,
        content: input.content,
        open_questions: input.openQuestions,
        recommended_next_steps: input.recommendedNextSteps,
        confidence_score: input.confidenceScore ?? null,
        is_handoff_ready: input.isHandoffReady
      })
    });
    return mapSummary(rows[0]);
  }

  async getLatestConversationSummary(conversationId: string): Promise<ConversationSummaryRecord | undefined> {
    const query = queryString({
      select: "*",
      conversation_id: `eq.${conversationId}`,
      order: "created_at.desc",
      limit: "1"
    });
    const rows = await this.request<SupabaseConversationSummaryRow[]>(`conversation_summaries?${query}`);
    return rows[0] ? mapSummary(rows[0]) : undefined;
  }

  async createHitlEscalation(
    input: Omit<HitlEscalationRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<HitlEscalationRecord> {
    const rows = await this.request<SupabaseHitlEscalationRow[]>("hitl_escalations", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        deployment_id: input.deploymentId,
        conversation_id: input.conversationId,
        job_id: input.jobId ?? null,
        run_id: input.runId ?? null,
        conversation_summary_id: input.conversationSummaryId ?? null,
        status: input.status,
        reason_code: input.reasonCode,
        requested_human_id: input.requestedHumanId ?? null,
        delivery_status: input.deliveryStatus,
        response_due_at: input.responseDueAt ?? null
      })
    });
    return mapEscalation(rows[0]);
  }

  async getHitlEscalation(escalationId: string): Promise<HitlEscalationRecord | undefined> {
    const query = queryString({ select: "*", id: `eq.${escalationId}` });
    const rows = await this.request<SupabaseHitlEscalationRow[]>(`hitl_escalations?${query}`);
    return rows[0] ? mapEscalation(rows[0]) : undefined;
  }

  async listEscalationsForDeployment(deploymentId: string): Promise<HitlEscalationRecord[]> {
    const query = queryString({
      select: "*",
      deployment_id: `eq.${deploymentId}`,
      order: "created_at.desc"
    });
    const rows = await this.request<SupabaseHitlEscalationRow[]>(`hitl_escalations?${query}`);
    return rows.map(mapEscalation);
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
    const rows = await this.request<SupabaseHitlEscalationRow[]>(
      `hitl_escalations?${queryString({ select: "*", id: `eq.${escalationId}` })}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: input.status,
          delivery_status: input.deliveryStatus,
          requested_human_id: input.requestedHumanId,
          response_due_at: input.responseDueAt,
          resolution_summary: input.resolutionSummary,
          resolved_by_auth_user_id: input.resolvedByAuthUserId,
          resolved_at: input.resolvedAt
        })
      }
    );
    return rows[0] ? mapEscalation(rows[0]) : undefined;
  }

  async createNotificationDeliveries(
    inputs: Array<Omit<NotificationDeliveryRecord, "id" | "createdAt">>
  ): Promise<NotificationDeliveryRecord[]> {
    const rows = await this.request<SupabaseNotificationDeliveryRow[]>("notification_deliveries", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(
        inputs.map((input) => ({
          escalation_id: input.escalationId,
          subject_type: input.subjectType,
          subject_id: input.subjectId,
          channel_type: input.channelType,
          recipient_ref: input.recipientRef ?? null,
          status: input.status,
          sent_at: input.sentAt ?? null,
          failed_at: input.failedAt ?? null,
          failure_reason: input.failureReason ?? null
        }))
      )
    });
    return rows.map(mapDelivery);
  }

  async listNotificationDeliveries(escalationId: string): Promise<NotificationDeliveryRecord[]> {
    const query = queryString({
      select: "*",
      escalation_id: `eq.${escalationId}`,
      order: "created_at.asc"
    });
    const rows = await this.request<SupabaseNotificationDeliveryRow[]>(`notification_deliveries?${query}`);
    return rows.map(mapDelivery);
  }

  async markNotificationDeliveriesSent(
    escalationId: string,
    channels?: string[]
  ): Promise<NotificationDeliveryRecord[]> {
    const sentAt = new Date().toISOString();
    const filters: Record<string, string | undefined> = {
      escalation_id: `eq.${escalationId}`,
      select: "*"
    };
    if (channels?.length) {
      filters.channel_type = `in.(${channels.join(",")})`;
    }
    const rows = await this.request<SupabaseNotificationDeliveryRow[]>(
      `notification_deliveries?${queryString(filters)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify({
          status: "sent",
          sent_at: sentAt
        })
      }
    );
    return rows.map(mapDelivery);
  }

  async getDeploymentConfig(deploymentId: string): Promise<DeploymentConfigRecord | undefined> {
    const query = queryString({ select: "*", deployment_id: `eq.${deploymentId}`, limit: "1" });
    const rows = await this.request<SupabaseDeploymentConfigRow[]>(`deployment_configs?${query}`);
    return rows[0] ? mapDeploymentConfig(rows[0]) : undefined;
  }

  async upsertDeploymentConfig(
    input: Omit<DeploymentConfigRecord, "createdAt" | "updatedAt">
  ): Promise<DeploymentConfigRecord> {
    const rows = await this.request<SupabaseDeploymentConfigRow[]>(
      `deployment_configs?${queryString({ on_conflict: "deployment_id" })}`,
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          deployment_id: input.deploymentId,
          factory_id: input.factoryId,
          digital_twin_id: input.digitalTwinId,
          display_name: input.displayName ?? null,
          analysis_only: true,
          preferred_model_provider: input.preferredModelProvider,
          preferred_model: input.preferredModel,
          preferred_model_profile: input.preferredModelProfile,
          fallback_model_provider: input.fallbackModelProvider ?? null,
          fallback_model: input.fallbackModel ?? null,
          allowed_models: input.allowedModels,
          enabled_channels: input.enabledChannels,
          daily_token_limit: input.dailyTokenLimit ?? null,
          max_cost_per_day: input.maxCostPerDay ?? null,
          alert_at_pct: input.alertAtPct ?? null,
          requested_human_id: input.requestedHumanId ?? null
        })
      }
    );
    return mapDeploymentConfig(rows[0]);
  }

  async listPlatformUsers(role?: PlatformRole): Promise<PlatformUserRecord[]> {
    const query = queryString({
      select: "auth_user_id,email,role,created_at,updated_at",
      role: role ? `eq.${role}` : undefined,
      order: "created_at.asc"
    });
    const rows = await this.request<SupabasePlatformUserRow[]>(`platform_users?${query}`);
    return rows.map(mapPlatformUser);
  }

  async upsertPlatformUser(
    input: Omit<PlatformUserRecord, "createdAt" | "updatedAt">
  ): Promise<PlatformUserRecord> {
    const rows = await this.request<SupabasePlatformUserRow[]>(
      `platform_users?${queryString({ on_conflict: "auth_user_id" })}`,
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          auth_user_id: input.authUserId,
          email: input.email ?? null,
          role: input.platformRole
        })
      }
    );
    return mapPlatformUser(rows[0]);
  }

  async grantDeploymentAccess(
    input: Omit<DeploymentAccessRecord, "id" | "createdAt">
  ): Promise<DeploymentAccessRecord> {
    const rows = await this.request<SupabaseDeploymentAccessRow[]>(
      `deployment_access?${queryString({ on_conflict: "deployment_id,auth_user_id" })}`,
      {
        method: "POST",
        headers: { Prefer: "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify({
          deployment_id: input.deploymentId,
          auth_user_id: input.authUserId,
          role: input.role
        })
      }
    );
    return mapDeploymentAccess(rows[0]);
  }
}

let repositorySingleton: Repository | undefined;

export function createRepository(fetchImpl?: FetchLike): Repository {
  if (process.env.NODE_ENV === "test" || process.env.DIGITAL_TWIN_FACTORY_USE_MEMORY_STORE === "1") {
    return new MemoryRepository();
  }
  return new SupabaseRepository(requireSupabaseEnv(), fetchImpl);
}

export function getRepository(): Repository {
  repositorySingleton ??= createRepository();
  return repositorySingleton;
}
