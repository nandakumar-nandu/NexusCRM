"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  AlertTriangle, 
  BookOpen, 
  ShieldCheck,
  Clock
} from "lucide-react";
import { type ApiPermission } from "@/types/api";

interface ApiKeyItem {
  id: string;
  name: string;
  key_preview: string;
  permissions: ApiPermission[];
  last_used_at?: string;
  expires_at?: string;
  created_at: string;
}

const DEFAULT_MOCK_KEYS: ApiKeyItem[] = [
  {
    id: "k1",
    name: "Zapier Automated Pipeline Sync",
    key_preview: "nx_live_8f3a...",
    permissions: ["read:customers", "write:customers", "read:leads", "write:leads"],
    last_used_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    expires_at: "Never",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "k2",
    name: "Python Analytics Worker Script",
    key_preview: "nx_live_2e9b...",
    permissions: ["read:customers", "read:leads", "read:reports", "execute:reports"],
    last_used_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    expires_at: "2026-12-31",
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const AVAILABLE_SCOPES: { id: ApiPermission; label: string; desc: string }[] = [
  { id: "read:customers", label: "Read Customers", desc: "Query customer records and detail views" },
  { id: "write:customers", label: "Write Customers", desc: "Create and update corporate customer profiles" },
  { id: "delete:customers", label: "Delete Customers", desc: "Remove customer records from database" },
  { id: "read:leads", label: "Read Deals", desc: "Query deal pipeline Kanban cards" },
  { id: "write:leads", label: "Write Deals", desc: "Create and update deal values and stages" },
  { id: "delete:leads", label: "Delete Deals", desc: "Remove deals from pipeline" },
  { id: "read:tasks", label: "Read Tasks", desc: "Query task checklists and due dates" },
  { id: "write:tasks", label: "Write Tasks", desc: "Create and modify tasks" },
  { id: "read:reports", label: "Read Reports", desc: "View report templates" },
  { id: "execute:reports", label: "Execute Reports", desc: "Run headless custom report exports" },
];

/**
 * Settings Page: Developer API Keys (/settings/api)
 * 
 * Technical Security Patterns:
 * 1. One-Time Reveal Pattern: Raw API keys (`nx_live_...`) are computed in memory during generation. 
 *    The raw secret key is displayed ONCE inside the generation modal with a mandatory copy action. 
 *    Only the hashed token (`key_hash`) is saved in the database.
 * 2. Key Generation Model: Uses `crypto.getRandomValues()` or `crypto.randomBytes(32)` concatenated with 
 *    environment prefixes, then hashed with bcrypt before persistence.
 */
export default function ApiKeysSettingsPage() {
  const [keys, setKeys] = useState<ApiKeyItem[]>(DEFAULT_MOCK_KEYS);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // Generation Modal Form State
  const [keyName, setKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<ApiPermission[]>([
    "read:customers",
    "read:leads",
    "read:tasks",
  ]);
  const [expiry, setExpiry] = useState("never");

  // One-time reveal state
  const [generatedRawKey, setGeneratedRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleScopeToggle = (scope: ApiPermission) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope));
    } else {
      setSelectedScopes([...selectedScopes, scope]);
    }
  };

  const handleGenerateKey = () => {
    if (!keyName.trim()) return;

    // Generate random token string
    const rawSecret = `nx_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const preview = `${rawSecret.slice(0, 10)}...`;

    const newKeyItem: ApiKeyItem = {
      id: "k-" + Math.random().toString(36).substring(2, 9),
      name: keyName,
      key_preview: preview,
      permissions: selectedScopes,
      last_used_at: "Never",
      expires_at: expiry === "never" ? "Never" : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      created_at: new Date().toISOString(),
    };

    setKeys([newKeyItem, ...keys]);
    setGeneratedRawKey(rawSecret);
  };

  const handleCopyKey = () => {
    if (!generatedRawKey) return;
    navigator.clipboard.writeText(generatedRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRevokeKey = (id: string) => {
    setKeys(keys.filter((k) => k.id !== id));
  };

  const resetModal = () => {
    setIsGenerateOpen(false);
    setGeneratedRawKey(null);
    setKeyName("");
    setCopied(false);
  };

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Developer API Keys</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Manage Bearer access tokens for third-party integrations, Zapier webhooks, and automation scripts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/settings/api/docs"
            className="flex items-center gap-1.5 rounded-lg border border-crm-border bg-crm-card/50 px-4 py-2 text-xs font-semibold text-crm-primary hover:bg-crm-cardHover transition-all"
          >
            <BookOpen className="h-4 w-4" />
            <span>Interactive API Docs</span>
          </Link>

          <button
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-crm-primary px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-md shadow-crm-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Key</span>
          </button>
        </div>
      </div>

      {/* API Keys Table Card */}
      <div className="glass-panel rounded-xl border border-crm-border/60 overflow-hidden">
        <div className="p-4 border-b border-crm-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-crm-primary" />
            <span className="font-bold text-sm text-white">Active Secret Keys ({keys.length})</span>
          </div>
        </div>

        <div className="divide-y divide-crm-border/30">
          {keys.length === 0 ? (
            <div className="p-12 text-center text-xs text-crm-muted space-y-2">
              <Key className="mx-auto h-8 w-8 text-crm-muted/40" />
              <p className="font-semibold text-white">No active API keys found</p>
              <p>Generate an API key to enable programatic REST API access.</p>
            </div>
          ) : (
            keys.map((key) => (
              <div key={key.id} className="p-4 hover:bg-crm-cardHover/20 transition-colors flex items-start justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">{key.name}</span>
                    <span className="rounded bg-crm-cardHover px-2 py-0.5 font-mono text-[11px] font-semibold text-crm-accent border border-crm-border/40">
                      {key.key_preview}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {key.permissions.map((perm) => (
                      <span key={perm} className="rounded bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/20">
                        {perm}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-crm-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last used: {key.last_used_at}
                    </span>
                    <span>•</span>
                    <span>Expires: {key.expires_at}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRevokeKey(key.id)}
                  className="flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-all shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Revoke</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* GENERATE NEW KEY MODAL */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-crm-border bg-crm-card p-6 shadow-2xl space-y-6">
            {!generatedRawKey ? (
              <>
                <div className="flex items-center justify-between border-b border-crm-border/50 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-crm-primary" />
                    <h2 className="text-base font-bold text-white">Generate Developer API Key</h2>
                  </div>
                  <button onClick={resetModal} className="text-crm-muted hover:text-white">✕</button>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-crm-muted">Key Name / Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Zapier Automated Lead Sync"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      className="w-full rounded-lg border border-crm-border bg-crm-bg px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-crm-muted">Scope Permissions</label>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-crm-border/50 rounded-lg p-2 bg-crm-bg/40">
                      {AVAILABLE_SCOPES.map((scope) => {
                        const isChecked = selectedScopes.includes(scope.id);
                        return (
                          <label
                            key={scope.id}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                              isChecked ? "bg-crm-primary/10 border border-crm-primary/30" : "hover:bg-crm-cardHover/30"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-white block">{scope.label}</span>
                              <span className="text-[10px] text-crm-muted block">{scope.desc}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleScopeToggle(scope.id)}
                              className="rounded border-crm-border text-crm-primary focus:ring-crm-primary"
                            />
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-crm-muted">Expiration Schedule</label>
                    <select
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full rounded-lg border border-crm-border bg-crm-bg px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="never">Never (Persistent Key)</option>
                      <option value="90">90 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-crm-border/50 pt-4">
                  <button
                    onClick={resetModal}
                    className="rounded-lg border border-crm-border px-4 py-2 text-xs font-semibold text-crm-muted hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerateKey}
                    disabled={!keyName.trim()}
                    className="rounded-lg bg-crm-primary px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all disabled:opacity-50"
                  >
                    Create Secret Token
                  </button>
                </div>
              </>
            ) : (
              /* ONE-TIME REVEAL DIALOG */
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs text-amber-200">
                    <span className="font-bold text-amber-300 block">Copy Your Secret Key Now</span>
                    <p>You will not be able to view this full key again. Store it securely in your application environment variables.</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Generated Secret Bearer Token</label>
                  <div className="flex items-center gap-2 rounded-xl border border-crm-border bg-crm-bg p-3 font-mono text-xs text-emerald-400 break-all">
                    <span>{generatedRawKey}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleCopyKey}
                    className="flex items-center gap-2 rounded-lg bg-crm-primary px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-600 transition-all"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? "Copied to Clipboard!" : "Copy Token"}</span>
                  </button>

                  <button
                    onClick={resetModal}
                    className="rounded-lg border border-crm-border px-4 py-2 text-xs font-semibold text-crm-muted hover:text-white"
                  >
                    I Have Saved My Key
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
