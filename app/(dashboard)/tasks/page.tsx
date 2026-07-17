"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  tasksService, 
  type Task 
} from "@/lib/services/tasksService";
import { 
  customersService, 
  type Customer 
} from "@/lib/services/customersService";
import { 
  leadsService, 
  type Lead 
} from "@/lib/services/leadsService";
import { createClient } from "@/lib/supabase/client";
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle,
  Building,
  Target,
  Clock,
  Trash2,
  X,
  ChevronDown
} from "lucide-react";

// Form Validation Schema using Zod
const taskFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  customer_id: z.string().min(1, "Please select a customer"),
  lead_id: z.string().optional().nullable(),
  due_date: z.string().min(1, "Due date is required"),
  priority: z.enum(['Low', 'Medium', 'High'])
});

type TaskFormData = z.infer<typeof taskFormSchema>;

export default function TasksPage() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<'Active' | 'Completed' | 'All'>('Active');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  
  // Modals & States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [userName, setUserName] = useState<string>("Active User");

  const fetchTasksData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, customersRes, leadsRes] = await Promise.all([
        tasksService.getTasks(),
        customersService.getCustomers(1, "", "All", 100),
        leadsService.getLeads()
      ]);
      setTasks(tasksRes);
      setCustomers(customersRes.data);
      setLeads(leadsRes);
    } catch (err) {
      console.error("Failed to load tasks pipeline datasets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchTasksData();

    // Retrieve active user info for avatar
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserAvatar(user.user_metadata?.avatar_url || "");
        setUserName(user.user_metadata?.display_name || user.email || "Active User");
      } else {
        const isDemo = document.cookie.split("; ").find((row) => row.startsWith("nexus-demo-session=true"));
        if (isDemo) {
          const storedAvatar = localStorage.getItem("nexus-profile-avatar") || "";
          const storedName = localStorage.getItem("nexus-profile-name") || "Demo Admin";
          setUserAvatar(storedAvatar);
          setUserName(storedName);
        }
      }
    };
    fetchUser();
  }, [fetchTasksData]);

  // React Hook Form
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: { priority: "Medium", lead_id: "" }
  });

  const handleOpenAdd = () => {
    setSelectedCustomerId("");
    reset({
      title: "",
      customer_id: "",
      lead_id: "",
      due_date: new Date().toISOString().split('T')[0],
      priority: "Medium"
    });
    setIsAddOpen(true);
  };

  const onSubmit = async (data: TaskFormData) => {
    try {
      const payload = {
        title: data.title,
        customer_id: data.customer_id,
        lead_id: data.lead_id || null,
        due_date: data.due_date,
        priority: data.priority,
        completed: false
      };
      await tasksService.createTask(payload);
      setIsAddOpen(false);
      fetchTasksData();
    } catch (err) {
      console.error("Failed to create task:", err);
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return { ...t, completed: !t.completed };
        }
        return t;
      }));
      await tasksService.updateTask(task.id, { completed: !task.completed });
    } catch (err) {
      console.error("Failed to update task completion:", err);
      fetchTasksData(); // revert
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== id));
      await tasksService.deleteTask(id);
    } catch (err) {
      console.error("Failed to delete task:", err);
      fetchTasksData();
    }
  };

  // Helper for overdue styling
  const isOverdue = (dueDateStr: string, completed: boolean) => {
    if (completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDateStr < today;
  };

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
      t.customer?.company.toLowerCase().includes(search.toLowerCase()) ||
      (t.lead?.title || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus = 
      statusFilter === 'All' ||
      (statusFilter === 'Completed' && t.completed) ||
      (statusFilter === 'Active' && !t.completed);

    const matchesPriority = 
      priorityFilter === 'All' ||
      t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Filter leads based on selected customer in creation modal
  const filteredLeadsForModal = leads.filter(l => l.customer_id === selectedCustomerId);

  if (!mounted) {
    return <div className="text-white text-sm">Initializing tasks board...</div>;
  }

  const nameInitial = userName ? userName.slice(0, 2).toUpperCase() : "JD";

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tasks Checklist</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Track follow-ups, contract reviews, and action items linked to your customer accounts.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-crm-card/25 p-4 rounded-xl border border-crm-border/40">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-crm-muted" />
          </span>
          <input
            type="text"
            placeholder="Search tasks, accounts, or deals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-1.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none transition-all focus:border-crm-primary focus:bg-crm-card"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-crm-muted">Priority:</span>
            <div className="flex rounded-lg border border-crm-border bg-crm-card/50 p-1">
              {(['All', 'Low', 'Medium', 'High'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                    priorityFilter === p ? 'bg-crm-primary text-white' : 'text-crm-muted hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="flex rounded-lg border border-crm-border bg-crm-card/50 p-1">
            <button
              onClick={() => setStatusFilter('Active')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                statusFilter === 'Active' ? 'bg-crm-primary text-white' : 'text-crm-muted hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('Completed')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                statusFilter === 'Completed' ? 'bg-crm-accent text-white font-bold' : 'text-crm-muted hover:text-white'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setStatusFilter('All')}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                statusFilter === 'All' ? 'bg-crm-cardHover text-white' : 'text-crm-muted hover:text-white'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel rounded-xl divide-y divide-crm-border/40 overflow-hidden animate-pulse">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3 flex-1">
                <div className="h-5 w-5 bg-crm-cardHover/40 rounded" />
                <div className="space-y-1.5 flex-1 max-w-sm">
                  <div className="h-4 w-2/3 bg-crm-cardHover/50 rounded" />
                  <div className="h-3 w-1/2 bg-crm-cardHover/30 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="h-5 w-16 bg-crm-cardHover/40 rounded-full" />
                <div className="h-4 w-20 bg-crm-cardHover/40 rounded" />
                <div className="h-6 w-6 bg-crm-cardHover/40 rounded-full" />
                <div className="h-5 w-5 bg-crm-cardHover/30 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Task List Container */
        <div className="glass-panel rounded-xl divide-y divide-crm-border/40 overflow-hidden shadow-xl">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-crm-muted text-sm bg-crm-card/10">
              No tasks found matching your filters.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const overdue = isOverdue(task.due_date, task.completed);
              return (
                <div 
                  key={task.id} 
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 hover:bg-crm-cardHover/10 transition-all duration-200 group border-l-2 ${
                    overdue 
                      ? 'border-l-rose-500 bg-rose-500/5' 
                      : task.completed
                      ? 'border-l-emerald-500/40'
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    {/* Completion Toggle */}
                    <button 
                      onClick={() => toggleTaskCompletion(task)}
                      className="mt-1 text-crm-muted hover:text-crm-primary transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-crm-accent" />
                      ) : (
                        <Circle className="h-5 w-5 text-crm-muted group-hover:text-crm-primary transition-colors" />
                      )}
                    </button>
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <h3 className={`text-sm font-semibold text-white leading-tight ${task.completed ? 'line-through text-crm-muted font-normal' : ''}`}>
                        {task.title}
                      </h3>
                      
                      {/* Linked Entities */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-crm-muted">
                        <span className="flex items-center gap-1 font-medium text-indigo-400">
                          <Building className="h-3.5 w-3.5 shrink-0" />
                          <span>{task.customer?.name} ({task.customer?.company})</span>
                        </span>
                        
                        {task.lead && (
                          <span className="flex items-center gap-1 font-medium text-sky-400">
                            <Target className="h-3.5 w-3.5 shrink-0" />
                            <span>Deal: {task.lead.title}</span>
                          </span>
                        )}

                        <span className={`flex items-center gap-1 ${overdue ? 'text-rose-400 font-semibold' : 'text-crm-muted'}`}>
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>Due: {task.due_date}</span>
                          {overdue && <span className="text-[10px] uppercase font-bold bg-rose-500/10 px-1 py-0.5 rounded ring-1 ring-rose-500/20 ml-1">Overdue</span>}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badges & Assignee Avatars */}
                  <div className="flex items-center justify-end gap-4 w-full sm:w-auto self-stretch sm:self-center shrink-0">
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      task.priority === "High" 
                        ? "bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/30" 
                        : task.priority === "Medium"
                        ? "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30"
                        : "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                    }`}>
                      {task.priority}
                    </span>

                    {/* Assignee Avatar */}
                    <div className="flex items-center shrink-0" title={`Assigned to ${userName}`}>
                      {userAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={userAvatar} 
                          alt="Assignee avatar" 
                          className="h-6 w-6 rounded-full object-cover ring-1 ring-crm-primary/40"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-crm-primary/20 flex items-center justify-center text-[10px] font-semibold text-crm-primary shrink-0">
                          {nameInitial}
                        </div>
                      )}
                    </div>

                    {/* Delete Task Button */}
                    <button 
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-crm-muted hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/5 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          
          <div className="glass-panel w-full max-w-lg rounded-xl border border-crm-border p-6 shadow-xl relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-crm-border/50 pb-3">
              <h2 className="text-lg font-bold text-white">Create Pipeline Task</h2>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-crm-muted hover:text-white p-1 rounded-lg hover:bg-crm-cardHover transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-crm-muted">Task Description *</label>
                  <input
                    type="text"
                    {...register("title")}
                    placeholder="e.g. Discuss integration deliverables deadline"
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  />
                  {errors.title && <p className="text-[11px] text-rose-400 mt-0.5">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Linked Customer Profile *</label>
                  <div className="relative">
                    <select
                      {...register("customer_id")}
                      onChange={(e) => {
                        setSelectedCustomerId(e.target.value);
                        setValue("lead_id", ""); // Reset lead when customer changes
                      }}
                      className="w-full appearance-none rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    >
                      <option value="">-- Choose Account --</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id} className="bg-crm-bg text-white">
                          {c.name} ({c.company})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-2.5 h-4 w-4 text-crm-muted pointer-events-none" />
                  </div>
                  {errors.customer_id && <p className="text-[11px] text-rose-400 mt-0.5">{errors.customer_id.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Linked Deal (Optional)</label>
                  <div className="relative">
                    <select
                      {...register("lead_id")}
                      disabled={!selectedCustomerId}
                      className="w-full appearance-none rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary disabled:opacity-40"
                    >
                      <option value="">-- No Linked Deal --</option>
                      {filteredLeadsForModal.map((l) => (
                        <option key={l.id} value={l.id} className="bg-crm-bg text-white">
                          {l.title} (${l.value.toLocaleString()})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-2.5 h-4 w-4 text-crm-muted pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Target Due Date *</label>
                  <input
                    type="date"
                    {...register("due_date")}
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  />
                  {errors.due_date && <p className="text-[11px] text-rose-400 mt-0.5">{errors.due_date.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Priority Level</label>
                  <select
                    {...register("priority")}
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-crm-border/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-lg border border-crm-border bg-transparent px-4 py-2 text-xs font-semibold text-crm-muted hover:text-white hover:bg-crm-cardHover transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-crm-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-crm-primary/25 hover:bg-indigo-500 transition-all"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
