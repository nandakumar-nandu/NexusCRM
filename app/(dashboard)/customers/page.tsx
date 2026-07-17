"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  customersService, 
  type Customer 
} from "@/lib/services/customersService";
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  Mail, 
  Building,
  Phone,
  Edit2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Download
} from "lucide-react";
import { roleService, type UserRole } from "@/lib/services/roleService";
import Papa from "papaparse";

// Form Validation Schema using Zod
const customerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").or(z.string().length(0)),
  phone: z.string().optional(),
  company: z.string().min(2, "Company must be at least 2 characters"),
  status: z.enum(["Active", "Inactive", "Lead"]),
  tagsString: z.string().optional(),
  notes: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

export default function CustomersPage() {
  // Query States
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [loading, setLoading] = useState(true);

  // Modal / Drawer Toggles
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [actionDropdownOpen, setActionDropdownOpen] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customersService.getCustomers(page, search, status);
      setCustomers(res.data);
      setCount(res.count);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  // Load list on change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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
  // 1. Gathers currently loaded customers from page search result queries.
  // 2. Maps custom columns names to the output headers.
  // 3. Runs Papa.unparse() to serialize the records to a raw CSV format.
  // 4. Instantly downloads the CSV file inside user's client browser session.
  const handleExportCSV = () => {
    const csvData = customers.map(c => ({
      Name: c.name,
      Company: c.company,
      Email: c.email || "",
      Phone: c.phone || "",
      Status: c.status,
      Tags: (c.tags || []).join(", "),
      Notes: c.notes || ""
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nexus-customers-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Forms Hook initialization
  const { register: registerAdd, handleSubmit: handleSubmitAdd, reset: resetAdd, formState: { errors: errorsAdd } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: { status: "Lead", tagsString: "", notes: "", phone: "", email: "" }
  });

  const { register: registerEdit, handleSubmit: handleSubmitEdit, reset: resetEdit, formState: { errors: errorsEdit } } = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
  });

  // Handle Create Customer
  const onAddSubmit = async (data: CustomerFormData) => {
    try {
      const tags = data.tagsString ? data.tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
      const newCustomer = {
        name: data.name,
        company: data.company,
        email: data.email || "",
        phone: data.phone || "",
        status: data.status,
        tags,
        notes: data.notes || ""
      };
      await customersService.createCustomer(newCustomer);
      setIsAddOpen(false);
      resetAdd();
      fetchCustomers();
    } catch (err) {
      console.error("Failed to create customer:", err);
    }
  };

  // Open Edit Panel
  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    resetEdit({
      name: customer.name,
      company: customer.company,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      tagsString: customer.tags ? customer.tags.join(', ') : "",
      notes: customer.notes
    });
    setIsEditOpen(true);
    setActionDropdownOpen(null);
  };

  // Handle Edit Customer
  const onEditSubmit = async (data: CustomerFormData) => {
    if (!selectedCustomer) return;
    try {
      const tags = data.tagsString ? data.tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];
      const updatedData = {
        name: data.name,
        company: data.company,
        email: data.email || "",
        phone: data.phone || "",
        status: data.status,
        tags,
        notes: data.notes || ""
      };
      await customersService.updateCustomer(selectedCustomer.id, updatedData);
      setIsEditOpen(false);
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error("Failed to update customer:", err);
    }
  };

  // Open Delete Alert
  const handleOpenDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteOpen(true);
    setActionDropdownOpen(null);
  };

  // Handle Delete customer
  const onDeleteConfirm = async () => {
    if (!selectedCustomer) return;
    try {
      await customersService.deleteCustomer(selectedCustomer.id);
      setIsDeleteOpen(false);
      setSelectedCustomer(null);
      // If deleted the last item on the page, go back
      if (customers.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchCustomers();
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  // Calculations for pagination display
  const limit = 10;
  const totalPages = Math.ceil(count / limit) || 1;
  const startRow = count === 0 ? 0 : (page - 1) * limit + 1;
  const endRow = Math.min(page * limit, count);

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Customers</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Manage your accounts, contact information, and relationships.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-lg border border-crm-border bg-crm-cardHover px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-crm-card hover:-translate-y-0.5"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Export CSV</span>
          </button>
          
          {role !== "viewer" && (
            <button 
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all duration-200 hover:bg-indigo-500 hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-80">
          <span className="absolute inset-y-0 left-3 flex items-center">
            <Search className="h-4 w-4 text-crm-muted" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email or company..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-1.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none transition-all focus:border-crm-primary focus:bg-crm-card"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-crm-muted" />
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="rounded-lg border border-crm-border bg-crm-cardHover px-3 py-1.5 text-xs font-semibold text-crm-text outline-none focus:border-crm-primary transition-colors"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
          <span className="text-xs text-crm-muted">Showing {startRow}-{endRow} of {count} customers</span>
        </div>
      </div>

      {/* Table Panel */}
      <div className="glass-panel overflow-visible rounded-xl">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-crm-border bg-crm-cardHover/30 text-xs font-semibold uppercase tracking-wider text-crm-muted">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Tags</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-crm-muted">
                    Loading customers data...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-crm-muted">
                    No customers found matching the search criteria.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="group transition-colors duration-150 hover:bg-crm-cardHover/15">
                    <td className="px-6 py-4 font-semibold text-white">
                      <Link href={`/customers/${customer.id}`} className="hover:text-crm-primary hover:underline transition-colors">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-crm-muted group-hover:text-slate-200 transition-colors">
                        <Building className="h-3.5 w-3.5 text-indigo-400" />
                        {customer.company}
                      </span>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      {customer.email && (
                        <span className="flex items-center gap-1.5 text-xs text-crm-muted">
                          <Mail className="h-3.5 w-3.5 text-crm-muted" />
                          {customer.email}
                        </span>
                      )}
                      {customer.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-crm-muted">
                          <Phone className="h-3.5 w-3.5 text-crm-muted" />
                          {customer.phone}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                        customer.status === "Active" 
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" 
                          : customer.status === "Inactive"
                          ? "bg-gray-500/10 text-gray-400 ring-gray-500/30"
                          : "bg-sky-500/10 text-sky-400 ring-sky-500/30"
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {customer.tags && customer.tags.length > 0 ? (
                          customer.tags.map((tag, idx) => (
                            <span key={idx} className="inline-flex items-center gap-0.5 rounded bg-crm-cardHover/60 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-crm-muted">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right overflow-visible">
                      <div className="relative inline-block text-left">
                        {role !== "viewer" && (
                          <div className="relative">
                            <button 
                              onClick={() => setActionDropdownOpen(actionDropdownOpen === customer.id ? null : customer.id)}
                              className="rounded-lg p-1 text-crm-muted hover:bg-crm-cardHover hover:text-white transition-colors"
                            >
                              <MoreVertical className="h-4.5 w-4.5" />
                            </button>
                            
                            {actionDropdownOpen === customer.id && (
                              <>
                                <div className="fixed inset-0 z-30" onClick={() => setActionDropdownOpen(null)} />
                                <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-lg bg-crm-card border border-crm-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                                  <div className="py-1">
                                    <button
                                      onClick={() => handleOpenEdit(customer)}
                                      className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-slate-300 hover:bg-crm-cardHover hover:text-white transition-colors"
                                    >
                                      <Edit2 className="h-3.5 w-3.5 text-indigo-400" />
                                      Edit details
                                    </button>
                                    
                                    {role === "admin" && (
                                      <button
                                        onClick={() => handleOpenDelete(customer)}
                                        className="flex w-full items-center gap-2 px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
                                      >
                                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                        Delete client
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="flex items-center justify-between border-t border-crm-border/60 px-6 py-4 bg-crm-cardHover/10 rounded-b-xl">
          <div className="text-xs text-crm-muted">
            Page <span className="font-semibold text-white">{page}</span> of <span className="font-semibold text-white">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(page > 1 ? page - 1 : 1)}
              disabled={page === 1}
              className="flex items-center justify-center p-1.5 rounded-lg border border-crm-border bg-crm-card/50 text-crm-muted hover:text-white hover:bg-crm-cardHover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
              disabled={page === totalPages}
              className="flex items-center justify-center p-1.5 rounded-lg border border-crm-border bg-crm-card/50 text-crm-muted hover:text-white hover:bg-crm-cardHover disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          
          {/* Modal Card */}
          <div className="glass-panel w-full max-w-lg rounded-xl border border-crm-border p-6 shadow-xl relative z-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-crm-border/50 pb-3">
              <h2 className="text-lg font-bold text-white">Add Customer</h2>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="text-crm-muted hover:text-white p-1 rounded-lg hover:bg-crm-cardHover transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd(onAddSubmit)} className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Contact Name *</label>
                  <input
                    type="text"
                    {...registerAdd("name")}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card"
                  />
                  {errorsAdd.name && <p className="text-[11px] text-rose-400 mt-0.5">{errorsAdd.name.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Company Name *</label>
                  <input
                    type="text"
                    {...registerAdd("company")}
                    placeholder="e.g. Acme Corp"
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card"
                  />
                  {errorsAdd.company && <p className="text-[11px] text-rose-400 mt-0.5">{errorsAdd.company.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Email Address</label>
                  <input
                    type="text"
                    {...registerAdd("email")}
                    placeholder="sarah.j@acme.com"
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card"
                  />
                  {errorsAdd.email && <p className="text-[11px] text-rose-400 mt-0.5">{errorsAdd.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Telephone Number</label>
                  <input
                    type="text"
                    {...registerAdd("phone")}
                    placeholder="+1 (555) 123-4567"
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Pipeline Status</label>
                  <select
                    {...registerAdd("status")}
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-crm-muted">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    {...registerAdd("tagsString")}
                    placeholder="Enterprise, Tech, VIP"
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-semibold text-crm-muted">Interaction Notes</label>
                  <textarea
                    rows={3}
                    {...registerAdd("notes")}
                    placeholder="Enter discussion context or customer summary notes..."
                    className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary focus:bg-crm-card resize-none"
                  />
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
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Customer Slide-over panel */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop blur overlay */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300" onClick={() => setIsEditOpen(false)} />
          
          {/* Side Panel Container */}
          <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
            <div className="w-screen max-w-md glass-panel border-l border-crm-border p-6 flex flex-col justify-between shadow-2xl animate-slide-in">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-crm-border/50 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-white">Edit Customer</h2>
                    <p className="text-xs text-crm-muted mt-0.5">Modify enterprise account parameters.</p>
                  </div>
                  <button 
                    onClick={() => setIsEditOpen(false)}
                    className="text-crm-muted hover:text-white p-1 rounded-lg hover:bg-crm-cardHover transition-all"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>

                <form id="edit-form" onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-crm-muted">Contact Name *</label>
                    <input
                      type="text"
                      {...registerEdit("name")}
                      className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    />
                    {errorsEdit.name && <p className="text-[11px] text-rose-400 mt-0.5">{errorsEdit.name.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-crm-muted">Company Name *</label>
                    <input
                      type="text"
                      {...registerEdit("company")}
                      className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    />
                    {errorsEdit.company && <p className="text-[11px] text-rose-400 mt-0.5">{errorsEdit.company.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-crm-muted">Email Address</label>
                    <input
                      type="text"
                      {...registerEdit("email")}
                      className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    />
                    {errorsEdit.email && <p className="text-[11px] text-rose-400 mt-0.5">{errorsEdit.email.message}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-crm-muted">Telephone Number</label>
                    <input
                      type="text"
                      {...registerEdit("phone")}
                      className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-crm-muted">Pipeline Status</label>
                    <select
                      {...registerEdit("status")}
                      className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-crm-muted">Tags (Comma-separated)</label>
                    <input
                      type="text"
                      {...registerEdit("tagsString")}
                      className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-crm-muted">Interaction Notes</label>
                    <textarea
                      rows={4}
                      {...registerEdit("notes")}
                      className="w-full rounded-lg border border-crm-border bg-crm-card/50 px-3.5 py-2 text-sm text-white outline-none focus:border-crm-primary resize-none"
                    />
                  </div>
                </form>
              </div>

              <div className="flex justify-end gap-2 border-t border-crm-border/40 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg border border-crm-border bg-transparent px-4 py-2 text-xs font-semibold text-crm-muted hover:text-white hover:bg-crm-cardHover transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="edit-form"
                  className="rounded-lg bg-crm-primary px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-crm-primary/25 hover:bg-indigo-500 transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsDeleteOpen(false)} />
          
          <div className="glass-panel w-full max-w-sm rounded-xl border border-crm-border p-6 shadow-xl relative z-10 text-center space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-white">Delete Customer Account</h2>
              <p className="text-xs text-crm-muted">
                Are you sure you want to delete <span className="font-semibold text-white">{selectedCustomer?.name}</span>? This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-lg border border-crm-border bg-transparent px-4 py-2 text-xs font-semibold text-crm-muted hover:text-white hover:bg-crm-cardHover transition-all"
              >
                Keep Account
              </button>
              <button
                type="button"
                onClick={onDeleteConfirm}
                className="rounded-lg bg-rose-500 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 transition-all"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
