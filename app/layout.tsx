import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Digital Twin Factory",
  description: "Control plane for portable digital twin deployments."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
