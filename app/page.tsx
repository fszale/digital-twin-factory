import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Digital Twin Factory</p>
        <h1>Control plane for portable digital twins.</h1>
        <p className="lead">
          This scaffold is intentionally minimal. The current source of truth is the contract layer in
          <code> docs/</code>, <code>schemas/</code>, and <code>prisma/</code>.
        </p>
        <p className="lead">
          The first operator-facing UI is the{" "}
          <Link href="/dashboard" className="inline-link">
            deployment dashboard
          </Link>
          .
        </p>
        <p className="lead">
          First-time platform setup starts at{" "}
          <Link href="/setup" className="inline-link">
            /setup
          </Link>
          , then operators sign in through{" "}
          <Link href="/login" className="inline-link">
            /login
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
