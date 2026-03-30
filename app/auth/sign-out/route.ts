import { buildExpiredSessionCookieHeaders } from "@/lib/server/session.ts";

export async function POST(request: Request): Promise<Response> {
  const response = Response.redirect(new URL("/login?signed_out=1", request.url), 303);
  for (const cookie of buildExpiredSessionCookieHeaders()) {
    response.headers.append("Set-Cookie", cookie);
  }
  return response;
}
