"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  analyticsService, 
  type DashboardStats 
} from "@/lib/services/analyticsService";
import { 
  Users, 
  Target, 
  CheckSquare, 
  DollarSign, 
  Clock, 
  Plus, 
  Building,
  Loader2
} from "lucide-react";
import { 
  ResponsiveContainer,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  PieChart, 
  Pie, 
  Cell
} from "recharts";

// Donut Chart Cell Colors: Completed (emerald) vs Pending (indigo/grey)
const DONUT_COLORS = ["#10B981", "#6366F1"];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getDashboardData();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard metrics:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (!mounted) {
    return <div className="text-white text-sm">Initializing CRM metrics...</div>;
  }

  if (loading || !stats) {
    return (
      <div className="flex h-[70vh] items-center justify-center text-crm-muted">
        <Loader2 className="h-6 w-6 animate-spin text-crm-primary" />
        <span className="ml-2 text-sm">Loading dynamic pipeline stats...</span>
      </div>
    );
  }

  // Format pipeline values to human-readable strings (e.g. $12.5K)
  const formatCurrency = (val: number) => {
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(1)}K`;
    }
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Header Panel */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Workspace Overview
          </h1>
          <p className="mt-1 text-sm text-crm-muted">
            Monitor real-time pipeline valuations, sales targets, and tasks closure rates.
          </p>
        </div>
        <div className="flex gap-2">
          <Link 
            href="/leads"
            className="flex items-center gap-2 rounded-lg bg-crm-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-crm-primary/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Opportunity</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI: Total Customers */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted uppercase tracking-wider">Total Customers</span>
            <span className="rounded-lg bg-crm-cardHover p-2 text-indigo-400">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white">{stats.totalCustomers}</span>
            <p className="text-[10px] text-crm-muted mt-1.5">Registered corporate accounts</p>
          </div>
        </div>

        {/* KPI: Open Leads Value */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted uppercase tracking-wider">Open Deals Value</span>
            <span className="rounded-lg bg-crm-cardHover p-2 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-emerald-400">
              ${stats.openLeadsValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <p className="text-[10px] text-crm-muted mt-1.5">Active funnel opportunities</p>
          </div>
        </div>

        {/* KPI: Tasks Due Today */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted uppercase tracking-wider">Due Today</span>
            <span className="rounded-lg bg-crm-cardHover p-2 text-amber-400">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-white">{stats.tasksDueToday}</span>
            <p className="text-[10px] text-crm-muted mt-1.5">Pending follow-ups due today</p>
          </div>
        </div>

        {/* KPI: Win Rate % */}
        <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-crm-muted uppercase tracking-wider">Lead Win Rate</span>
            <span className="rounded-lg bg-crm-cardHover p-2 text-sky-400">
              <Target className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-sky-400">{stats.winRate}%</span>
            <p className="text-[10px] text-crm-muted mt-1.5">Closed deals / Total opportunities</p>
          </div>
        </div>
      </div>

      {/* Row 1: Funnel Bar Chart & Task Donut Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Funnel Bar Chart */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Sales Pipeline Funnel</h2>
            <p className="text-xs text-crm-muted">Total value of deals distributed across pipeline stages.</p>
          </div>

          <div className="h-72">
            {/* 
              ResponsiveContainer: Dynamically adjusts chart size based on parent bounds.
              - width="100%": Stretch to fill parent width.
              - height="100%": Stretch to fill parent height (72rem wrapper).
            */}
            <ResponsiveContainer width="100%" height="100%">
              {/* 
                BarChart: Holds layout metrics for the bar graph.
                - data: Supplies the data coordinates (leadsByStage).
                - margin: Offsets margins to avoid axis labels clipping.
              */}
              <BarChart data={stats.leadsByStage} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                {/* 
                  CartesianGrid: Draws background divider guides.
                  - strokeDasharray="3 3": Dotted patterns (3px dot, 3px gap).
                  - stroke="#1F2937": Border matching dark design grid lines.
                  - vertical={false}: Hides vertical lines to maximize horizontal clarity.
                */}
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                
                {/* 
                  XAxis: Draws horizontal data categories.
                  - dataKey="stage": Maps x-ticks to the stage parameter.
                  - stroke="#9CA3AF": Label text coloring (crm-muted).
                  - fontSize={11}: Sleek small typography.
                  - tickLine={false}: Hides protruding tick markers.
                */}
                <XAxis dataKey="stage" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                
                {/* 
                  YAxis: Draws vertical scales.
                  - stroke="#9CA3AF": Scale markers color.
                  - fontSize={11}: Small text styling.
                  - tickFormatter: Converts raw values to compact strings (e.g. $10K).
                  - axisLine={false}: Hides vertical y-line for clean modern style.
                  - tickLine={false}: Hides protruding tick marks.
                */}
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={11} 
                  tickFormatter={formatCurrency}
                  axisLine={false}
                  tickLine={false}
                />
                
                {/* 
                  Tooltip: Renders custom hover state boxes.
                  - contentStyle: Dark crm theme box styling.
                  - borderStyle: Matching border structure.
                  - formatter: Format values to dollar locale structure.
                */}
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "8px" }}
                  itemStyle={{ color: "#F9FAFB" }}
                  labelStyle={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "bold" }}
                  formatter={(value) => [`$${Number(value || 0).toLocaleString()}`, "Total Value"]}
                />
                
                {/* 
                  Bar: Defines individual data bar columns.
                  - dataKey="value": Sum of lead values parameters.
                  - fill="#6366F1": Core indigo crm theme coloring.
                  - radius={[4, 4, 0, 0]}: Rounded top corners of columns.
                  - maxBarSize={45}: Restricts width of columns to prevent oversized columns on wide viewports.
                */}
                <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Rate Pie/Donut Chart */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Tasks Closure Balance</h2>
            <p className="text-xs text-crm-muted">Completed vs pending checklists status.</p>
          </div>

          <div className="h-60 relative flex items-center justify-center">
            {/* 
              ResponsiveContainer: Wraps the circular pie charts.
            */}
            <ResponsiveContainer width="100%" height="100%">
              {/* 
                PieChart: Layout coordinator for circular graphs.
              */}
              <PieChart>
                {/* 
                  Pie: Draws individual arc slices.
                  - data: Tasks completion ratios metrics.
                  - cx="50%" / cy="50%": Positions center coordinate of donut.
                  - innerRadius={60}: Creates the inner hollow circle, transforming Pie to Donut.
                  - outerRadius={85}: Outer circle border.
                  - paddingAngle={4}: Adds spacing gap between completed/pending segments.
                  - dataKey="value": maps value ratios.
                */}
                <Pie
                  data={stats.taskCompletionRate}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {/* 
                    Cell: Iterates data map and assigns unique slice coloring.
                    - fill: Binds color values sequentially.
                  */}
                  {stats.taskCompletionRate.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                {/* 
                  Tooltip: Hover popup containing numerical counts.
                */}
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "8px" }}
                  itemStyle={{ color: "#F9FAFB" }}
                  labelStyle={{ display: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* In-donut percentage stats center display */}
            <div className="absolute text-center">
              <span className="block text-2xl font-bold text-white">
                {stats.taskCompletionRate[0].value + stats.taskCompletionRate[1].value > 0
                  ? Math.round(
                      (stats.taskCompletionRate[0].value /
                        (stats.taskCompletionRate[0].value + stats.taskCompletionRate[1].value)) *
                        100
                    )
                  : 0}
                %
              </span>
              <span className="text-[9px] uppercase tracking-wider font-semibold text-crm-muted">Closed</span>
            </div>
          </div>

          {/* Color Legend indicator list */}
          <div className="flex justify-center gap-6 text-xs text-crm-muted font-semibold pt-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-emerald-500"></span>
              <span>Completed ({stats.taskCompletionRate[0].value})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded bg-crm-primary"></span>
              <span>Pending ({stats.taskCompletionRate[1].value})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Customer Trend Line Chart & Recent Activity Feed */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Customer Registrations Trend Line Chart */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Customer Growth Trend</h2>
            <p className="text-xs text-crm-muted">Monthly progression rate of new customer account registrations.</p>
          </div>

          <div className="h-72">
            {/* 
              ResponsiveContainer: Wraps the line trend chart.
            */}
            <ResponsiveContainer width="100%" height="100%">
              {/* 
                LineChart: Hosts layout metrics for line progression coordinate mapping.
                - data: Growth trend array.
              */}
              <LineChart data={stats.newCustomersPerMonth} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                {/* 
                  CartesianGrid: Background grid.
                */}
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                
                {/* 
                  XAxis: Category month label coordinate mapping.
                  - dataKey="month": Month short name (e.g. Jan).
                */}
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                
                {/* 
                  YAxis: Counts index labels scale.
                */}
                <YAxis stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} allowDecimals={false} />
                
                {/* 
                  Tooltip: Growth counts preview.
                */}
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#1F2937", borderRadius: "8px" }}
                  itemStyle={{ color: "#F9FAFB" }}
                  labelStyle={{ color: "#9CA3AF", fontSize: "12px", fontWeight: "bold" }}
                  formatter={(value) => [value || 0, "New Accounts"]}
                />
                
                {/* 
                  Line: Progress line coordinate parameters.
                  - type="monotone": Standard bezier curve logic for smooth transition layouts.
                  - dataKey="count": Binds growth count field.
                  - stroke="#10B981": Emerald color theme accents.
                  - strokeWidth={3.5}: Thicker sleek line.
                  - dot={{ stroke: '#10B981', strokeWidth: 2, r: 4, fill: '#111827' }}: Dot highlights.
                  - activeDot={{ r: 6 }}: Hover interactive size scaling.
                */}
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10B981" 
                  strokeWidth={3.5}
                  dot={{ stroke: '#10B981', strokeWidth: 2, r: 4, fill: '#111827' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Activity</h2>
            <Clock className="h-4.5 w-4.5 text-crm-muted shrink-0" />
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {stats.recentActivity.length === 0 ? (
              <div className="text-center py-16 text-crm-muted text-xs italic bg-crm-card/10 border border-dashed border-crm-border/30 rounded-lg">
                No recent actions recorded.
              </div>
            ) : (
              stats.recentActivity.map((activity) => {
                const dateLabel = new Date(activity.timestamp).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                return (
                  <div key={activity.id} className="flex gap-3 text-xs border-b border-crm-border/40 pb-3 last:border-0 last:pb-0">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crm-cardHover text-[10px]">
                      {activity.type === 'lead' ? (
                        <Target className="h-3 w-3 text-sky-400" />
                      ) : activity.type === 'task' ? (
                        <CheckSquare className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Building className="h-3 w-3 text-indigo-400" />
                      )}
                    </span>
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{activity.title}</p>
                      <p className="text-[10px] text-crm-muted truncate">{activity.subtitle}</p>
                      <p className="text-[9px] text-indigo-400/70 font-semibold">{dateLabel}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
