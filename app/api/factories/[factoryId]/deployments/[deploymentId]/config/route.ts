import { requireDeploymentAccessFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse } from "@/lib/server/http.ts";
import { getRepository } from "@/lib/server/repository.ts";

export async function GET(
  request: Request,
  context: { params: Promise<{ factoryId: string; deploymentId: string }> }
): Promise<Response> {
  const { deploymentId } = await context.params;
  const access = await requireDeploymentAccessFromRequest(request, deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const config = await getRepository().getDeploymentConfig(deploymentId);
  return jsonResponse({ config });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ factoryId: string; deploymentId: string }> }
): Promise<Response> {
  const { factoryId, deploymentId } = await context.params;
  const access = await requireDeploymentAccessFromRequest(request, deploymentId);
  if ("response" in access) {
    return access.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    digitalTwinId?: string;
    displayName?: string;
    preferredModelProvider?: "openai" | "xai";
    preferredModel?: string;
    preferredModelProfile?: string;
    fallbackModelProvider?: "openai" | "xai";
    fallbackModel?: string;
    allowedModels?: string[];
    enabledChannels?: string[];
    dailyTokenLimit?: number;
    maxCostPerDay?: number;
    alertAtPct?: number;
    requestedHumanId?: string;
  };

  if (
    !body.digitalTwinId ||
    !body.preferredModelProvider ||
    !body.preferredModel ||
    !body.preferredModelProfile ||
    !body.allowedModels?.length ||
    !body.enabledChannels?.length
  ) {
    return badRequest("missing_required_fields", [
      "digitalTwinId",
      "preferredModelProvider",
      "preferredModel",
      "preferredModelProfile",
      "allowedModels",
      "enabledChannels"
    ]);
  }

  const config = await getRepository().upsertDeploymentConfig({
    deploymentId,
    factoryId,
    digitalTwinId: body.digitalTwinId,
    displayName: body.displayName,
    analysisOnly: true,
    preferredModelProvider: body.preferredModelProvider,
    preferredModel: body.preferredModel,
    preferredModelProfile: body.preferredModelProfile,
    fallbackModelProvider: body.fallbackModelProvider,
    fallbackModel: body.fallbackModel,
    allowedModels: body.allowedModels,
    enabledChannels: body.enabledChannels,
    dailyTokenLimit: body.dailyTokenLimit,
    maxCostPerDay: body.maxCostPerDay,
    alertAtPct: body.alertAtPct,
    requestedHumanId: body.requestedHumanId
  });

  return jsonResponse({ config });
}
