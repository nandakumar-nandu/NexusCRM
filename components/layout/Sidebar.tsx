"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CheckSquare, 
  BarChart3, 
  Settings as SettingsIcon,
  Sparkles,
  LogOut
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Leads", href: "/leads", icon: Target },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl: string } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const fetchUser = async () => {
      // 1. Check for real Supabase Session
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({
          name: authUser.user_metadata?.display_name || authUser.email || "Active User",
          email: authUser.email || "",
          avatarUrl: authUser.user_metadata?.avatar_url || "",
        });
        return;
      }

      // 2. Check for Mock Sandbox cookie
      const isDemo = document.cookie.split("; ").find((row) => row.startsWith("nexus-demo-session=true"));
      if (isDemo) {
        const storedName = localStorage.getItem("nexus-profile-name") || "Demo Admin";
        const storedAvatar = localStorage.getItem("nexus-profile-avatar") || "";
        setUser({
          name: storedName,
          email: "demo@nexuscrm.com",
          avatarUrl: storedAvatar,
        });
        return;
      }
    };

    fetchUser();

    // Listen to real-time auth changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.display_name || session.user.email || "Active User",
          email: session.user.email || "",
          avatarUrl: session.user.user_metadata?.avatar_url || "",
        });
      }
    });

    // Custom listener for local storage profile changes (sandbox mode)
    const handleStorageChange = () => {
      const isDemo = document.cookie.split("; ").find((row) => row.startsWith("nexus-demo-session=true"));
      if (isDemo) {
        const storedName = localStorage.getItem("nexus-profile-name") || "Demo Admin";
        const storedAvatar = localStorage.getItem("nexus-profile-avatar") || "";
        setUser({
          name: storedName,
          email: "demo@nexuscrm.com",
          avatarUrl: storedAvatar,
        });
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("profile-update", handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("profile-update", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // Clear demo session cookies
    document.cookie = "nexus-demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/login");
    router.refresh();
  };

  const nameInitial = user?.name ? user.name.slice(0, 2).toUpperCase() : "JD";

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-crm-border bg-crm-card/90 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 gap-2.5 border-b border-crm-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-crm-primary to-crm-secondary shadow-md shadow-crm-primary/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
            Nexus
          </span>
          <span className="font-bold text-lg text-crm-accent ml-0.5">CRM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 px-4 py-6">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-crm-primary text-white shadow-lg shadow-crm-primary/25"
                  : "text-crm-muted hover:bg-crm-cardHover hover:text-white"
              }`}
            >
              <Icon className={`h-4.5 w-4.5 transition-transform duration-200 group-hover:scale-110 ${
                isActive ? "text-white" : "text-crm-muted group-hover:text-crm-primary"
              }`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-crm-border p-4">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-crm-cardHover/50 p-2.5">
          <div className="flex items-center gap-3 overflow-hidden">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt="User avatar"
                className="h-8 w-8 rounded-full object-cover ring-1 ring-crm-primary/40"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-crm-primary/20 flex items-center justify-center text-xs font-semibold text-crm-primary shrink-0">
                {nameInitial}
              </div>
            )}
            <div className="overflow-hidden">
              <p className="truncate text-xs font-semibold text-white">{user?.name || "Loading..."}</p>
              <p className="truncate text-[10px] text-crm-muted">{user?.email || "acme.com"}</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            type="button"
            title="Log Out"
            className="rounded p-1.5 text-crm-muted hover:bg-rose-500/10 hover:text-rose-400 transition-colors shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
