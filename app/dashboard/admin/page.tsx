import { requireSuperAdminForServerRender } from "@/lib/server/access.ts";

function renderSetupError(message: string) {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <p className="eyebrow">Admin</p>
        <h1>Configuration needed</h1>
        <p className="lead">{message}</p>
      </section>
    </main>
  );
}

export default async function AdminDashboardPage() {
  const access = await requireSuperAdminForServerRender();
  if ("error" in access) {
    return renderSetupError(access.error);
  }

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <p className="eyebrow">Admin</p>
        <h1>Super admin control surface</h1>
        <p className="lead">
          Bootstrap one super admin, register twin owners, and assign deployment ownership through the admin APIs.
        </p>
        <p className="muted">Signed in as {access.user.email ?? access.user.authUserId}</p>
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <h2>Bootstrap route</h2>
          <p>
            Use <code>POST /api/admin/bootstrap-super-admin</code> once with{" "}
            <code>PLATFORM_BOOTSTRAP_SECRET</code> to seed the first super admin.
          </p>
        </div>

        <div className="panel">
          <h2>Owner assignment</h2>
          <p>
            Use <code>POST /api/admin/platform-users</code> to register a human as a{" "}
            <code>twin_owner</code>, then <code>POST /api/admin/deployment-access</code> to assign a deployment.
          </p>
        </div>
      </section>
    </main>
  );
}
