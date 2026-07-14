import { 
  Plus, 
  MoreHorizontal, 
  DollarSign, 
  User, 
  Calendar
} from "lucide-react";

export default function LeadsPage() {
  const columns = [
    {
      title: "New Leads",
      count: 2,
      total: "$38,000",
      leads: [
        { title: "Enterprise CRM Integration", client: "Stark Industries", value: "$25,000", date: "Jul 20", owner: "Sarah J." },
        { title: "Cloud Migration Project", client: "Wayne Enterprises", value: "$13,000", date: "Jul 21", owner: "David M." },
      ]
    },
    {
      title: "Contacted",
      count: 1,
      total: "$15,000",
      leads: [
        { title: "API Development Support", client: "Oscorp Holdings", value: "$15,000", date: "Jul 18", owner: "Elena R." },
      ]
    },
    {
      title: "Proposal Sent",
      count: 2,
      total: "$73,000",
      leads: [
        { title: "SaaS Licensing Deal", client: "Tyrell Corp", value: "$45,000", date: "Jul 15", owner: "Marcus C." },
        { title: "Security Audit Consult", client: "Cyberdyne Systems", value: "$28,000", date: "Jul 16", owner: "Sarah J." },
      ]
    },
    {
      title: "Negotiation",
      count: 1,
      total: "$85,000",
      leads: [
        { title: "Global ERP Rollout", client: "Omni Consumer Products", value: "$85,000", date: "Jul 10", owner: "Elena R." },
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Leads & Pipeline</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Track deals through stages and monitor overall pipeline metrics.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all duration-200 hover:bg-indigo-500">
            <Plus className="h-4 w-4" />
            <span>Create Deal</span>
          </button>
        </div>
      </div>

      {/* Board Layout */}
      <div className="grid gap-6 overflow-x-auto pb-4 md:grid-cols-4 min-w-[900px] md:min-w-0">
        {columns.map((col, index) => (
          <div key={index} className="flex flex-col rounded-xl bg-crm-card/40 p-4 border border-crm-border/40">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-crm-border/60">
              <div>
                <h3 className="text-sm font-bold text-white">{col.title}</h3>
                <span className="text-xs text-crm-muted">{col.count} deals • {col.total}</span>
              </div>
              <button className="rounded p-1 text-crm-muted hover:bg-crm-cardHover hover:text-white transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            {/* Column Cards */}
            <div className="mt-4 flex-1 space-y-3.5">
              {col.leads.map((lead, leadIdx) => (
                <div key={leadIdx} className="glass-panel rounded-lg p-4 transition-all duration-200 hover:border-crm-primary/40 hover:-translate-y-0.5 cursor-pointer">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white line-clamp-2">{lead.title}</h4>
                    <span className="flex items-center text-[10px] font-semibold text-crm-accent bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <DollarSign className="h-3 w-3" />
                      {lead.value.replace('$', '')}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-[11px] text-crm-muted font-medium">{lead.client}</p>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-crm-border/40 pt-3 text-[10px] text-crm-muted">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {lead.date}
                    </span>
                    <span className="flex items-center gap-1 rounded bg-crm-cardHover/50 px-1.5 py-0.5 text-slate-300">
                      <User className="h-3 w-3 text-indigo-400" />
                      {lead.owner}
                    </span>
                  </div>
                </div>
              ))}

              {/* Add deal to column */}
              <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-crm-border py-2 text-xs font-semibold text-crm-muted transition-colors hover:border-crm-primary hover:text-white">
                <Plus className="h-3.5 w-3.5" />
                <span>Add Deal</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
