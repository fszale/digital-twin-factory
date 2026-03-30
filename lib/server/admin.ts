import { getPlatformBootstrapSecret } from "./env.ts";
import type { Repository } from "./repository.ts";
import type { AuthenticatedUser, PlatformRole } from "./types.ts";

export async function bootstrapSuperAdmin(
  repository: Repository,
  input: {
    bootstrapSecret?: string;
    authUserId: string;
    email?: string;
  }
) {
  const expectedSecret = getPlatformBootstrapSecret();
  if (!expectedSecret) {
    throw new Error("platform_bootstrap_secret_missing");
  }
  if (input.bootstrapSecret !== expectedSecret) {
    throw new Error("invalid_bootstrap_secret");
  }

  const existingAdmins = await repository.listPlatformUsers("super_admin");
  if (existingAdmins.length > 0 && !existingAdmins.some((admin) => admin.authUserId === input.authUserId)) {
    throw new Error("super_admin_already_exists");
  }

  return repository.upsertPlatformUser({
    authUserId: input.authUserId,
    email: input.email,
    platformRole: "super_admin"
  });
}

export function assertSuperAdmin(user: AuthenticatedUser): void {
  if (user.platformRole !== "super_admin") {
    throw new Error("super_admin_required");
  }
}

export async function upsertPlatformUserAsAdmin(
  repository: Repository,
  user: AuthenticatedUser,
  input: {
    authUserId: string;
    email?: string;
    platformRole: PlatformRole;
  }
) {
  assertSuperAdmin(user);
  return repository.upsertPlatformUser(input);
}

export async function grantOwnerAccessAsAdmin(
  repository: Repository,
  user: AuthenticatedUser,
  input: {
    deploymentId: string;
    authUserId: string;
  }
) {
  assertSuperAdmin(user);
  return repository.grantDeploymentAccess({
    deploymentId: input.deploymentId,
    authUserId: input.authUserId,
    role: "owner"
  });
}
