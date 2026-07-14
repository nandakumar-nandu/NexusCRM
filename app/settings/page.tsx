import { 
  User, 
  Database, 
  Bell, 
  Shield, 
  Save,
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function SettingsPage() {
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
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="glass-panel rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white border-b border-crm-border pb-3">User Profile</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-crm-muted">Full Name</label>
                <input 
                  type="text" 
                  defaultValue="John Doe" 
                  className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-crm-muted">Role</label>
                <input 
                  type="text" 
                  defaultValue="Administrator" 
                  disabled
                  className="w-full rounded-lg border border-crm-border bg-crm-cardHover/50 px-3.5 py-2 text-sm text-crm-muted cursor-not-allowed outline-none" 
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-crm-muted">Email Address</label>
                <input 
                  type="email" 
                  defaultValue="john.doe@acme.com" 
                  className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary" 
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
                  your-project-id.supabase.co
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-crm-muted">Client Libs</span>
                <span className="font-semibold text-white">@supabase/supabase-js v2.x</span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="flex items-center gap-2 rounded-lg bg-crm-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5">
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
