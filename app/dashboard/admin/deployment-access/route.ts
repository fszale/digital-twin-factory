import { getAuthenticatedUserFromRequest } from "@/lib/server/auth.ts";
import { grantOwnerAccessAsAdmin } from "@/lib/server/admin.ts";
import { getRepository } from "@/lib/server/repository.ts";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const formData = await request.formData();
    const deploymentId = String(formData.get("deploymentId") ?? "").trim();
    const authUserId = String(formData.get("authUserId") ?? "").trim();

    if (!deploymentId || !authUserId) {
      return Response.redirect(new URL("/dashboard/admin?status=invalid_deployment_access", request.url), 303);
    }

    await grantOwnerAccessAsAdmin(getRepository(), user, {
      deploymentId,
      authUserId
    });

    return Response.redirect(new URL("/dashboard/admin?status=deployment_access_saved", request.url), 303);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "deployment_access_failed";
    return Response.redirect(new URL(`/dashboard/admin?status=${encodeURIComponent(reason)}`, request.url), 303);
  }
}
