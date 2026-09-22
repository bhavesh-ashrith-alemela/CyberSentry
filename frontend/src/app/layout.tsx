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
    <html lang="en">
      <body className="bg-sand-50 text-forest-950 flex flex-col min-h-screen selection:bg-forest-100 selection:text-forest-900 font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
