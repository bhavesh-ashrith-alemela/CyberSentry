import Link from "next/link";
import { ShieldAlert, Terminal, Code2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-sand-300 bg-sand-100/60 text-forest-700 text-xs py-12 mt-20 print:hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-sand-300">
          <div>
            <div className="flex items-center gap-2 text-forest-950 font-semibold mb-2">
              <Terminal className="h-4 w-4 text-forest-700" />
              <span>CyberSentry Platform</span>
            </div>
            <p className="text-forest-600 leading-relaxed text-xs">
              An explainable cookie consent and web tracking transparency platform designed to detect dark patterns, pre-consent tracking, and privacy disclosures using deterministic heuristics.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-forest-950 font-semibold mb-2">
              <Code2 className="h-4 w-4 text-forest-700" />
              <span>Academic Engineering</span>
            </div>
            <p className="text-forest-600 leading-relaxed text-xs">
              Built using Next.js, Node.js, Express, Playwright, PostgreSQL, and Drizzle ORM. Strictly deterministic, rule-based auditing with empirical evidence.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
              <ShieldAlert className="h-4 w-4 text-amber-700" />
              <span>Regulatory Disclaimer</span>
            </div>
            <p className="text-forest-600 leading-relaxed text-xs">
              CyberSentry provides automated privacy indicators based on observable website behaviour. It does not provide legal compliance certification.
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-forest-500 font-mono">
          <p>© {new Date().getFullYear()} CyberSentry. Deterministic Web Privacy Transparency.</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/#product" className="hover:text-forest-900 transition-colors">
              Product
            </Link>
            <span>•</span>
            <Link href="/#how-it-works" className="hover:text-forest-900 transition-colors">
              How It Works
            </Link>
            <span>•</span>
            <Link href="/#sample-report" className="hover:text-forest-900 transition-colors">
              Privacy Insights
            </Link>
            <span>•</span>
            <Link href="/history" className="hover:text-forest-900 transition-colors">
              Scan History
            </Link>
            <span>•</span>
            <Link href="/compare" className="hover:text-forest-900 transition-colors">
              Comparison
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
