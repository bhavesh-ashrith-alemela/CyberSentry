import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CyberSentry | Web Privacy & Tracking Transparency Dossier",
  description:
    "An explainable cookie consent and web tracking transparency platform. Audit websites for dark patterns, pre-consent tracking, cookies, and privacy compliance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-cs-cream text-cs-ink flex flex-col min-h-screen selection:bg-cs-denim/20 selection:text-cs-denim antialiased">
        <Navbar />
        <main className="flex-1 bg-paper-texture">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
