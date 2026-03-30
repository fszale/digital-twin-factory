import { buildSessionCookieHeaders, signInWithSupabasePassword } from "@/lib/server/session.ts";

function redirectWithCookies(request: Request, path: string, cookieHeaders: string[]): Response {
  const response = Response.redirect(new URL(path, request.url), 303);
  for (const cookie of cookieHeaders) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}

export async function POST(request: Request): Promise<Response> {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return Response.redirect(new URL("/login?error=missing_credentials", request.url), 303);
  }

  try {
    const session = await signInWithSupabasePassword({ email, password });
    return redirectWithCookies(request, "/dashboard", buildSessionCookieHeaders(session));
  } catch {
    return Response.redirect(new URL("/login?error=invalid_credentials", request.url), 303);
  }
}
