import { forbidden, unauthorized } from "./http.ts";
import {
  getAuthenticatedUserForServerRender,
  getAuthenticatedUserFromRequest,
  userCanAccessDeployment,
  userIsSuperAdmin
} from "./auth.ts";
import type { AuthenticatedUser } from "./types.ts";

export async function requireDeploymentAccessFromRequest(
  request: Request,
  deploymentId: string
): Promise<{ user: AuthenticatedUser } | { response: Response }> {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!userCanAccessDeployment(user, deploymentId)) {
      return { response: forbidden("deployment_access_forbidden") };
    }
    return { user };
  } catch (error) {
    return { response: unauthorized(error instanceof Error ? error.message : "unauthorized") };
  }
}

export async function requireDeploymentAccessForServerRender(
  deploymentId: string
): Promise<{ user: AuthenticatedUser } | { error: string }> {
  try {
    const user = await getAuthenticatedUserForServerRender();
    if (!userCanAccessDeployment(user, deploymentId)) {
      return { error: "deployment_access_forbidden" };
    }
    return { user };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "unauthorized" };
  }
}

export async function requireSuperAdminFromRequest(
  request: Request
): Promise<{ user: AuthenticatedUser } | { response: Response }> {
  try {
    const user = await getAuthenticatedUserFromRequest(request);
    if (!userIsSuperAdmin(user)) {
      return { response: forbidden("super_admin_required") };
    }
    return { user };
  } catch (error) {
    return { response: unauthorized(error instanceof Error ? error.message : "unauthorized") };
  }
}

export async function requireSuperAdminForServerRender(): Promise<{ user: AuthenticatedUser } | { error: string }> {
  try {
    const user = await getAuthenticatedUserForServerRender();
    if (!userIsSuperAdmin(user)) {
      return { error: "super_admin_required" };
    }
    return { user };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "unauthorized" };
  }
}
