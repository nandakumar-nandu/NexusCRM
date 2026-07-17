"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { customersService, type Customer } from "@/lib/services/customersService";
import { leadsService, type Lead } from "@/lib/services/leadsService";
import { tasksService, type Task } from "@/lib/services/tasksService";
import { 
  Building, 
  Mail, 
  Phone, 
  ArrowLeft, 
  Plus, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  Clock, 
  Circle, 
  CheckCircle2, 
  FileText,
  Loader2
} from "lucide-react";

// Unified timeline item type definition
type TimelineItem = 
  | { type: "note"; id: string; content: string; date: string; author: string }
  | { type: "task"; id: string; title: string; date: string; priority: string; completed: boolean }
  | { type: "lead"; id: string; title: string; date: string; value: number; stage: string; probability: number };

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomerDetails = useCallback(async () => {
    try {
      const [customerData, notesData, leadsData, tasksData] = await Promise.all([
        customersService.getCustomer(customerId),
        tasksService.getCustomerNotes(customerId),
        leadsService.getLeads(),
        tasksService.getTasks()
      ]);

      setCustomer(customerData);

      // Filter leads & tasks specifically for this customer profile
      const customerLeads = leadsData.filter(l => l.customer_id === customerId);
      const customerTasks = tasksData.filter(t => t.customer_id === customerId);

      setLeads(customerLeads);
      setTasks(customerTasks);

      // Construct a unified chronological timeline
      const unifiedTimeline: TimelineItem[] = [];

      // 1. Add notes
      notesData.forEach(n => {
        unifiedTimeline.push({
          type: "note",
          id: n.id,
          content: n.content,
          date: n.created_at || new Date().toISOString(),
          author: "You"
        });
      });

      // 2. Add tasks
      customerTasks.forEach(t => {
        unifiedTimeline.push({
          type: "task",
          id: t.id,
          title: t.title,
          date: t.created_at || t.due_date,
          priority: t.priority,
          completed: t.completed
        });
      });

      // 3. Add leads (opportunities)
      customerLeads.forEach(l => {
        unifiedTimeline.push({
          type: "lead",
          id: l.id,
          title: l.title,
          date: l.created_at || new Date().toISOString(),
          value: l.value,
          stage: l.stage,
          probability: l.probability
        });
      });

      // Sort chronological descending (newest first)
      unifiedTimeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setTimeline(unifiedTimeline);
    } catch (err) {
      console.error("Failed to load customer detail datasets:", err);
      // Redirect back if customer doesn't exist
      router.push("/customers");
    } finally {
      setLoading(false);
    }
  }, [customerId, router]);

  useEffect(() => {
    if (customerId) {
      fetchCustomerDetails();
    }
  }, [customerId, fetchCustomerDetails]);

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      await tasksService.createCustomerNote({
        customer_id: customerId,
        content: noteContent
      });
      setNoteContent("");
      // Refresh the timeline data
      await fetchCustomerDetails();
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      // Toggle state optimistically
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
      // Re-map timeline optimistically
      setTimeline(prev => prev.map(item => {
        if (item.type === "task" && item.id === task.id) {
          return { ...item, completed: !item.completed };
        }
        return item;
      }));

      await tasksService.updateTask(task.id, { completed: !task.completed });
    } catch (err) {
      console.error("Failed to toggle task completion status:", err);
      fetchCustomerDetails();
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-crm-muted">
        <Loader2 className="h-6 w-6 animate-spin text-crm-primary" />
        <span className="ml-2 text-sm">Loading profile timeline...</span>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Breadcrumb Back link */}
      <div className="flex items-center gap-2">
        <Link 
          href="/customers"
          className="flex items-center gap-1.5 text-xs text-crm-muted hover:text-white transition-all bg-crm-card/50 border border-crm-border px-3 py-1.5 rounded-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Customers</span>
        </Link>
      </div>

      {/* Profile Info Header */}
      <div className="glass-panel rounded-xl p-6 border border-crm-border/40 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-crm-primary to-crm-secondary flex items-center justify-center text-white text-xl font-bold shrink-0">
            {customer.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-white tracking-tight leading-none">{customer.name}</h1>
            <div className="text-sm text-crm-muted flex items-center gap-1.5">
              <Building className="h-4 w-4 text-indigo-400 shrink-0" />
              <span>{customer.company}</span>
            </div>
            
            {/* Status Badge */}
            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset mt-1.5 ${
              customer.status === "Active" 
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" 
                : customer.status === "Inactive"
                ? "bg-crm-border text-crm-muted ring-crm-border"
                : "bg-sky-500/10 text-sky-400 ring-sky-500/30"
            }`}>
              {customer.status} Profile
            </span>
          </div>
        </div>

        {/* Contact info list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-crm-border/40 pt-4 md:pt-0 md:pl-6 text-sm text-crm-muted">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-400 shrink-0" />
              <a href={`mailto:${customer.email}`} className="hover:text-white transition-colors truncate">{customer.email || "No email stored"}</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-400 shrink-0" />
              <a href={`tel:${customer.phone}`} className="hover:text-white transition-colors">{customer.phone || "No phone stored"}</a>
            </div>
          </div>
          <div className="flex flex-wrap gap-1 items-start content-start">
            {customer.tags && customer.tags.length > 0 ? (
              customer.tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center rounded bg-crm-cardHover px-2 py-0.5 text-[10px] font-medium text-indigo-300 ring-1 ring-crm-border">
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-xs text-crm-muted italic">No custom tags added</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* CENTER / LEFT: Timeline (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Wrapper Card */}
          <div className="glass-panel rounded-xl border border-crm-border/40 p-6 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              <span>Activity Timeline</span>
            </h2>

            {/* Add Note Inline Form */}
            <form onSubmit={handleAddNoteSubmit} className="space-y-3 bg-crm-cardHover/10 p-4 rounded-lg border border-crm-border/30">
              <div className="flex items-center gap-2 text-xs font-semibold text-crm-muted">
                <MessageSquare className="h-4 w-4 text-indigo-400" />
                <span>Add Discussion Note</span>
              </div>
              <textarea
                rows={2}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Log discussion notes, next steps, or customer feedback..."
                className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2.5 text-sm text-white placeholder-crm-muted outline-none focus:border-crm-primary resize-none transition-all"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!noteContent.trim() || submittingNote}
                  className="flex items-center gap-1.5 rounded bg-crm-primary px-3 py-1.5 text-xs font-semibold text-white shadow shadow-crm-primary/20 transition-all hover:bg-indigo-500 disabled:opacity-50"
                >
                  {submittingNote ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>

            {/* Chronological Timeline Render */}
            <div className="relative border-l border-crm-border/60 pl-6 ml-3.5 space-y-8">
              {timeline.length === 0 ? (
                <div className="text-center py-8 text-crm-muted text-xs italic">
                  No logged activities yet. Add a note or create a task for this customer.
                </div>
              ) : (
                timeline.map((item, idx) => {
                  const formattedDate = new Date(item.date).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                  });

                  return (
                    <div key={`${item.type}-${item.id}-${idx}`} className="relative">
                      {/* Timeline Icon indicator */}
                      <span className="absolute -left-10 top-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-crm-card border border-crm-border">
                        {item.type === "note" ? (
                          <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                        ) : item.type === "task" ? (
                          <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Target className="h-3.5 w-3.5 text-sky-400" />
                        )}
                      </span>

                      {/* Content Card */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-4 text-[10px] text-crm-muted">
                          <span className="font-semibold uppercase tracking-wider text-indigo-400">
                            {item.type === "note" 
                              ? "Discussion Note" 
                              : item.type === "task" 
                              ? "Timeline Task" 
                              : "Deal Opportunity"}
                          </span>
                          <span>{formattedDate}</span>
                        </div>

                        {/* Note Layout */}
                        {item.type === "note" && (
                          <div className="bg-crm-card/45 p-3 rounded-lg border border-crm-border/30 text-sm text-slate-200 leading-relaxed">
                            <p>{item.content}</p>
                            <div className="text-[10px] text-crm-muted mt-2">Logged by {item.author}</div>
                          </div>
                        )}

                        {/* Task Layout */}
                        {item.type === "task" && (
                          <div className="bg-crm-card/45 p-3 rounded-lg border border-crm-border/30 flex items-center justify-between gap-3 text-sm text-white">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  const originalTask = tasks.find(t => t.id === item.id);
                                  if (originalTask) toggleTaskCompletion(originalTask);
                                }}
                                className="text-crm-muted hover:text-crm-primary transition-colors shrink-0"
                              >
                                {item.completed ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-crm-accent" />
                                ) : (
                                  <Circle className="h-4.5 w-4.5 text-crm-muted hover:text-crm-primary transition-colors" />
                                )}
                              </button>
                              <span className={item.completed ? "line-through text-crm-muted font-normal" : "font-semibold"}>
                                {item.title}
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                              item.priority === "High" 
                                ? "bg-rose-500/10 text-rose-400" 
                                : item.priority === "Medium"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                        )}

                        {/* Lead Opportunity Layout */}
                        {item.type === "lead" && (
                          <div className="bg-crm-card/45 p-3 rounded-lg border border-crm-border/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-white">
                            <div className="space-y-0.5">
                              <h4 className="font-semibold">{item.title}</h4>
                              <div className="flex items-center gap-3 text-[10px] text-crm-muted">
                                <span className="text-indigo-400 font-bold">${item.value.toLocaleString()}</span>
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {item.probability}%
                                </span>
                              </div>
                            </div>
                            <span className="inline-flex rounded bg-sky-500/10 text-sky-400 px-2 py-0.5 text-xs font-semibold self-start sm:self-center">
                              {item.stage}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Related Deals & Leads */}
        <div className="space-y-6">
          <div className="glass-panel rounded-xl border border-crm-border/40 p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-400" />
              <span>Related Deals ({leads.length})</span>
            </h2>

            <div className="space-y-3">
              {leads.length === 0 ? (
                <div className="text-center py-6 text-crm-muted text-xs italic bg-crm-card/10 border border-dashed border-crm-border/30 rounded-lg">
                  No active opportunities linked.
                </div>
              ) : (
                leads.map(lead => (
                  <div 
                    key={lead.id} 
                    className="p-3.5 bg-crm-cardHover/10 rounded-lg border border-crm-border/30 space-y-2 hover:border-crm-border transition-colors"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-sm font-semibold text-white leading-snug line-clamp-1">{lead.title}</h4>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        lead.stage === "Closed" 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : lead.stage === "Proposal"
                          ? "bg-indigo-500/10 text-indigo-400"
                          : "bg-crm-cardHover text-crm-muted"
                      }`}>
                        {lead.stage}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium border-t border-crm-border/20 pt-2 mt-2">
                      <span className="text-indigo-400 font-bold">${lead.value.toLocaleString()}</span>
                      <div className="flex items-center gap-2 text-crm-muted text-[10px]">
                        <span className="flex items-center gap-0.5">
                          <TrendingUp className="h-3 w-3 text-indigo-400" />
                          {lead.probability}%
                        </span>
                        <span className="flex items-center gap-0.5 text-[9px]">
                          <Calendar className="h-3 w-3" />
                          {lead.expected_close_date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Create Deal Opportunity CTA */}
            <Link 
              href="/leads"
              className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-crm-border bg-crm-cardHover/30 hover:bg-crm-cardHover py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Deal</span>
            </Link>
          </div>

          {/* Quick Notes Summary Card */}
          {customer.notes && (
            <div className="glass-panel rounded-xl border border-crm-border/40 p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-indigo-400" />
                <span>Account Profile Notes</span>
              </h3>
              <p className="text-xs text-crm-muted leading-relaxed whitespace-pre-line bg-crm-cardHover/5 p-3 rounded-lg border border-crm-border/20">
                {customer.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
