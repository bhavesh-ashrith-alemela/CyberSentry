import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";
import { Card, Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
      <Card padding="lg" className="space-y-6">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-cs-primary-soft text-cs-primary flex items-center justify-center">
          <FileQuestion className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cs-primary">
            404 Error
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-cs-text font-sans">
            Page Not Found
          </h1>
          <p className="text-sm text-cs-muted max-w-md mx-auto">
            The privacy audit or telemetry page you requested does not exist or may have been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="md" className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link href="/history">
            <Button variant="outline" size="md" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>View Scan History</span>
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
