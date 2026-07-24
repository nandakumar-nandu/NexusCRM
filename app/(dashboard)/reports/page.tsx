"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  Calendar,
  Plus,
  FileSpreadsheet,
  Play,
  Edit
} from "lucide-react";
import { reportBuilderService, type SavedReport } from "@/lib/services/reportBuilderService";

export default function ReportsPage() {
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const data = await reportBuilderService.getSavedReports();
        setSavedReports(data);
      } catch (err) {
        console.error("Failed to load saved reports:", err);
      } finally {
        setLoadingReports(false);
      }
    }
    loadReports();
  }, []);

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
          <Link
            href="/reports/builder"
            className="flex items-center gap-1.5 rounded-lg bg-crm-primary px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 shadow-md shadow-crm-primary/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Custom Report</span>
          </Link>
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
            <h2 className="text-sm font-bold uppercase tracking-wider text-crm-muted">Monthly Revenue Trends</h2>
            <span className="flex items-center text-xs font-semibold text-crm-accent bg-emerald-500/10 px-2 py-0.5 rounded">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              +14% MoM
            </span>
          </div>

          {/* Styled Bar Graph Chart */}
          <div className="flex h-56 items-end justify-between gap-4 pt-4 border-b border-crm-border/50">
            {chartData.map((data, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2 group cursor-pointer">
                <span className="text-[10px] font-bold text-crm-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {data.revenue}
                </span>
                
                <div className="relative w-full rounded-t-md bg-crm-cardHover group-hover:bg-crm-primary/20 transition-all duration-300 overflow-hidden" style={{ height: "140px" }}>
                  <div 
                    className="absolute bottom-0 left-0 right-0 rounded-t-md bg-gradient-to-t from-crm-primary to-indigo-400 group-hover:from-indigo-400 group-hover:to-sky-400 transition-all duration-300"
                    style={{ height: data.percentage }}
                  />
                </div>
                
                <span className="text-xs text-crm-muted font-medium mt-1">{data.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product categories split */}
        <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-crm-muted">Revenue by Category</h2>
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

      {/* My Saved Reports Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">My Saved Reports</h2>
            <p className="text-xs text-crm-muted">Custom report templates configured via the Report Builder wizard.</p>
          </div>
          <Link
            href="/reports/builder"
            className="text-xs font-semibold text-crm-primary hover:text-indigo-400 transition-colors"
          >
            + Build New Template
          </Link>
        </div>

        <div className="glass-panel rounded-xl border border-crm-border/60 overflow-hidden">
          {loadingReports ? (
            <div className="p-8 text-center text-xs text-crm-muted animate-pulse">Loading saved report templates...</div>
          ) : savedReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-crm-muted space-y-2">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-crm-muted/50" />
              <p className="font-semibold text-white">No saved reports yet</p>
              <p>Build custom reports in 4 steps using the Report Builder wizard.</p>
            </div>
          ) : (
            <div className="divide-y divide-crm-border/40">
              {savedReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 hover:bg-crm-cardHover/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-crm-cardHover p-2 text-indigo-400 border border-crm-border/30">
                      <FileSpreadsheet className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{report.name}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-crm-muted mt-0.5">
                        <span className="uppercase font-semibold text-indigo-300">Source: {report.config.source}</span>
                        <span>•</span>
                        <span>Schedule: {report.schedule || "None"}</span>
                        <span>•</span>
                        <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href="/reports/builder"
                      className="flex items-center gap-1 rounded-lg border border-crm-border bg-crm-card/50 px-3 py-1.5 text-xs font-semibold text-white hover:bg-crm-cardHover transition-all"
                    >
                      <Play className="h-3 w-3 text-emerald-400 fill-current" />
                      <span>Run</span>
                    </Link>
                    <Link
                      href="/reports/builder"
                      className="p-1.5 text-crm-muted hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
