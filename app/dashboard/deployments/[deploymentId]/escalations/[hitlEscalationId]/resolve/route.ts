import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { getRepository } from "@/lib/server/repository.ts";

function redirectToDeploymentDashboard(request: Request, deploymentId: string): Response {
  const url = new URL(`/dashboard/deployments/${deploymentId}`, request.url);
  return Response.redirect(url, 303);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ deploymentId: string; hitlEscalationId: string }> }
): Promise<Response> {
  const { deploymentId, hitlEscalationId } = await context.params;
  const access = await requireDeploymentAccessFromRequest(request, deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const formData = await request.formData();
  const resolutionSummary = String(formData.get("resolutionSummary") ?? "").trim();

  await getRepository().updateHitlEscalation(hitlEscalationId, {
    status: "resolved",
    resolutionSummary: resolutionSummary || "Resolved via dashboard.",
    resolvedByAuthUserId: access.user.authUserId,
    resolvedAt: new Date().toISOString()
  });

  return redirectToDeploymentDashboard(request, deploymentId);
}
