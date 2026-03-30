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

export default async function AdminDashboardPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const access = await requireSuperAdminForServerRender();
  if ("error" in access) {
    return renderSetupError(access.error);
  }

  const params = await searchParams;
  const status = params.status;

  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <p className="eyebrow">Admin</p>
        <h1>Super admin control surface</h1>
        <p className="lead">
          Bootstrap one super admin, register twin owners, and assign deployment ownership through the admin APIs.
        </p>
        <p className="muted">Signed in as {access.user.email ?? access.user.authUserId}</p>
        {status ? <p className="notice">{status}</p> : null}
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
          <h2>Register platform user</h2>
          <form action="/dashboard/admin/platform-users" method="post" className="stack">
            <label htmlFor="platform-auth-user-id">Supabase auth user id</label>
            <input id="platform-auth-user-id" name="authUserId" type="text" required />
            <label htmlFor="platform-email">Email</label>
            <input id="platform-email" name="email" type="email" />
            <label htmlFor="platform-role">Role</label>
            <select id="platform-role" name="platformRole" defaultValue="twin_owner">
              <option value="twin_owner">twin_owner</option>
              <option value="super_admin">super_admin</option>
            </select>
            <button type="submit">Save platform user</button>
          </form>
        </div>

        <div className="panel">
          <h2>Owner assignment</h2>
          <p>
            Use <code>POST /api/admin/platform-users</code> to register a human as a{" "}
            <code>twin_owner</code>, then <code>POST /api/admin/deployment-access</code> to assign a deployment.
          </p>
          <form action="/dashboard/admin/deployment-access" method="post" className="stack">
            <label htmlFor="owner-deployment-id">Deployment id</label>
            <input id="owner-deployment-id" name="deploymentId" type="text" required />
            <label htmlFor="owner-auth-user-id">Owner auth user id</label>
            <input id="owner-auth-user-id" name="authUserId" type="text" required />
            <button type="submit">Grant owner access</button>
          </form>
        </div>
      </section>
    </main>
  );
}
