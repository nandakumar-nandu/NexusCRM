"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  MouseSensor, 
  TouchSensor, 
  useDroppable, 
  useDraggable, 
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  leadsService, 
  type Lead 
} from "@/lib/services/leadsService";
import { 
  customersService, 
  type Customer 
} from "@/lib/services/customersService";
import { 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  Search, 
  Calendar, 
  TrendingUp, 
  Building,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Clock,
  MoreVertical,
  ChevronDown,
  Download
} from "lucide-react";
import { roleService, type UserRole } from "@/lib/services/roleService";
import Papa from "papaparse";

// Form Validation Schema using Zod
const leadFormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  customer_id: z.string().min(1, "Please select a customer"),
  value: z.number().min(0, "Value must be a positive number"),
  stage: z.enum(['New', 'Contacted', 'Qualified', 'Proposal', 'Closed']),
  probability: z.number().min(0).max(100, "Probability must be between 0 and 100"),
  expected_close_date: z.string().min(1, "Expected close date is required"),
  notes: z.string().optional()
});

type LeadFormData = z.infer<typeof leadFormSchema>;

const PIPELINE_STAGES: Lead['stage'][] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Closed'];

export default function LeadsPage() {
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Modal / Toggles
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);

  // Initialize sensors.
  // Note explaining how dnd-kit drag sensors work:
  // Drag sensors translate physical interaction types (clicks, screen touch drag, keyboard buttons) into drag operations.
  // 1. MouseSensor: triggers dragging after a 5px movement threshold (activationConstraint) to allow standard click triggers.
  // 2. TouchSensor: delays activation for 250ms to allow normal scrolling on mobile devices before picking up cards.
  // 3. KeyboardSensor: supports accessiblity allowing navigation via Arrow keys, Space, and Tab.
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const fetchLeadsAndCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const [leadsRes, customersRes] = await Promise.all([
        leadsService.getLeads(),
        customersService.getCustomers(1, "", "All", 100) // load list of customers for select drop-down
      ]);
      setLeads(leadsRes);
      setCustomers(customersRes.data);
    } catch (err) {
      console.error("Failed to load leads pipeline data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchLeadsAndCustomers();
  }, [fetchLeadsAndCustomers]);

  const [role, setRole] = useState<UserRole>("viewer");

  // Load and listen to role updates
  useEffect(() => {
    const fetchRole = async () => {
      const currentRole = await roleService.getUserRole();
      setRole(currentRole);
    };
    fetchRole();

    window.addEventListener("role-change", fetchRole);
    return () => window.removeEventListener("role-change", fetchRole);
  }, []);

  // Comments explaining CSV Export logic:
  // 1. Fetches current deals/opportunities list.
  // 2. Maps database fields (title, company, value, stage, probability, date) to structured headers.
  // 3. Serializes json array to csv formatted string using Papa.unparse().
  // 4. Downloads generated csv text file instantly in the browser.
  const handleExportCSV = () => {
    const csvData = leads.map(l => ({
      Title: l.title,
      Customer: l.customer?.name || "Unassigned",
      Company: l.customer?.company || "N/A",
      Value: l.value,
      Stage: l.stage,
      Probability: `${l.probability}%`,
      "Expected Close Date": l.expected_close_date,
      Notes: l.notes || ""
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nexus-leads-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // React Hook Form for Lead modal
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { stage: "New", probability: 10, value: 0 }
  });

  // Handle Drag and Drop End
  const handleDragEnd = async (event: DragEndEvent) => {
    if (role === "viewer") return;
    const { active, over } = event;
    if (!over) return;

    const leadId = active.id as string;
    const targetStage = over.id as Lead['stage'];

    const targetLead = leads.find(l => l.id === leadId);
    if (!targetLead || targetLead.stage === targetStage) return;

    // Optimistically update UI local states
    const originalLeads = [...leads];
    setLeads(prevLeads => prevLeads.map(l => {
      if (l.id === leadId) {
        return { ...l, stage: targetStage };
      }
      return l;
    }));

    try {
      // Persist status change in service client
      await leadsService.updateLead(leadId, { stage: targetStage });
    } catch (err) {
      console.error("Failed to update lead stage after drag-and-drop:", err);
      // Rollback on database failure
      setLeads(originalLeads);
    }
  };

  // Open Create Modal
  const handleOpenAdd = () => {
    setEditingLead(null);
    reset({
      title: "",
      customer_id: "",
      value: 0,
      stage: "New",
      probability: 10,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // default 30 days
      notes: ""
    });
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (lead: Lead) => {
    setEditingLead(lead);
    reset({
      title: lead.title,
      customer_id: lead.customer_id,
      value: lead.value,
      stage: lead.stage,
      probability: lead.probability,
      expected_close_date: lead.expected_close_date,
      notes: lead.notes
    });
    setIsAddEditOpen(true);
    setActionDropdownOpen(null);
  };

  // Create / Update Submit
  const onSubmit = async (data: LeadFormData) => {
    try {
      if (editingLead) {
        await leadsService.updateLead(editingLead.id, data);
      } else {
        await leadsService.createLead(data);
      }
      setIsAddEditOpen(false);
      setEditingLead(null);
      fetchLeadsAndCustomers();
    } catch (err) {
      console.error("Failed to save lead:", err);
    }
  };

  // Open Delete warning
  const handleOpenDelete = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDeleteOpen(true);
    setActionDropdownOpen(null);
  };

  // Confirm delete
  const onDeleteConfirm = async () => {
    if (!selectedLead) return;
    try {
      await leadsService.deleteLead(selectedLead.id);
      setIsDeleteOpen(false);
      setSelectedLead(null);
      fetchLeadsAndCustomers();
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  // Filter leads based on Search bar value
  const filteredLeads = leads.filter(l => 
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
    l.customer?.company.toLowerCase().includes(search.toLowerCase())
  );

  // Group leads by stage for Kanban render
  const leadsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = filteredLeads.filter(l => l.stage === stage);
    return acc;
  }, {} as Record<Lead['stage'], Lead[]>);

  // Total Pipeline values
  const getStageTotalValue = (stageLeads: Lead[]) => {
    return stageLeads.reduce((sum, l) => sum + l.value, 0);
  };

  if (!mounted) {
    return <div className="text-white text-sm">Initializing pipeline board...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Sales Leads</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Track and nurture deals across your sales pipeline stage funnel.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center rounded-lg border border-crm-border bg-crm-card/50 p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`rounded px-2.5 py-1 text-crm-muted transition-all hover:text-white ${
                viewMode === 'kanban' ? 'bg-crm-primary text-white font-semibold' : ''
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded px-2.5 py-1 text-crm-muted transition-all hover:text-white ${
                viewMode === 'list' ? 'bg-crm-primary text-white font-semibold' : ''
              }`}
            >
              <ListIcon className="h-4 w-4" />
            </button>
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-crm-border bg-crm-cardHover px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-crm-card hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Export CSV</span>
          </button>

          {role !== "viewer" && (
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Create Deal</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center">
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-crm-muted" />
          </span>
          <input
            type="text"
            placeholder="Search deals, company or contact name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-1.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none focus:border-crm-primary focus:bg-crm-card transition-all"
          />
        </div>
      </div>

      {loading ? (
        viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 animate-pulse">
            {PIPELINE_STAGES.map((stage) => (
              <div key={stage} className="glass-panel rounded-xl p-4 bg-crm-cardHover/10 border border-crm-border/10 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-crm-border/10">
                  <div className="h-4.5 w-16 bg-crm-cardHover/50 rounded" />
                  <div className="h-4 w-6 bg-crm-cardHover/60 rounded" />
                </div>
                {[1, 2].map((i) => (
                  <div key={i} className="glass-panel h-36 rounded-lg p-3 bg-crm-cardHover/20 border border-crm-border/10 flex flex-col justify-between" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-crm-border/40 bg-crm-card/20 rounded-xl overflow-hidden animate-pulse">
            <div className="bg-crm-cardHover/30 h-10 w-full border-b border-crm-border/30" />
            <div className="divide-y divide-crm-border/30">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="h-14 w-full flex items-center justify-between px-6">
                  <div className="h-4.5 w-32 bg-crm-cardHover/60 rounded" />
                  <div className="h-4 w-28 bg-crm-cardHover/40 rounded" />
                  <div className="h-4 w-16 bg-crm-cardHover/40 rounded" />
                  <div className="h-4 w-12 bg-crm-cardHover/40 rounded" />
                  <div className="h-4 w-20 bg-crm-cardHover/50 rounded" />
                  <div className="h-6 w-6 bg-crm-cardHover/30 rounded" />
                </div>
              ))}
            </div>
          </div>
        )
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = leadsByStage[stage] || [];
              return (
                <KanbanColumn
                  key={stage}
                  id={stage}
                  title={stage}
                  count={stageLeads.length}
                  totalValue={getStageTotalValue(stageLeads)}
                >
                  {stageLeads.length === 0 ? (
                    <div className="text-[11px] text-crm-muted border border-dashed border-crm-border/30 rounded-lg p-6 text-center">
                      No deals here
                    </div>
                  ) : (
                    stageLeads.map((lead) => (
                      <KanbanCard
                        key={lead.id}
                        lead={lead}
                        onEdit={handleOpenEdit}
                        onDelete={handleOpenDelete}
                        role={role}
                      />
                    ))
                  )}
                </KanbanColumn>
              );
            })}
          </div>
        </DndContext>
      ) : (
        /* LIST VIEW TABLE ALTERNATIVE */
        <div className="glass-panel overflow-visible rounded-xl">
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="border-b border-crm-border bg-crm-cardHover/30 text-xs font-semibold uppercase tracking-wider text-crm-muted">
                <tr>
                  <th className="px-6 py-4">Deal Title</th>
                  <th className="px-6 py-4">Account Client</th>
                  <th className="px-6 py-4">Financial Value</th>
                  <th className="px-6 py-4">Funnel Stage</th>
                  <th className="px-6 py-4">Probability</th>
                  <th className="px-6 py-4">Close Target</th>
                  <th className="px-6 py-4 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-border/50">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-crm-muted">
                      No deals matches search queries.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead.id} className="group hover:bg-crm-cardHover/15 transition-colors">
                      <td className="px-6 py-4 font-semibold text-white">
                        {lead.title}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-crm-muted font-medium group-hover:text-slate-200 transition-colors">
                          {lead.customer?.name}
                        </div>
                        <div className="text-[10px] text-crm-muted flex items-center gap-1">
                          <Building className="h-3 w-3 text-indigo-400" />
                          {lead.customer?.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-indigo-400">
                        ${lead.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          lead.stage === "Closed" 
                            ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" 
                            : lead.stage === "Proposal"
                            ? "bg-indigo-500/10 text-indigo-400 ring-indigo-500/30"
                            : "bg-indigo-500/5 text-crm-muted ring-crm-border/40"
                        }`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
                          <span className="font-semibold text-white">{lead.probability}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs text-crm-muted">
                          <Calendar className="h-3.5 w-3.5" />
                          {lead.expected_close_date}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right overflow-visible">
                        {role !== "viewer" && (
                          <div className="relative inline-block text-left">
                            <button 
                              onClick={() => setActionDropdownOpen(actionDropdownOpen === lead.id ? null : lead.id)}
                              className="rounded-lg p-1 text-crm-muted hover:bg-crm-cardHover hover:text-white transition-colors"
                            >
                              <MoreVertical className="h-4.5 w-4.5" />
                            </button>
                            
                            {actionDropdownOpen === lead.id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setActionDropdownOpen(null)} />
                                <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-lg bg-crm-card border border-crm-border shadow-lg z-40">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleOpenEdit(lead)}
                                      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:bg-crm-cardHover hover:text-white transition-all"
                                    >
                                      <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                                      Edit deal
                                    </button>
                                    
                                    {role === "admin" && (
                                      <button
                                        onClick={() => handleOpenDelete(lead)}
                                        className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                        Delete deal
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Lead Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddEditOpen(false)} />
          
          <div className="glass-panel w-full max-w-lg rounded-xl border border-crm-border p-6 shadow-xl relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-crm-border/50 pb-3">
              <h2 className="text-lg font-bold text-white">
                {editingLead ? "Edit Sales Deal" : "Create Deal Opportunity"}
              </h2>
              <button 
                onClick={() => setIsAddEditOpen(false)}
                className="text-crm-muted hover:text-white p-1 rounded-lg hover:bg-crm-cardHover transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-crm-muted">Opportunity Deal Title *</label>
                  <input
                    type="text"
                    {...register("title")}
                    placeholder="e.g. Enterprise Cloud Integration"
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  />
                  {errors.title && <p className="text-[11px] text-rose-400 mt-0.5">{errors.title.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Linked Customer Profile *</label>
                  <div className="relative">
                    <select
                      {...register("customer_id")}
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
                  <label className="text-xs font-semibold text-crm-muted">Financial Deal Value ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("value", { valueAsNumber: true })}
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  />
                  {errors.value && <p className="text-[11px] text-rose-400 mt-0.5">{errors.value.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Pipeline Stage</label>
                  <select
                    {...register("stage")}
                    onChange={(e) => {
                      // Autoscale probabilities based on selected stage
                      const val = e.target.value;
                      const prob = val === "New" ? 10 : val === "Contacted" ? 30 : val === "Qualified" ? 50 : val === "Proposal" ? 80 : 100;
                      setValue("probability", prob);
                    }}
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Expected Close Date *</label>
                  <input
                    type="date"
                    {...register("expected_close_date")}
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  />
                  {errors.expected_close_date && <p className="text-[11px] text-rose-400 mt-0.5">{errors.expected_close_date.message}</p>}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-crm-muted">Closing Probability (%)</label>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    {...register("probability", { valueAsNumber: true })}
                    className="w-full h-1.5 bg-crm-border/60 rounded-lg appearance-none cursor-pointer accent-crm-primary mt-2"
                  />
                  {errors.probability && <p className="text-[11px] text-rose-400 mt-0.5">{errors.probability.message}</p>}
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-crm-muted">Notes & Next Actions</label>
                  <textarea
                    rows={3}
                    {...register("notes")}
                    placeholder="Enter discussion logs, deliverables deadlines, or owner metrics..."
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-crm-border/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="rounded-lg border border-crm-border bg-transparent px-4 py-2 text-xs font-semibold text-crm-muted hover:text-white hover:bg-crm-cardHover transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-crm-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-crm-primary/25 hover:bg-indigo-500 transition-all"
                >
                  {editingLead ? "Save Changes" : "Create Deal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
          
          <div className="glass-panel w-full max-w-sm rounded-xl border border-crm-border p-6 shadow-xl relative z-10 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Delete Deal Opportunity</h2>
              <p className="text-xs text-crm-muted">
                Are you sure you want to delete <span className="font-semibold text-white">{selectedLead?.title}</span>? This action will remove this lead from the pipeline.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-crm-border bg-transparent px-4 py-2 text-xs font-semibold text-crm-muted hover:text-white hover:bg-crm-cardHover transition-all"
              >
                Keep Deal
              </button>
              <button
                type="button"
                onClick={onDeleteConfirm}
                className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all"
              >
                Delete Deal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Kanban Droppable Column */
interface ColumnProps {
  id: string;
  title: string;
  count: number;
  totalValue: number;
  children: React.ReactNode;
}

function KanbanColumn({ id, title, count, totalValue, children }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef}
      className={`rounded-xl p-3.5 flex flex-col min-h-[500px] lg:h-[65vh] border transition-all ${
        isOver ? 'border-crm-primary/70 bg-crm-card/35 shadow-inner' : 'border-crm-border/30 bg-crm-card/10'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-white uppercase tracking-wider">{title}</span>
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-crm-cardHover text-[10px] font-extrabold text-crm-text">
            {count}
          </span>
        </div>
        <span className="text-[11px] font-bold text-indigo-400">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
        {children}
      </div>
    </div>
  );
}

/* Kanban Draggable Card */
interface CardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  role: UserRole;
}

function KanbanCard({ lead, onEdit, onDelete, role }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const dragProps = role !== "viewer" ? { ...attributes, ...listeners } : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragProps}
      className={`glass-panel border p-3 rounded-lg flex flex-col justify-between h-36 relative select-none ${
        isDragging 
          ? 'opacity-40 border-crm-primary/50 shadow-2xl scale-95 cursor-grabbing z-40' 
          : `border-crm-border/40 hover:border-crm-border/80 shadow-sm ${
              role !== "viewer" ? "cursor-grab active:cursor-grabbing hover:bg-crm-cardHover/10" : ""
            } transition-colors duration-150`
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="font-semibold text-xs text-white leading-tight line-clamp-2 pr-3">{lead.title}</h3>
          
          <div className="absolute right-2 top-2 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
            {/* Overlay indicators can be replaced by normal cards actions. */}
          </div>
        </div>
        <div className="text-[10px] text-crm-muted font-medium flex flex-col gap-1 leading-tight">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-slate-200 truncate">{lead.customer?.name || "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-1 text-[9px]">
            <Building className="h-2.5 w-2.5 text-indigo-400 shrink-0" />
            <span className="truncate">{lead.customer?.company || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo-400">
            ${lead.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
          <div className="flex items-center gap-1 text-[10px] text-crm-muted">
            <Clock className="h-3 w-3" />
            <span className="font-semibold text-white">{lead.probability}%</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-crm-border/30 pt-1.5 text-[10px] text-crm-muted">
          <span className="truncate">{lead.expected_close_date}</span>
          
          <div className="flex gap-1.5 z-20">
            {role !== "viewer" && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop dnd drag events
                  onEdit(lead);
                }}
                className="text-crm-muted hover:text-indigo-400 p-0.5 rounded transition-colors"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            )}
            {role === "admin" && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Stop dnd drag events
                  onDelete(lead);
                }}
                className="text-crm-muted hover:text-rose-400 p-0.5 rounded transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
