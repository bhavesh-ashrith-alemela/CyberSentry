import Link from "next/link";
import { ShieldAlert, Terminal, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-cyber-border/80 bg-cyber-dark text-slate-400 text-xs py-8 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-cyber-border/60">
          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <Terminal className="h-4 w-4 text-cyber-accent" />
              <span>CyberSentry Platform</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              An explainable cookie consent and web tracking transparency platform designed to detect dark patterns, pre-consent tracking, and privacy disclosures.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-200 font-semibold mb-2">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>Academic Mini-Project</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Built using Next.js, Node.js, Express, Playwright, PostgreSQL, and Drizzle ORM. Implements deterministic rule-based auditing without LLMs.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>Regulatory Disclaimer</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              The CyberSentry Privacy Transparency Score is an automated engineering heuristic. It does NOT constitute legal advice, GDPR/ePrivacy legal certification, or formal compliance audit.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} CyberSentry Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-300 transition-colors">
              New Audit
            </Link>
            <span>•</span>
            <Link href="/history" className="hover:text-slate-300 transition-colors">
              History
            </Link>
            <span>•</span>
            <Link href="/compare" className="hover:text-slate-300 transition-colors">
              Compare
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
