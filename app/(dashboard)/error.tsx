"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard routing error caught by boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="glass-panel max-w-md rounded-2xl p-8 border border-rose-500/20 shadow-2xl relative overflow-hidden space-y-6">
        {/* Decorative blur backdrop */}
        <div className="absolute -left-10 -top-10 h-24 w-24 rounded-full bg-rose-500/5 blur-xl pointer-events-none" />

        <div className="flex justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-6 w-6" />
          </span>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">Workspace Exception</h2>
          <p className="text-xs text-crm-muted leading-relaxed">
            Something went wrong while rendering this section.
          </p>
          <div className="text-left">
            <p className="text-[10px] text-crm-muted uppercase tracking-wider font-semibold mb-1">Diagnostic Log:</p>
            <p className="text-[11px] bg-crm-cardHover/30 border border-crm-border/30 rounded p-3 font-mono text-rose-300 break-words select-all max-h-24 overflow-y-auto">
              {error.message || "Unknown rendering exception."}
            </p>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Operation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
