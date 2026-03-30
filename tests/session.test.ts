import assert from "node:assert/strict";
import test from "node:test";

import {
  buildExpiredSessionCookieHeaders,
  buildSessionCookieHeaders,
  signInWithSupabasePassword
} from "../lib/server/session.ts";

test("buildSessionCookieHeaders returns access and refresh cookies", () => {
  const cookies = buildSessionCookieHeaders({
    accessToken: "access-token",
    refreshToken: "refresh-token",
    expiresIn: 3600
  });

  assert.equal(cookies.length, 2);
  assert.match(cookies[0] ?? "", /digital-twin-factory-access-token=/);
  assert.match(cookies[1] ?? "", /digital-twin-factory-refresh-token=/);
});

test("buildExpiredSessionCookieHeaders expires both session cookies", () => {
  const cookies = buildExpiredSessionCookieHeaders();

  assert.equal(cookies.length, 2);
  assert.match(cookies[0] ?? "", /Max-Age=0/);
  assert.match(cookies[1] ?? "", /Max-Age=0/);
});

test("signInWithSupabasePassword uses the public Supabase auth endpoint", async () => {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_ANON_KEY = "anon-key";

  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const session = await signInWithSupabasePassword(
    { email: "owner@example.com", password: "secret" },
    async (url, init) => {
      calls.push({ url: String(url), init });
      return new Response(
        JSON.stringify({
          access_token: "access-token",
          refresh_token: "refresh-token",
          expires_in: 3600,
          token_type: "bearer",
          user: { id: "user-1", email: "owner@example.com" }
        }),
        { status: 200 }
      );
    }
  );

  assert.equal(calls[0]?.url, "https://example.supabase.co/auth/v1/token?grant_type=password");
  assert.equal(session.accessToken, "access-token");
  assert.equal(session.user?.email, "owner@example.com");
});
