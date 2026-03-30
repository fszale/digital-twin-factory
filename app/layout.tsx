import Link from "next/link";
import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Digital Twin Factory",
  description: "Control plane for portable digital twin deployments."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/dashboard/admin">Admin</Link>
            <Link href="/setup">Setup</Link>
            <Link href="/login">Login</Link>
            <form action="/auth/sign-out" method="post">
              <button type="submit">Sign out</button>
            </form>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
