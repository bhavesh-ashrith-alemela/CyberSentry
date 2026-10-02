import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "CyberSentry | Web Privacy & Tracking Transparency Platform",
  description:
    "An explainable cookie consent and web tracking transparency platform. Audit websites for dark patterns, pre-consent tracking, cookies, and privacy posture.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cs-bg text-cs-text antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
