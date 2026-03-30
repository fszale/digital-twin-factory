import { getAuthenticatedUserFromRequest } from "@/lib/server/auth.ts";
import { userCanAccessDeployment } from "@/lib/server/auth.ts";
import { getRepository } from "@/lib/server/repository.ts";

function parseCsv(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ deploymentId: string }> }
): Promise<Response> {
  const { deploymentId } = await context.params;

  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!userCanAccessDeployment(user, deploymentId)) {
      return Response.redirect(new URL(`/dashboard/deployments/${deploymentId}?status=deployment_access_forbidden`, request.url), 303);
    }

    const formData = await request.formData();
    const factoryId = String(formData.get("factoryId") ?? "").trim();
    const digitalTwinId = String(formData.get("digitalTwinId") ?? "").trim();
    const preferredModelProvider = String(formData.get("preferredModelProvider") ?? "").trim();
    const preferredModel = String(formData.get("preferredModel") ?? "").trim();
    const preferredModelProfile = String(formData.get("preferredModelProfile") ?? "").trim();
    const allowedModels = parseCsv(formData.get("allowedModels"));
    const enabledChannels = parseCsv(formData.get("enabledChannels"));

    if (
      !factoryId ||
      !digitalTwinId ||
      !preferredModelProvider ||
      !preferredModel ||
      !preferredModelProfile ||
      !allowedModels.length ||
      !enabledChannels.length
    ) {
      return Response.redirect(new URL(`/dashboard/deployments/${deploymentId}?status=invalid_config`, request.url), 303);
    }

    await getRepository().upsertDeploymentConfig({
      deploymentId,
      factoryId,
      digitalTwinId,
      displayName: String(formData.get("displayName") ?? "").trim() || undefined,
      analysisOnly: true,
      preferredModelProvider:
        preferredModelProvider === "openai" || preferredModelProvider === "xai" ? preferredModelProvider : "openai",
      preferredModel,
      preferredModelProfile,
      fallbackModelProvider: (() => {
        const fallbackProvider = String(formData.get("fallbackModelProvider") ?? "").trim();
        return fallbackProvider === "openai" || fallbackProvider === "xai" ? fallbackProvider : undefined;
      })(),
      fallbackModel: String(formData.get("fallbackModel") ?? "").trim() || undefined,
      allowedModels,
      enabledChannels,
      dailyTokenLimit: Number(formData.get("dailyTokenLimit") ?? "") || undefined,
      maxCostPerDay: Number(formData.get("maxCostPerDay") ?? "") || undefined,
      alertAtPct: Number(formData.get("alertAtPct") ?? "") || undefined,
      requestedHumanId: String(formData.get("requestedHumanId") ?? "").trim() || undefined
    });

    return Response.redirect(new URL(`/dashboard/deployments/${deploymentId}?status=config_saved`, request.url), 303);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "config_save_failed";
    return Response.redirect(new URL(`/dashboard/deployments/${deploymentId}?status=${encodeURIComponent(reason)}`, request.url), 303);
  }
}
