import Link from "next/link";

export default function DashboardIndexPage() {
  return (
    <main className="dashboard-shell">
      <section className="dashboard-header">
        <p className="eyebrow">Dashboard</p>
        <h1>Deployment dashboard</h1>
        <p className="lead">
          Start with a deployment-specific view. Example:{" "}
          <code>/dashboard/deployments/filip__factory-slug</code>
        </p>
      </section>

      <section className="panel">
        <h2>What this view is for</h2>
        <p>
          This dashboard is the first human-facing surface for conversation capture, HITL escalation, and
          synthesized handoff summaries.
        </p>
        <p>
          Once your Supabase environment is configured and records exist, use a deployment path such as{" "}
          <Link href="/dashboard/deployments/filip__factory-slug">
            /dashboard/deployments/filip__factory-slug
          </Link>
          .
        </p>
        <p>
          Super admins also get a dedicated admin surface at <Link href="/dashboard/admin">/dashboard/admin</Link>.
        </p>
      </section>
    </main>
  );
}
