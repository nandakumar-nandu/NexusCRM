import { 
  TrendingUp, 
  Calendar
} from "lucide-react";

export default function ReportsPage() {
  const chartData = [
    { label: "Jan", revenue: "$24,000", percentage: "45%" },
    { label: "Feb", revenue: "$32,000", percentage: "60%" },
    { label: "Mar", revenue: "$45,000", percentage: "85%" },
    { label: "Apr", revenue: "$28,000", percentage: "50%" },
    { label: "May", revenue: "$55,000", percentage: "100%" },
    { label: "Jun", revenue: "$48,000", percentage: "90%" },
  ];

  const categories = [
    { name: "Enterprise Licenses", value: "$120,500", percentage: 55, color: "bg-indigo-500" },
    { name: "Consulting & Audit", value: "$65,000", percentage: 30, color: "bg-sky-500" },
    { name: "Cloud Migrations", value: "$35,000", percentage: 15, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Reports & Analytics</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Visualize your enterprise growth, sales performance, and conversions.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-crm-border bg-crm-card/50 px-3 py-2 text-xs font-semibold text-crm-muted transition-colors hover:bg-crm-cardHover hover:text-white">
            <Calendar className="h-3.5 w-3.5" />
            <span>Last 6 Months</span>
          </button>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Revenue chart mockup */}
        <div className="glass-panel rounded-xl p-6 md:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-crm-muted">Monthly Revenue Trends</h2>
            <span className="flex items-center text-xs font-semibold text-crm-accent bg-emerald-500/10 px-2 py-0.5 rounded">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              +14% MoM
            </span>
          </div>

          {/* Styled Bar Graph Chart */}
          <div className="flex h-56 items-end justify-between gap-4 pt-4 border-b border-crm-border/50">
            {chartData.map((data, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2 group cursor-pointer">
                {/* Value tooltip on hover */}
                <span className="text-[10px] font-bold text-crm-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {data.revenue}
                </span>
                
                {/* Bar */}
                <div className="relative w-full rounded-t-md bg-crm-cardHover group-hover:bg-crm-primary/20 transition-all duration-300 overflow-hidden" style={{ height: '140px' }}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-crm-primary to-indigo-400 group-hover:from-indigo-400 group-hover:to-sky-400 transition-all duration-300"
                    style={{ height: data.percentage }}
                  />
                </div>
                
                {/* Label */}
                <span className="text-xs text-crm-muted font-medium mt-1">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product categories split */}
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-crm-muted">Revenue by Category</h2>
            <p className="text-xs text-crm-muted">Key products distribution</p>

            <div className="space-y-4 mt-6">
              {categories.map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-white flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${cat.color}`} />
                      {cat.name}
                    </span>
                    <span className="text-crm-muted">{cat.value}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-crm-cardHover overflow-hidden">
                    <div className={`h-full rounded-full ${cat.color}`} style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-crm-border/50 pt-4 flex justify-between items-center text-xs">
            <span className="text-crm-muted">Total Sales Segment</span>
            <span className="font-bold text-white">$220,500</span>
          </div>
        </div>
      </div>
    </div>
  );
}
