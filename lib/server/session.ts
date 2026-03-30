import { requireSupabasePublicEnv } from "./env.ts";

type FetchLike = typeof fetch;

export interface PasswordSessionResult {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  tokenType?: string;
  user?: {
    id: string;
    email?: string;
  };
}

type SupabasePasswordSessionResponse = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user?: {
    id: string;
    email?: string;
  };
};

function serializeCookie(name: string, value: string, maxAgeSeconds?: number): string {
  const attributes = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax"
  ];

  if (process.env.NODE_ENV === "production") {
    attributes.push("Secure");
  }

  if (maxAgeSeconds !== undefined) {
    attributes.push(`Max-Age=${maxAgeSeconds}`);
  }

  return attributes.join("; ");
}

export function buildSessionCookieHeaders(session: PasswordSessionResult): string[] {
  const accessMaxAge = session.expiresIn ?? 60 * 60;
  return [
    serializeCookie("digital-twin-factory-access-token", session.accessToken, accessMaxAge),
    serializeCookie("digital-twin-factory-refresh-token", session.refreshToken, 60 * 60 * 24 * 30)
  ];
}

export function buildExpiredSessionCookieHeaders(): string[] {
  return [
    serializeCookie("digital-twin-factory-access-token", "", 0),
    serializeCookie("digital-twin-factory-refresh-token", "", 0)
  ];
}

export async function signInWithSupabasePassword(
  input: { email: string; password: string },
  fetchImpl: FetchLike = fetch
): Promise<PasswordSessionResult> {
  const env = requireSupabasePublicEnv();
  const response = await fetchImpl(`${env.url.replace(/\/$/, "")}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: env.anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password
    })
  });

  if (!response.ok) {
    throw new Error(`supabase_password_sign_in_failed:${response.status}`);
  }

  const body = (await response.json()) as SupabasePasswordSessionResponse;
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresIn: body.expires_in,
    tokenType: body.token_type,
    user: body.user
  };
}
