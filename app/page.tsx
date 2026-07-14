import { 
  Users, 
  Target, 
  CheckSquare, 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Clock, 
  Plus
} from "lucide-react";

export default function Dashboard() {
  const stats = [
    { name: "Total Customers", value: "1,248", change: "+12.5%", label: "vs last month", icon: Users, color: "text-indigo-400" },
    { name: "Active Leads", value: "84", change: "+8.2%", label: "vs last month", icon: Target, color: "text-sky-400" },
    { name: "Open Tasks", value: "18", change: "4 urgent", label: "due this week", icon: CheckSquare, color: "text-amber-400" },
    { name: "Pipeline Value", value: "$320.5K", change: "+18.3%", label: "vs last month", icon: DollarSign, color: "text-emerald-400" },
  ];

  const recentLeads = [
    { name: "Acme Corp", contact: "Sarah Jenkins", value: "$45,000", stage: "Proposal Sent", status: "high" },
    { name: "Starlight Media", contact: "David Miller", value: "$12,500", stage: "Discovery Call", status: "medium" },
    { name: "Nexus Labs", contact: "Elena Rostova", value: "$85,000", stage: "Contract Negotiation", status: "high" },
    { name: "Velocity Group", contact: "Marcus Chen", value: "$28,000", stage: "Qualified Lead", status: "low" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, <span className="bg-gradient-to-r from-crm-primary to-indigo-300 bg-clip-text text-transparent">John</span>
          </h1>
          <p className="mt-1 text-sm text-crm-muted">
            {"Here's what's happening with your sales pipeline today."}
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0">
          <Plus className="h-4 w-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-panel glass-panel-hover rounded-xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-crm-muted uppercase tracking-wider">{stat.name}</span>
                <span className={`rounded-lg bg-crm-cardHover p-2 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white">{stat.value}</span>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                  <span className="font-semibold text-crm-accent flex items-center">
                    <TrendingUp className="mr-0.5 h-3.5 w-3.5 inline" />
                    {stat.change}
                  </span>
                  <span className="text-crm-muted">{stat.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main activity card */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Active Pipeline Highlights</h2>
            <button className="flex items-center gap-1 text-xs text-crm-primary font-medium hover:underline">
              <span>View details</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentLeads.map((lead, i) => (
              <div key={i} className="flex items-center justify-between border-b border-crm-border/50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${
                    lead.status === "high" ? "bg-rose-500 animate-pulse" : lead.status === "medium" ? "bg-amber-500" : "bg-emerald-500"
                  }`} />
                  <div>
                    <h3 className="text-sm font-semibold text-white">{lead.name}</h3>
                    <p className="text-xs text-crm-muted">{lead.contact}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-white">{lead.value}</span>
                  <p className="text-[10px] text-crm-accent font-medium mt-0.5">{lead.stage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Small overview card */}
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Goal Progress</h2>
              <Clock className="h-4.5 w-4.5 text-crm-muted" />
            </div>
            <p className="text-xs text-crm-muted">Monthly conversion goal status</p>
            
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-crm-muted">Qualified Leads</span>
                <span className="text-white">68%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-crm-cardHover overflow-hidden">
                <div className="h-full bg-crm-primary rounded-full transition-all duration-500" style={{ width: "68%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-crm-muted">Proposal Conversions</span>
                <span className="text-white">45%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-crm-cardHover overflow-hidden">
                <div className="h-full bg-crm-accent rounded-full transition-all duration-500" style={{ width: "45%" }} />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-crm-border/50 pt-4 flex justify-between items-center text-xs">
            <span className="text-crm-muted">Quarterly Goal</span>
            <span className="font-semibold text-white">$500,000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
