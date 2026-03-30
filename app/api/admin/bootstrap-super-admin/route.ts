import { bootstrapSuperAdmin } from "@/lib/server/admin.ts";
import { badRequest, jsonResponse } from "@/lib/server/http.ts";
import { getRepository } from "@/lib/server/repository.ts";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json().catch(() => ({}))) as {
    bootstrapSecret?: string;
    authUserId?: string;
    email?: string;
  };

  if (!body.bootstrapSecret || !body.authUserId) {
    return badRequest("missing_required_fields", ["bootstrapSecret", "authUserId"]);
  }

  try {
    const user = await bootstrapSuperAdmin(getRepository(), {
      bootstrapSecret: body.bootstrapSecret,
      authUserId: body.authUserId,
      email: body.email
    });
    return jsonResponse({ user }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "bootstrap_failed");
  }
}
