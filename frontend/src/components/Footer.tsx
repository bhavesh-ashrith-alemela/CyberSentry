import Link from "next/link";
import { ShieldAlert, FileText, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cs-border bg-cs-cream-deep/30 text-cs-muted text-xs py-10 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-cs-border/70">
          <div>
            <div className="flex items-center gap-2 text-cs-ink font-semibold mb-2">
              <FileText className="h-4 w-4 text-cs-denim" />
              <span>CyberSentry Platform</span>
            </div>
            <p className="text-cs-muted leading-relaxed">
              An explainable cookie consent and web tracking transparency dossier designed to detect dark patterns, pre-consent tracking, and privacy disclosures with empirical proof.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-cs-ink font-semibold mb-2">
              <Code2 className="h-4 w-4 text-cs-olive" />
              <span>Academic Mini-Project</span>
            </div>
            <p className="text-cs-muted leading-relaxed">
              Engineered using Next.js, Node.js, Express, Playwright, PostgreSQL, and Drizzle ORM. Implements deterministic rule-based auditing without LLM hallucinations.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-[#9A5B15] font-semibold mb-2">
              <ShieldAlert className="h-4 w-4 text-[#9A5B15]" />
              <span>Regulatory Disclaimer</span>
            </div>
            <p className="text-cs-muted leading-relaxed">
              The CyberSentry Privacy Transparency Score is an automated engineering heuristic. It does NOT constitute legal advice, statutory GDPR/ePrivacy certification, or a formal legal audit.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-cs-muted">
          <p>© {new Date().getFullYear()} CyberSentry Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 font-mono">
            <Link href="/" className="hover:text-cs-ink transition-colors">
              New Scan
            </Link>
            <span>•</span>
            <Link href="/history" className="hover:text-cs-ink transition-colors">
              Reports
            </Link>
            <span>•</span>
            <Link href="/compare" className="hover:text-cs-ink transition-colors">
              Compare
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
