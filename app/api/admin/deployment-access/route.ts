import { grantOwnerAccessAsAdmin } from "@/lib/server/admin.ts";
import { requireSuperAdminFromRequest } from "@/lib/server/access.ts";
import { badRequest, jsonResponse } from "@/lib/server/http.ts";
import { getRepository } from "@/lib/server/repository.ts";

export async function POST(request: Request): Promise<Response> {
  const access = await requireSuperAdminFromRequest(request);
  if ("response" in access) {
    return access.response;
  }

  const body = (await request.json().catch(() => ({}))) as {
    deploymentId?: string;
    authUserId?: string;
  };

  if (!body.deploymentId || !body.authUserId) {
    return badRequest("missing_required_fields", ["deploymentId", "authUserId"]);
  }

  const deploymentAccess = await grantOwnerAccessAsAdmin(getRepository(), access.user, {
    deploymentId: body.deploymentId,
    authUserId: body.authUserId
  });

  return jsonResponse({ deploymentAccess }, { status: 201 });
}
