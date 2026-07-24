"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileSpreadsheet, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Download, 
  Save, 
  Filter, 
  Database, 
  Columns, 
  Plus, 
  Trash2,
  Play
} from "lucide-react";
import { reportBuilderService, type ReportConfig, type ReportFilter } from "@/lib/services/reportBuilderService";

/**
 * Custom Report Builder Wizard (/reports/builder)
 * 
 * Technical & Security Notes:
 * 1. Safe Dynamic Query Construction:
 *    - All selected data sources are validated against an explicit whitelist (`customers`, `leads`, `tasks`, `activity_log`).
 *    - Query columns and filter inputs are passed through parameterized Supabase Query Builder methods (`eq`, `ilike`, `gt`, `lt`), 
 *      preventing raw string concatenation and SQL injection vulnerability vectors.
 */

const SOURCE_COLUMNS: Record<string, { label: string; field: string }[]> = {
  customers: [
    { label: "Customer Name", field: "name" },
    { label: "Company", field: "company" },
    { label: "Email", field: "email" },
    { label: "Status", field: "status" },
    { label: "Created At", field: "created_at" },
  ],
  leads: [
    { label: "Deal Title", field: "title" },
    { label: "Valuation ($)", field: "value" },
    { label: "Pipeline Stage", field: "stage" },
    { label: "Probability (%)", field: "probability" },
    { label: "Created At", field: "created_at" },
  ],
  tasks: [
    { label: "Task Title", field: "title" },
    { label: "Due Date", field: "due_date" },
    { label: "Priority", field: "priority" },
    { label: "Completed Status", field: "completed" },
    { label: "Created At", field: "created_at" },
  ],
  activity_log: [
    { label: "Entity Category", field: "entity_type" },
    { label: "Entity ID", field: "entity_id" },
    { label: "Executed Action", field: "action" },
    { label: "Timestamp", field: "occurred_at" },
  ],
};

