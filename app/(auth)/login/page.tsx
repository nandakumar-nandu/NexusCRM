"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Mail, Lock, AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      // Clear any remaining mock cookies on successful real login
      document.cookie = "nexus-demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during authentication.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    // Set a client-side mock session cookie valid for 1 day
    document.cookie = "nexus-demo-session=true; path=/; max-age=86400";
    // Force hard navigation so Next.js middleware reads the new cookie
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-crm-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel rounded-2xl p-8 relative overflow-hidden border border-crm-border">
        {/* Glow Effects */}
        <div className="absolute -top-16 -left-16 h-36 w-36 rounded-full bg-crm-primary/10 blur-2xl"></div>
        <div className="absolute -bottom-16 -right-16 h-36 w-36 rounded-full bg-crm-accent/10 blur-2xl"></div>

        {/* Logo and Header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-crm-primary to-crm-secondary shadow-lg shadow-crm-primary/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white">
            Welcome to <span className="bg-gradient-to-r from-crm-primary via-indigo-300 to-crm-accent bg-clip-text text-transparent">NexusCRM</span>
          </h2>
          <p className="mt-2 text-xs text-crm-muted">
            {"Enterprise Customer Relationship Management Platform"}
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <Mail className="h-4 w-4 text-crm-muted" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none transition-all focus:border-crm-primary focus:bg-crm-card focus:ring-1 focus:ring-crm-primary"
              />
            </div>
            
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center">
                <Lock className="h-4 w-4 text-crm-muted" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none transition-all focus:border-crm-primary focus:bg-crm-card focus:ring-1 focus:ring-crm-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-crm-primary py-2.5 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-crm-border"></div>
          <span className="flex-shrink mx-4 text-[10px] text-crm-muted uppercase tracking-wider font-semibold">Or Try Demo Mode</span>
          <div className="flex-grow border-t border-crm-border"></div>
        </div>

        {/* Quick Sign In */}
        <button
          onClick={handleDemoLogin}
          type="button"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-crm-accent/40 bg-crm-accent/5 py-2.5 text-sm font-semibold text-crm-accent shadow-sm transition-all hover:bg-crm-accent/10"
        >
          <span>Explore Demo Sandbox (No Config Needed)</span>
          <ArrowRight className="h-4 w-4 animate-pulse" />
        </button>

        <div className="flex items-center gap-2 justify-center text-[10px] text-crm-muted mt-4 border-t border-crm-border/40 pt-4">
          <ShieldAlert className="h-3.5 w-3.5" />
          <span>Secured with standard Supabase SSL connection protocols.</span>
        </div>
      </div>
    </div>
  );
}
