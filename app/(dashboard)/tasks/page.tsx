import { 
  Plus, 
  Search, 
  Calendar, 
  User2,
  CheckCircle2,
  Circle
} from "lucide-react";

export default function TasksPage() {
  const tasks = [
    { title: "Send revised proposal to Stark Industries", related: "Enterprise CRM Integration", due: "Today", priority: "High", completed: false },
    { title: "Follow up call with David Miller", related: "Starlight Media", due: "Jul 16", priority: "Medium", completed: false },
    { title: "Draft contract terms for Tyrell Corp", related: "SaaS Licensing Deal", due: "Jul 18", priority: "High", completed: false },
    { title: "Schedule internal review for Wayne Enterprises", related: "Cloud Migration", due: "Jul 20", priority: "Low", completed: true },
    { title: "Update CRM configuration documentation", related: "Nexus Labs", due: "Jul 22", priority: "Medium", completed: false },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tasks</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Track actions, follow-ups, and calendar deadlines for your sales pipelines.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all duration-200 hover:bg-indigo-500">
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-crm-muted" />
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-1.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none transition-all focus:border-crm-primary focus:bg-crm-card"
          />
        </div>

        <div className="flex gap-2">
          <span className="rounded-lg bg-crm-primary/10 border border-crm-primary/30 px-3 py-1.5 text-xs font-semibold text-crm-primary">Active (4)</span>
          <span className="rounded-lg bg-crm-card/50 border border-crm-border px-3 py-1.5 text-xs font-semibold text-crm-muted hover:text-white transition-colors cursor-pointer">Completed (1)</span>
        </div>
      </div>

      {/* Task List */}
      <div className="glass-panel rounded-xl divide-y divide-crm-border/50">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-start justify-between gap-4 p-5 hover:bg-crm-cardHover/10 transition-colors duration-150 group">
            <div className="flex items-start gap-4">
              <button className="mt-0.5 text-crm-muted hover:text-crm-primary transition-colors">
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-crm-accent" />
                ) : (
                  <Circle className="h-5 w-5 text-crm-muted group-hover:text-crm-primary transition-colors" />
                )}
              </button>
              
              <div className="space-y-1">
                <h3 className={`text-sm font-semibold text-white ${task.completed ? 'line-through text-crm-muted' : ''}`}>
                  {task.title}
                </h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-crm-muted">
                  <span className="flex items-center gap-1 font-medium text-indigo-400/80">
                    <User2 className="h-3.5 w-3.5" />
                    {task.related}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {task.due}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                task.priority === "High" 
                  ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20" 
                  : task.priority === "Medium"
                  ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20"
              }`}>
                {task.priority} Priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
