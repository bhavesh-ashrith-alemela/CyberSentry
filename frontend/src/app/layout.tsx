import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CyberSentry | Web Privacy & Tracking Transparency",
  description:
    "An explainable cookie consent and web tracking transparency platform. Audit websites for dark patterns, pre-consent tracking, cookies, and privacy compliance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-cyber-dark text-slate-100 flex flex-col min-h-screen selection:bg-cyan-500/30 selection:text-cyan-200">
        <Navbar />
        <main className="flex-1 bg-tech-grid">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