export default function ReportBuilderPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [source, setSource] = useState<ReportConfig["source"]>("leads");
  const [selectedColumns, setSelectedColumns] = useState<string[]>(["title", "value", "stage"]);
  const [filters, setFilters] = useState<ReportFilter[]>([
    { field: "value", operator: "greater_than", value: "10000" },
  ]);
  const [reportName, setReportName] = useState("Custom Pipeline Report");

  // Output Execution State
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<Record<string, unknown>[] | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const availableFields = SOURCE_COLUMNS[source] || [];

  const handleSourceChange = (newSource: ReportConfig["source"]) => {
    setSource(newSource);
    const defaults = SOURCE_COLUMNS[newSource].map((c) => c.field).slice(0, 3);
    setSelectedColumns(defaults);
    setFilters([]);
  };

  const handleToggleColumn = (field: string) => {
    if (selectedColumns.includes(field)) {
      if (selectedColumns.length > 1) {
        setSelectedColumns(selectedColumns.filter((c) => c !== field));
      }
    } else {
      setSelectedColumns([...selectedColumns, field]);
    }
  };

  const handleAddFilter = () => {
    if (availableFields.length > 0) {
      setFilters([
        ...filters,
        { field: availableFields[0].field, operator: "equals", value: "" },
      ]);
    }
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleFilterChange = (index: number, key: keyof ReportFilter, val: string) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], [key]: val };
    setFilters(updated);
  };

  const handleExecute = async () => {
    setExecuting(true);
    try {
      const data = await reportBuilderService.executeReport({
        source,
        columns: selectedColumns,
        filters,
      });
      setResults(data);
    } catch (err) {
      console.error("Report execution error:", err);
    } finally {
      setExecuting(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!results || results.length === 0) return;
    const csv = reportBuilderService.exportReportToCsv(results);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${reportName.toLowerCase().replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveReport = async () => {
    try {
      await reportBuilderService.saveReportTemplate(reportName, {
        source,
        columns: selectedColumns,
        filters,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save report:", err);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-fade-in pb-12">
      {/* Top Navigation & Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/reports"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-crm-border bg-crm-card/50 text-crm-muted hover:text-white hover:bg-crm-card transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Custom Report Builder</h1>
            <p className="text-xs text-crm-muted">Generate tailored database exports in 4 simple steps.</p>
          </div>
        </div>
      </div>

      {/* Stepper Header Bar */}
      <div className="grid grid-cols-4 gap-2 border-b border-crm-border/60 pb-4">
        {[
          { num: 1, title: "1. Choose Source", icon: Database },
          { num: 2, title: "2. Select Columns", icon: Columns },
          { num: 3, title: "3. Apply Filters", icon: Filter },
          { num: 4, title: "4. Output & Export", icon: FileSpreadsheet },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <button
              key={s.num}
              onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
              className={`flex items-center gap-2 rounded-xl p-3 text-left transition-all ${
                isActive
                  ? "bg-crm-primary text-white shadow-lg shadow-crm-primary/20"
                  : isDone
                  ? "bg-crm-cardHover/40 text-emerald-400"
                  : "bg-crm-card/30 text-crm-muted hover:text-white"
              }`}
            >
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isActive ? "bg-white/20" : "bg-crm-cardHover"}`}>
                {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className="text-xs font-bold truncate">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="glass-panel min-h-[380px] rounded-xl border border-crm-border/60 p-6 space-y-6">
        {/* STEP 1: Choose Data Source */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-crm-primary" />
              <span>Step 1: Select Target Database Resource</span>
            </h2>
            <p className="text-xs text-crm-muted">Choose the underlying dataset table to query.</p>

            <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
              {[
                { id: "leads", label: "Sales Pipeline (Leads)", desc: "Deals, stages, and financial valuations" },
                { id: "customers", label: "Customers Index", desc: "Corporate profiles and status tiers" },
                { id: "tasks", label: "Tasks Checklist", desc: "Follow-ups, due dates, and priorities" },
                { id: "activity_log", label: "Activity Audit Logs", desc: "System audit events and record diffs" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSourceChange(item.id as ReportConfig["source"])}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                    source === item.id
                      ? "border-crm-primary bg-crm-primary/10 ring-1 ring-crm-primary"
                      : "border-crm-border/60 bg-crm-card/30 hover:bg-crm-cardHover/30"
                  }`}
                >
                  <span className="font-bold text-sm text-white">{item.label}</span>
                  <span className="text-[11px] text-crm-muted mt-1 leading-relaxed">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select + Order Columns */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Columns className="h-5 w-5 text-crm-primary" />
              <span>Step 2: Choose Data Fields & Columns</span>
            </h2>
            <p className="text-xs text-crm-muted">Select fields to include in your output export table.</p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {availableFields.map((col) => {
                const isSelected = selectedColumns.includes(col.field);
                return (
                  <button
                    key={col.field}
                    onClick={() => handleToggleColumn(col.field)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? "border-crm-primary bg-crm-primary/15 text-white"
                        : "border-crm-border/50 bg-crm-card/30 text-crm-muted hover:text-white"
                    }`}
                  >
                    <span>{col.label}</span>
                    {isSelected && <Check className="h-4 w-4 text-crm-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: Apply Filters */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Filter className="h-5 w-5 text-crm-primary" />
                  <span>Step 3: Define Filter Criteria</span>
                </h2>
                <p className="text-xs text-crm-muted">Filter target records based on custom rules.</p>
              </div>
              <button
                onClick={handleAddFilter}
                className="flex items-center gap-1.5 rounded-lg border border-crm-border bg-crm-cardHover px-3 py-1.5 text-xs font-semibold text-white hover:bg-crm-card transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Filter Rule</span>
              </button>
            </div>

            {filters.length === 0 ? (
              <div className="p-8 text-center text-xs text-crm-muted border border-dashed border-crm-border/50 rounded-xl">
                No active filter rules. Click &quot;Add Filter Rule&quot; to refine query records.
              </div>
            ) : (
              <div className="space-y-3">
                {filters.map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-crm-card/40 border border-crm-border/40">
                    <select
                      value={rule.field}
                      onChange={(e) => handleFilterChange(idx, "field", e.target.value)}
                      className="rounded-lg border border-crm-border bg-crm-card px-3 py-1.5 text-xs text-white outline-none"
                    >
                      {availableFields.map((f) => (
                        <option key={f.field} value={f.field}>
                          {f.label}
                        </option>
                      ))}
                    </select>

                    <select
                      value={rule.operator}
                      onChange={(e) => handleFilterChange(idx, "operator", e.target.value as ReportFilter["operator"])}
                      className="rounded-lg border border-crm-border bg-crm-card px-3 py-1.5 text-xs text-white outline-none"
                    >
                      <option value="equals">Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater than (&gt;)</option>
                      <option value="less_than">Less than (&lt;)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Target value..."
                      value={rule.value}
                      onChange={(e) => handleFilterChange(idx, "value", e.target.value)}
                      className="flex-1 rounded-lg border border-crm-border bg-crm-card px-3 py-1.5 text-xs text-white outline-none"
                    />

                    <button
                      onClick={() => handleRemoveFilter(idx)}
                      className="p-1.5 text-crm-muted hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Output & Actions */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-crm-primary" />
                  <span>Step 4: Execute & Export Report</span>
                </h2>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  className="rounded-lg border border-crm-border bg-crm-card px-3 py-1 text-xs text-white outline-none focus:border-crm-primary"
                  placeholder="Report Template Name"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExecute}
                  disabled={executing}
                  className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-md shadow-crm-primary/20 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>{executing ? "Executing..." : "Run Report"}</span>
                </button>

                {results && results.length > 0 && (
                  <button
                    onClick={handleDownloadCsv}
                    className="flex items-center gap-2 rounded-lg border border-crm-border bg-crm-cardHover px-4 py-2 text-xs font-semibold text-white hover:bg-crm-card transition-all"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Download CSV</span>
                  </button>
                )}

                <button
                  onClick={handleSaveReport}
                  className="flex items-center gap-2 rounded-lg border border-crm-border bg-crm-cardHover px-4 py-2 text-xs font-semibold text-white hover:bg-crm-card transition-all"
                >
                  <Save className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{saveSuccess ? "Template Saved!" : "Save Template"}</span>
                </button>
              </div>
            </div>

            {/* Results Grid Preview */}
            {results && (
              <div className="space-y-2 border-t border-crm-border/40 pt-4">
                <div className="flex items-center justify-between text-xs text-crm-muted">
                  <span>Results Preview ({results.length} records matching criteria)</span>
                </div>
                <div className="max-h-64 overflow-auto rounded-xl border border-crm-border/60 bg-crm-card/30">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-crm-border/60 bg-crm-cardHover/40 text-crm-muted uppercase tracking-wider">
                      <tr>
                        {selectedColumns.map((col) => (
                          <th key={col} className="p-3 font-semibold">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-crm-border/30 text-white">
                      {results.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-crm-cardHover/20">
                          {selectedColumns.map((col) => (
                            <td key={col} className="p-3 truncate max-w-xs">{String(row[col] ?? "—")}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stepper Navigation Buttons */}
      <div className="flex items-center justify-between border-t border-crm-border/40 pt-4">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3 | 4)}
          disabled={step === 1}
          className="flex items-center gap-1.5 rounded-lg border border-crm-border bg-crm-card/50 px-4 py-2 text-xs font-semibold text-white hover:bg-crm-card transition-all disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Previous Step</span>
        </button>

        <button
          onClick={() => setStep((s) => Math.min(4, s + 1) as 1 | 2 | 3 | 4)}
          disabled={step === 4}
          className="flex items-center gap-1.5 rounded-lg bg-crm-primary px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-md shadow-crm-primary/20 disabled:opacity-40"
        >
          <span>Next Step</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
