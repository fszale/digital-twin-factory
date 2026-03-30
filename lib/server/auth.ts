import { requireSupabaseEnv } from "./env.ts";
import type { AuthenticatedUser, PlatformRole } from "./types.ts";

type FetchLike = typeof fetch;

type SupabaseUserResponse = {
  id: string;
  email?: string;
};

type PlatformUserRow = {
  auth_user_id: string;
  email: string | null;
  role: PlatformRole;
};

type DeploymentAccessRow = {
  deployment_id: string;
};

function parseCookieHeader(cookieHeader: string): Record<string, string> {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const [name, ...valueParts] = part.split("=");
      acc[name] = decodeURIComponent(valueParts.join("="));
      return acc;
    }, {});
}

function extractJwtLikeValue(raw: string): string | undefined {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.find((item): item is string => typeof item === "string" && item.split(".").length === 3);
    }
    if (parsed && typeof parsed === "object") {
      const values = Object.values(parsed);
      return values.find((item): item is string => typeof item === "string" && item.split(".").length === 3);
    }
  } catch {
    if (raw.split(".").length === 3) {
      return raw;
    }
    return undefined;
  }

  return undefined;
}

export function extractAccessTokenFromHeaders(headerAuth: string | null, cookieHeader: string | null): string | undefined {
  if (headerAuth?.startsWith("Bearer ")) {
    return headerAuth.slice("Bearer ".length).trim();
  }

  if (!cookieHeader) {
    return undefined;
  }

  const parsed = parseCookieHeader(cookieHeader);
  const candidates = Object.entries(parsed)
    .filter(([name]) => name.includes("auth-token") || name.includes("access-token"))
    .map(([, value]) => value);

  for (const candidate of candidates) {
    const token = extractJwtLikeValue(candidate);
    if (token) {
      return token;
    }
  }

  return undefined;
}

async function fetchJson<T>(url: string, init: RequestInit, fetchImpl: FetchLike): Promise<T> {
  const response = await fetchImpl(url, init);
  if (!response.ok) {
    throw new Error(`auth_request_failed:${response.status}`);
  }
  return (await response.json()) as T;
}

export async function authenticateWithSupabaseToken(
  accessToken: string,
  fetchImpl: FetchLike = fetch
): Promise<AuthenticatedUser> {
  const env = requireSupabaseEnv();
  const baseUrl = env.url.replace(/\/$/, "");

  const user = await fetchJson<SupabaseUserResponse>(
    `${baseUrl}/auth/v1/user`,
    {
      headers: {
        apikey: env.serviceRoleKey,
        Authorization: `Bearer ${accessToken}`
      }
    },
    fetchImpl
  );

  const adminHeaders = {
    apikey: env.serviceRoleKey,
    Authorization: `Bearer ${env.serviceRoleKey}`
  };

  const [platformUsers, deploymentAccess] = await Promise.all([
    fetchJson<PlatformUserRow[]>(
      `${baseUrl}/rest/v1/platform_users?select=auth_user_id,email,role&auth_user_id=eq.${user.id}`,
      { headers: adminHeaders },
      fetchImpl
    ),
    fetchJson<DeploymentAccessRow[]>(
      `${baseUrl}/rest/v1/deployment_access?select=deployment_id&auth_user_id=eq.${user.id}`,
      { headers: adminHeaders },
      fetchImpl
    )
  ]);

  const platformUser = platformUsers[0];
  if (!platformUser) {
    throw new Error("platform_user_not_found");
  }

  return {
    authUserId: user.id,
    email: platformUser.email ?? user.email,
    platformRole: platformUser.role,
    deploymentIds: deploymentAccess.map((row) => row.deployment_id)
  };
}

export function userCanAccessDeployment(user: AuthenticatedUser, deploymentId: string): boolean {
  return user.platformRole === "super_admin" || user.deploymentIds.includes(deploymentId);
}

export function userIsSuperAdmin(user: AuthenticatedUser): boolean {
  return user.platformRole === "super_admin";
}

export async function getAuthenticatedUserFromRequest(request: Request): Promise<AuthenticatedUser> {
  const token = extractAccessTokenFromHeaders(request.headers.get("authorization"), request.headers.get("cookie"));
  if (!token) {
    throw new Error("access_token_missing");
  }
  return authenticateWithSupabaseToken(token);
}

export async function getAuthenticatedUserForServerRender(): Promise<AuthenticatedUser> {
  const nextHeaders = await import("next/headers");
  const headerBag = await nextHeaders.headers();
  const cookieBag = await nextHeaders.cookies();
  const serializedCookies = cookieBag
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const token = extractAccessTokenFromHeaders(headerBag.get("authorization"), serializedCookies);
  if (!token) {
    throw new Error("access_token_missing");
  }
  return authenticateWithSupabaseToken(token);
}
