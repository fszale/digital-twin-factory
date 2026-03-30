import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse, notFound } from "@/lib/server/http";
import { createHitlEscalationFromRun } from "@/lib/server/escalation-service";
import { getRepository } from "@/lib/server/repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ runId: string }> }
): Promise<Response> {
  const { runId } = await context.params;
  const repository = getRepository();
  const run = await repository.getRun(runId);

  if (!run) {
    return notFound("run_not_found");
  }

  const access = await requireDeploymentAccessFromRequest(request, run.deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const body = (await request.json()) as {
    reasonCode?: string;
    notifyChannels?: Array<"dashboard" | "slack" | "email">;
    requestedHumanId?: string;
    responseDueAt?: string;
    recipientRef?: string;
  };

  if (!body.reasonCode) {
    return badRequest("missing_required_fields", ["reasonCode"]);
  }

  const { escalation, summary, deliveries } = await createHitlEscalationFromRun(repository, {
    runId,
    reasonCode: body.reasonCode,
    notifyChannels: body.notifyChannels,
    requestedHumanId: body.requestedHumanId,
    responseDueAt: body.responseDueAt,
    recipientRef: body.recipientRef
  });

  return jsonResponse(
    {
      escalation,
      summary,
      deliveries
    },
    { status: 201 }
  );
}
