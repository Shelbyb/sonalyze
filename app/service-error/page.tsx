"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  RotateCw,
  Key,
  AlertTriangle,
  ExternalLink,
  Lock,
} from "lucide-react";

function ServiceErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const error = searchParams.get("error") || "Unauthorized";
  const message =
    searchParams.get("message") ||
    "The application could not verify its service authorization with the Daywalker API. Requests and actions have been suspended.";
  const status = searchParams.get("status") || "401";

  const handleRetry = async () => {
    setRetrying(true);
    // Slight pause to provide user feedback
    await new Promise((resolve) => setTimeout(resolve, 400));
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black/95 p-4 sm:p-6 lg:p-8 text-neutral-100 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-red-950/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[250px] bg-emerald-950/15 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-xl rounded-2xl border border-red-500/30 bg-neutral-900/80 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-red-950/40">
        {/* Header */}
        <div className="space-y-4 pb-6 border-b border-neutral-800/80">
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
              HTTP {status} • {error}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-400 inline" />
              Service Authorization Required
            </h1>
            <p className="mt-1 text-sm text-neutral-400 leading-relaxed">
              This deployment cannot proceed because the Daywalker service verification check failed.
            </p>
          </div>
        </div>

        {/* Diagnostic Details */}
        <div className="space-y-4 py-6 text-sm">
          <div className="rounded-xl border border-red-500/20 bg-red-950/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
              <div className="space-y-1">
                <p className="font-semibold text-red-300">Authorization Failure</p>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono break-all">{message}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
            <div className="flex items-center gap-2 font-medium text-xs text-neutral-300 uppercase tracking-wider">
              <Key className="h-4 w-4 text-emerald-400" />
              Troubleshooting Steps
            </div>
            <ul className="list-disc space-y-1.5 pl-5 text-xs text-neutral-400 leading-relaxed">
              <li>
                Ensure <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-emerald-300">DAYWALKER_API_KEY</code> is correctly set in your environment variables or DigitalOcean App Platform spec.
              </li>
              <li>Verify that the API key is active, valid, and has not exceeded its rate limit.</li>
              <li>
                Confirm the service identifier matches your registered project (default: <code className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-emerald-300">sonalyze</code>).
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-neutral-800/80">
          <Link
            href="https://auth.daywalker.dev/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Daywalker Auth Docs
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-2.5 text-sm font-semibold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Re-evaluating..." : "Retry Authorization"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ServiceErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black text-neutral-400">
          <div className="text-sm">Verifying service authorization...</div>
        </div>
      }
    >
      <ServiceErrorContent />
    </Suspense>
  );
}
