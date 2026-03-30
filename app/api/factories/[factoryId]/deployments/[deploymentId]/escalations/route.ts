import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { jsonResponse } from "@/lib/server/http";
import { getRepository } from "@/lib/server/repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ factoryId: string; deploymentId: string }> }
): Promise<Response> {
  const { deploymentId } = await context.params;
  const access = await requireDeploymentAccessFromRequest(_request, deploymentId);
  if ("response" in access) {
    return access.response;
  }
  const escalations = await getRepository().listEscalationsForDeployment(deploymentId);
  return jsonResponse({ escalations });
}
