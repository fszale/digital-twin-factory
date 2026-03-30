import assert from "node:assert/strict";
import test from "node:test";

import { bootstrapSuperAdmin, grantOwnerAccessAsAdmin } from "../lib/server/admin.ts";
import { MemoryRepository } from "../lib/server/store.ts";

test("bootstrapSuperAdmin creates the first super admin and blocks a different second one", async () => {
  process.env.PLATFORM_BOOTSTRAP_SECRET = "top-secret";

  const repository = new MemoryRepository();
  const admin = await bootstrapSuperAdmin(repository, {
    bootstrapSecret: "top-secret",
    authUserId: "admin-1",
    email: "admin@example.com"
  });

  assert.equal(admin.platformRole, "super_admin");

  await assert.rejects(
    () =>
      bootstrapSuperAdmin(repository, {
        bootstrapSecret: "top-secret",
        authUserId: "admin-2"
      }),
    /super_admin_already_exists/
  );
});

test("grantOwnerAccessAsAdmin assigns a deployment owner", async () => {
  const repository = new MemoryRepository();
  const access = await grantOwnerAccessAsAdmin(
    repository,
    {
      authUserId: "admin-1",
      platformRole: "super_admin",
      deploymentIds: []
    },
    {
      deploymentId: "filip__factory-1",
      authUserId: "owner-1"
    }
  );

  assert.equal(access.deploymentId, "filip__factory-1");
  assert.equal(access.authUserId, "owner-1");
  assert.equal(access.role, "owner");
});
