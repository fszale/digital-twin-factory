import { getAuthenticatedUserFromRequest } from "@/lib/server/auth.ts";
import { upsertPlatformUserAsAdmin } from "@/lib/server/admin.ts";
import { getRepository } from "@/lib/server/repository.ts";

export async function POST(request: Request): Promise<Response> {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    const formData = await request.formData();
    const authUserId = String(formData.get("authUserId") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const platformRole = String(formData.get("platformRole") ?? "").trim();

    if (!authUserId || (platformRole !== "super_admin" && platformRole !== "twin_owner")) {
      return Response.redirect(new URL("/dashboard/admin?status=invalid_platform_user", request.url), 303);
    }

    await upsertPlatformUserAsAdmin(getRepository(), user, {
      authUserId,
      email: email || undefined,
      platformRole
    });

    return Response.redirect(new URL("/dashboard/admin?status=platform_user_saved", request.url), 303);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "platform_user_failed";
    return Response.redirect(new URL(`/dashboard/admin?status=${encodeURIComponent(reason)}`, request.url), 303);
  }
}
