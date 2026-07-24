"use client";

import { Search, HelpCircle, ChevronDown } from "lucide-react";
import NotificationBell from "./NotificationBell";
import PresenceIndicators from "./PresenceIndicators";

export default function TopBar() {
  return (
    <header className="fixed top-0 right-0 left-64 z-10 flex h-16 items-center justify-between border-b border-crm-border bg-crm-bg/75 px-8 backdrop-blur-md">
      {/* Search Input */}
      <div className="relative w-96">
        <span className="absolute inset-y-0 left-3 flex items-center">
          <Search className="h-4 w-4 text-crm-muted" />
        </span>
        <input
          type="text"
          placeholder="Quick search (Ctrl + K)..."
          className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-1.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none transition-all duration-200 focus:border-crm-primary focus:bg-crm-card focus:ring-1 focus:ring-crm-primary"
        />
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4">
        {/* Live Team Presence */}
        <PresenceIndicators />

        {/* Support */}
        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-crm-muted transition-colors duration-200 hover:bg-crm-cardHover hover:text-white">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Real-time Notifications Bell */}
        <NotificationBell />

        {/* Divider */}
        <div className="h-6 w-px bg-crm-border"></div>

        {/* User Workspace Info */}
        <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors duration-200 hover:bg-crm-cardHover">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-white">Acme Corp</span>
            <span className="text-[10px] text-crm-accent font-medium">Enterprise Tier</span>
          </div>
          <ChevronDown className="h-4 w-4 text-crm-muted" />
        </button>
      </div>
    </header>
  );
}
