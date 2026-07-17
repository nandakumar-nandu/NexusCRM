import { 
  Search, 
  Filter, 
  MoreVertical, 
  Plus, 
  Mail, 
  Building,
  Phone
} from "lucide-react";

export default function CustomersPage() {
  const customers = [
    { name: "Sarah Jenkins", company: "Acme Corp", email: "sarah.j@acme.com", phone: "+1 (555) 123-4567", status: "Active", date: "Jan 12, 2026" },
    { name: "David Miller", company: "Starlight Media", email: "david@starlight.io", phone: "+1 (555) 987-6543", status: "Active", date: "Feb 18, 2026" },
    { name: "Elena Rostova", company: "Nexus Labs", email: "elena@nexuslabs.co", phone: "+1 (555) 456-7890", status: "Inactive", date: "Mar 3, 2026" },
    { name: "Marcus Chen", company: "Velocity Group", email: "marcus.c@velocity.com", phone: "+1 (555) 234-5678", status: "Active", date: "Apr 22, 2026" },
    { name: "Jessica Taylor", company: "Clarity Design", email: "jessica@clarity.design", phone: "+1 (555) 876-5432", status: "Active", date: "May 15, 2026" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Customers</h1>
          <p className="mt-1 text-sm text-crm-muted">
            Manage your accounts, contact information, and relationships.
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-0.5">
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
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
            placeholder="Search customers..."
            className="w-full rounded-lg border border-crm-border bg-crm-card/50 py-1.5 pl-10 pr-4 text-sm text-white placeholder-crm-muted outline-none transition-all focus:border-crm-primary focus:bg-crm-card"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-crm-border bg-crm-card/50 px-3 py-1.5 text-xs font-semibold text-crm-muted transition-colors hover:bg-crm-cardHover hover:text-white">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </button>
          <span className="text-xs text-crm-muted">Showing 5 of 1,248 customers</span>
        </div>
      </div>

      {/* Table Panel */}
      <div className="glass-panel overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-crm-border bg-crm-cardHover/30 text-xs font-semibold uppercase tracking-wider text-crm-muted">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date Added</th>
                <th className="px-6 py-4 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-border/50">
              {customers.map((customer, i) => (
                <tr key={i} className="group transition-colors duration-150 hover:bg-crm-cardHover/25">
                  <td className="px-6 py-4 font-semibold text-white">
                    {customer.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-crm-muted group-hover:text-slate-200 transition-colors">
                      <Building className="h-3.5 w-3.5 text-indigo-400" />
                      {customer.company}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <span className="flex items-center gap-1.5 text-xs text-crm-muted">
                      <Mail className="h-3.5 w-3.5 text-crm-muted" />
                      {customer.email}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-crm-muted">
                      <Phone className="h-3.5 w-3.5 text-crm-muted" />
                      {customer.phone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ring-1 ring-inset ${
                      customer.status === "Active" 
                        ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" 
                        : "bg-gray-500/10 text-gray-400 ring-gray-500/30"
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-crm-muted">
                    {customer.date}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-1 text-crm-muted hover:bg-crm-cardHover hover:text-white transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
