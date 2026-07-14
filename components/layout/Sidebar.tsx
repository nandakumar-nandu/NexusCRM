"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CheckSquare, 
  BarChart3, 
  Settings as SettingsIcon,
  Sparkles
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
        <div className="flex items-center gap-3 rounded-lg bg-crm-cardHover/50 p-2.5">
          <div className="h-8 w-8 rounded-full bg-crm-primary/20 flex items-center justify-center text-xs font-semibold text-crm-primary">
            JD
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-xs font-semibold text-white">John Doe</p>
            <p className="truncate text-[10px] text-crm-muted">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
