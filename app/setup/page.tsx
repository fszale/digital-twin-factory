import Link from "next/link";

export default async function SetupPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusMessage =
    params.status === "bootstrapped"
      ? "Bootstrap succeeded. The new super admin can now sign in."
      : params.status && params.status !== "bootstrapped"
        ? `Bootstrap failed: ${params.status}`
        : undefined;

  return (
    <main className="page">
      <section className="hero auth-card">
        <p className="eyebrow">Platform Setup</p>
        <h1>Seed the first super admin.</h1>
        <p className="lead">
          This form uses <code>PLATFORM_BOOTSTRAP_SECRET</code> and should be used once to map the first Supabase Auth
          user into the platform.
        </p>
        {statusMessage ? <p className="notice">{statusMessage}</p> : null}
        <form action="/setup/bootstrap" method="post" className="stack">
          <label htmlFor="bootstrapSecret">Bootstrap secret</label>
          <input id="bootstrapSecret" name="bootstrapSecret" type="password" required />
          <label htmlFor="authUserId">Supabase auth user id</label>
          <input id="authUserId" name="authUserId" type="text" required />
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" />
          <button type="submit">Bootstrap super admin</button>
        </form>
        <p className="muted">
          After bootstrap, continue to <Link href="/login">/login</Link>.
        </p>
      </section>
    </main>
  );
}
