import Link from "next/link";

function getMessage(error?: string, signedOut?: string) {
  if (signedOut) {
    return "Signed out.";
  }
  if (error === "missing_credentials") {
    return "Email and password are required.";
  }
  if (error === "invalid_credentials") {
    return "Supabase sign-in failed. Check the credentials and Auth user setup.";
  }
  return undefined;
}

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; signed_out?: string }>;
}) {
  const params = await searchParams;
  const message = getMessage(params.error, params.signed_out);

  return (
    <main className="page">
      <section className="hero auth-card">
        <p className="eyebrow">Operator Sign-In</p>
        <h1>Access the digital twin factory.</h1>
        <p className="lead">
          Sign in with a Supabase Auth user that has already been mapped into <code>platform_users</code>.
        </p>
        {message ? <p className="notice">{message}</p> : null}
        <form action="/auth/sign-in" method="post" className="stack">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
          <button type="submit">Sign in</button>
        </form>
        <p className="muted">
          First-time setup starts at <Link href="/setup">/setup</Link>.
        </p>
      </section>
    </main>
  );
}
