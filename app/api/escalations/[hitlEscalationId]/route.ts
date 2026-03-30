import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse, notFound } from "@/lib/server/http";
import { getRepository } from "@/lib/server/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ hitlEscalationId: string }> }
): Promise<Response> {
  const { hitlEscalationId } = await context.params;
  const repository = getRepository();
  const escalation = await repository.getHitlEscalation(hitlEscalationId);

  if (!escalation) {
    return notFound("hitl_escalation_not_found");
  }

  const access = await requireDeploymentAccessFromRequest(_request, escalation.deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const [deliveries, latestSummary] = await Promise.all([
    repository.listNotificationDeliveries(hitlEscalationId),
    repository.getLatestConversationSummary(escalation.conversationId)
  ]);

  return jsonResponse({
    escalation,
    latestSummary,
    deliveries
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ hitlEscalationId: string }> }
): Promise<Response> {
  const { hitlEscalationId } = await context.params;
  const repository = getRepository();
  const escalation = await repository.getHitlEscalation(hitlEscalationId);

  if (!escalation) {
    return notFound("hitl_escalation_not_found");
  }

  const access = await requireDeploymentAccessFromRequest(request, escalation.deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    status?: "open" | "notified" | "resolved" | "cancelled";
    deliveryStatus?: "pending" | "sent" | "failed";
    requestedHumanId?: string;
    responseDueAt?: string;
    resolutionSummary?: string;
  };

  if (!body.status && !body.deliveryStatus && !body.requestedHumanId && !body.responseDueAt && !body.resolutionSummary) {
    return badRequest("missing_patch_fields");
  }

  const resolvedAt = body.status === "resolved" ? new Date().toISOString() : undefined;
  const updated = await repository.updateHitlEscalation(hitlEscalationId, {
    status: body.status,
    deliveryStatus: body.deliveryStatus,
    requestedHumanId: body.requestedHumanId,
    responseDueAt: body.responseDueAt,
    resolutionSummary: body.resolutionSummary,
    resolvedByAuthUserId: body.status === "resolved" ? access.user.authUserId : undefined,
    resolvedAt
  });

  return jsonResponse({ escalation: updated });
}
