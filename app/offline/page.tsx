"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Home } from "lucide-react";

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F19] px-4 text-center text-white">
      <div className="glass-panel max-w-md rounded-2xl p-8 space-y-6 border border-crm-border/40 shadow-2xl relative overflow-hidden">
        {/* Glow decorative blur */}
        <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-crm-primary/10 blur-xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

        <div className="flex justify-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-crm-cardHover/50 text-indigo-400 border border-crm-border/30">
            <WifiOff className="h-8 w-8 animate-pulse text-rose-400" />
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Connection Lost</h1>
          <p className="text-sm text-crm-muted leading-relaxed">
            NexusCRM cannot establish a network link right now. 
          </p>
        </div>

        <div className="rounded-lg bg-crm-cardHover/30 p-4 border border-crm-border/20 text-xs text-crm-muted text-left space-y-2">
          <p className="font-semibold text-slate-200">Offline Caching Active:</p>
          <p>
            You can still interact with loaded records. Any new customer entries, notes, or deal updates will write to your local browser sandbox cache and upload when you go back online.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <button
            onClick={handleReload}
            className="flex items-center justify-center gap-2 rounded-lg bg-crm-primary px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Connection</span>
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-crm-border bg-crm-cardHover/50 px-4 py-2.5 text-sm font-semibold text-crm-muted transition-all hover:bg-crm-cardHover hover:text-white"
          >
            <Home className="h-4 w-4" />
            <span>Workspace</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
