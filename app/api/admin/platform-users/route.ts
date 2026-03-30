import { upsertPlatformUserAsAdmin } from "@/lib/server/admin.ts";
import { requireSuperAdminFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse } from "@/lib/server/http.ts";
import { getRepository } from "@/lib/server/repository.ts";

export async function POST(request: Request): Promise<Response> {
  const access = await requireSuperAdminFromRequest(request);
  if ("response" in access) {
    return access.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    authUserId?: string;
    email?: string;
    platformRole?: "super_admin" | "twin_owner";
  };

  if (!body.authUserId || !body.platformRole) {
    return badRequest("missing_required_fields", ["authUserId", "platformRole"]);
  }

  const user = await upsertPlatformUserAsAdmin(getRepository(), access.user, {
    authUserId: body.authUserId,
    email: body.email,
    platformRole: body.platformRole
  });

  return jsonResponse({ user }, { status: 201 });
}
