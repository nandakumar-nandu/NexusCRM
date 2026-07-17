"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { roleService, type UserRole } from "@/lib/services/roleService";
import { 
  User, 
  Database, 
  Bell, 
  Shield, 
  Save,
  CheckCircle,
  ExternalLink,
  Check,
  AlertCircle
} from "lucide-react";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("viewer");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    
    const loadProfile = async () => {
      try {
        const currentRole = await roleService.getUserRole();
        setRole(currentRole);
      } catch (e) {
        console.error("Failed to load user role:", e);
      }

      // Check for real session
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setDisplayName(user.user_metadata?.display_name || "");
        setAvatarUrl(user.user_metadata?.avatar_url || "");
        setEmail(user.email || "");
        return;
      }

      // Check for demo session
      const isDemo = document.cookie.split("; ").find((row) => row.startsWith("nexus-demo-session=true"));
      if (isDemo) {
        setIsDemoMode(true);
        setDisplayName(localStorage.getItem("nexus-profile-name") || "Demo Admin");
        setAvatarUrl(localStorage.getItem("nexus-profile-avatar") || "");
        setEmail("demo@nexuscrm.com");
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      // Save current role level
      await roleService.setUserRole(role);

      if (isDemoMode) {
        // Sandbox local storage mode
        localStorage.setItem("nexus-profile-name", displayName);
        localStorage.setItem("nexus-profile-avatar", avatarUrl);
        // Dispatch custom update event so that sidebar receives updates
        window.dispatchEvent(new Event("profile-update"));
        setSuccess(true);
      } else {
        // Real Supabase auth metadata update
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            display_name: displayName,
            avatar_url: avatarUrl
          }
        });

        if (updateError) {
          throw updateError;
        }
        setSuccess(true);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-crm-muted">
          Manage your CRM configuration, integrations, and preferences.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left menu navigation placeholder */}
        <div className="space-y-1">
          <button className="flex w-full items-center gap-3 rounded-lg bg-crm-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-crm-primary/10">
            <User className="h-4.5 w-4.5" />
            <span>Profile Details</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-crm-muted hover:bg-crm-cardHover hover:text-white transition-colors">
            <Database className="h-4.5 w-4.5" />
            <span>Supabase Connection</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-crm-muted hover:bg-crm-cardHover hover:text-white transition-colors">
            <Bell className="h-4.5 w-4.5" />
            <span>Notifications</span>
          </button>
          <button className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-crm-muted hover:bg-crm-cardHover hover:text-white transition-colors">
            <Shield className="h-4.5 w-4.5" />
            <span>Security & Access</span>
          </button>
        </div>

        {/* Right content forms */}
        <form onSubmit={handleSave} className="md:col-span-2 space-y-6">
          {/* Status alerts */}
          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm text-emerald-400">
              <Check className="h-4.5 w-4.5" />
              <span>Profile settings updated successfully!</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 text-sm text-rose-400">
              <AlertCircle className="h-4.5 w-4.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-crm-border pb-3">User Profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-crm-muted">Display Name / Full Name</label>
                <input 
                  type="text" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card" 
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-crm-muted">Avatar URL</label>
                <input 
                  type="text" 
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card" 
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-crm-muted">Security Role Level</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="manager">Manager (Edit, No Delete)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
                <p className="text-[10px] text-crm-muted mt-1">
                  Determines your access capabilities and database permissions.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-crm-muted">Email Address (Read-only)</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="w-full rounded-lg border border-crm-border bg-crm-cardHover/30 px-3.5 py-2 text-sm text-crm-muted cursor-not-allowed outline-none" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-crm-muted">Authentication Mode</label>
                <input 
                  type="text" 
                  value={isDemoMode ? "Sandbox Sandbox Mode" : "Supabase Authenticated"} 
                  disabled
                  className="w-full rounded-lg border border-crm-border bg-crm-cardHover/30 px-3.5 py-2 text-sm text-crm-muted cursor-not-allowed outline-none font-medium" 
                />
              </div>
            </div>
          </div>

          {/* Database Integration Card */}
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-crm-border pb-3">
              <h2 className="text-lg font-bold text-white">Database Integration</h2>
              <span className="flex items-center gap-1 text-xs font-semibold text-crm-accent bg-emerald-500/10 px-2 py-0.5 rounded">
                <CheckCircle className="h-3.5 w-3.5" />
                Active Connection
              </span>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex justify-between text-sm">
                <span className="text-crm-muted">Database Engine</span>
                <span className="font-semibold text-white">PostgreSQL (Supabase)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-crm-muted">Connection Endpoint</span>
                <span className="font-semibold text-indigo-400 flex items-center gap-1 cursor-pointer hover:underline">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL.replace("https://", "") : "your-project-id.supabase.co"}
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-crm-muted">Client Libraries</span>
                <span className="font-semibold text-white">@supabase/supabase-js & @supabase/ssr</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-crm-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? "Saving changes..." : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
