import { bootstrapSuperAdmin } from "@/lib/server/admin.ts";
import { getRepository } from "@/lib/server/repository.ts";

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const bootstrapSecret = String(formData.get("bootstrapSecret") ?? "");
  const authUserId = String(formData.get("authUserId") ?? "");
  const emailValue = String(formData.get("email") ?? "").trim();

  try {
    await bootstrapSuperAdmin(getRepository(), {
      bootstrapSecret,
      authUserId,
      email: emailValue || undefined
    });
    return Response.redirect(new URL("/setup?status=bootstrapped", request.url), 303);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "bootstrap_failed";
    return Response.redirect(new URL(`/setup?status=${encodeURIComponent(reason)}`, request.url), 303);
  }
}
