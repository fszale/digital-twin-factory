import test from "node:test";
import assert from "node:assert/strict";
import { extractAccessTokenFromHeaders, userCanAccessDeployment, userIsSuperAdmin } from "../lib/server/auth.ts";
import type { AuthenticatedUser } from "../lib/server/types.ts";

test("extractAccessTokenFromHeaders prefers bearer token", () => {
  const token = extractAccessTokenFromHeaders("Bearer abc.def.ghi", null);
  assert.equal(token, "abc.def.ghi");
});

test("extractAccessTokenFromHeaders parses auth token cookie payload", () => {
  const token = extractAccessTokenFromHeaders(null, 'sb-test-auth-token=["abc.def.ghi","refresh-token"]');
  assert.equal(token, "abc.def.ghi");
});

test("userCanAccessDeployment enforces role and ownership", () => {
  const admin: AuthenticatedUser = {
    authUserId: "admin-1",
    platformRole: "super_admin",
    deploymentIds: []
  };
  const owner: AuthenticatedUser = {
    authUserId: "owner-1",
    platformRole: "twin_owner",
    deploymentIds: ["filip__factory-1"]
  };

  assert.equal(userCanAccessDeployment(admin, "foreign"), true);
  assert.equal(userCanAccessDeployment(owner, "filip__factory-1"), true);
  assert.equal(userCanAccessDeployment(owner, "foreign"), false);
  assert.equal(userIsSuperAdmin(admin), true);
  assert.equal(userIsSuperAdmin(owner), false);
});
