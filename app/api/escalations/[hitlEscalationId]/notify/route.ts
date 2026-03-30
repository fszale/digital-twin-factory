import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse, notFound } from "@/lib/server/http";
import { getRepository } from "@/lib/server/repository";

export async function POST(
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
    channels?: Array<"dashboard" | "slack" | "email">;
  };

  const existingDeliveries = await repository.listNotificationDeliveries(hitlEscalationId);
  if (!existingDeliveries.length) {
    return badRequest("notification_delivery_not_found");
  }

  const deliveries = await repository.markNotificationDeliveriesSent(hitlEscalationId, body.channels);
  const updatedEscalation = await repository.updateHitlEscalation(hitlEscalationId, {
    status: escalation.status === "open" ? "notified" : escalation.status,
    deliveryStatus: "sent"
  });
  return jsonResponse({ escalation: updatedEscalation ?? escalation, deliveries });
}
