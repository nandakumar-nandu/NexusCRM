"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  ChevronRight, 
  Terminal, 
  ShieldAlert, 
  BookOpen 
} from "lucide-react";

interface ApiEndpointDoc {
  id: string;
  resource: "Customers" | "Leads" | "Tasks" | "Reports";
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  title: string;
  permission: string;
  description: string;
  queryParams?: { name: string; type: string; required: boolean; desc: string }[];
  bodyParams?: { name: string; type: string; required: boolean; desc: string }[];
  responseExample: Record<string, unknown>;
  curlExample: string;
}

const API_ENDPOINTS: ApiEndpointDoc[] = [
  {
    id: "get-customers",
    resource: "Customers",
    method: "GET",
    path: "/api/v1/customers",
    title: "List & Search Customers",
    permission: "read:customers",
    description: "Returns a paginated list of registered corporate customer profiles matching optional search filters.",
    queryParams: [
      { name: "page", type: "number", required: false, desc: "Target page number (default: 1)" },
      { name: "limit", type: "number", required: false, desc: "Records limit per page (default: 10)" },
      { name: "search", type: "string", required: false, desc: "Filter by contact name or email" },
      { name: "status", type: "string", required: false, desc: "Filter by stage (Active, Inactive, Lead)" },
    ],
    responseExample: {
      success: true,
      data: [
        {
          id: "cust-123",
          name: "Acme Corporation",
          company: "Acme Corp",
          email: "contact@acme.com",
          status: "Active",
          created_at: "2026-07-24T12:00:00Z",
        },
      ],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      timestamp: "2026-07-24T13:00:00Z",
    },
    curlExample: `curl -X GET "https://yournexuscrm.app/api/v1/customers?limit=10" \\
  -H "Authorization: Bearer nx_live_your_api_key_here"`,
  },
  {
    id: "post-customers",
    resource: "Customers",
    method: "POST",
    path: "/api/v1/customers",
    title: "Create Customer Record",
    permission: "write:customers",
    description: "Creates a new corporate customer profile entry.",
    bodyParams: [
      { name: "name", type: "string", required: true, desc: "Customer contact name" },
      { name: "company", type: "string", required: true, desc: "Company organization title" },
      { name: "email", type: "string", required: true, desc: "Contact email address" },
      { name: "phone", type: "string", required: false, desc: "Phone contact number" },
    ],
    responseExample: {
      success: true,
      data: {
        id: "cust-999",
        name: "Starlight Media",
        company: "Starlight Corp",
        email: "info@starlight.com",
        status: "Lead",
        created_at: "2026-07-24T13:05:00Z",
      },
      timestamp: "2026-07-24T13:05:00Z",
    },
    curlExample: `curl -X POST "https://yournexuscrm.app/api/v1/customers" \\
  -H "Authorization: Bearer nx_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Starlight Media","company":"Starlight Corp","email":"info@starlight.com"}'`,
  },
  {
    id: "get-leads",
    resource: "Leads",
    method: "GET",
    path: "/api/v1/leads",
    title: "List Sales Pipeline Deals",
    permission: "read:leads",
    description: "Retrieves active sales deal cards across Kanban pipeline stages.",
    responseExample: {
      success: true,
      data: [
        {
          id: "lead-456",
          title: "Cloud Infrastructure Deal",
          value: 45000,
          stage: "Proposal",
          probability: 75,
        },
      ],
      timestamp: "2026-07-24T13:00:00Z",
    },
    curlExample: `curl -X GET "https://yournexuscrm.app/api/v1/leads" \\
  -H "Authorization: Bearer nx_live_your_api_key_here"`,
  },
  {
    id: "post-reports-run",
    resource: "Reports",
    method: "POST",
    path: "/api/v1/reports/run",
    title: "Execute Custom Report Headlessly",
    permission: "execute:reports",
    description: "Executes a custom report configuration headlessly via API and returns matching JSON records.",
    bodyParams: [
      { name: "source", type: "string", required: true, desc: "Target dataset ('customers', 'leads', 'tasks', 'activity_log')" },
      { name: "columns", type: "string[]", required: true, desc: "Array of fields to project" },
    ],
    responseExample: {
      success: true,
      data: [{ title: "Enterprise Lead", value: 50000 }],
      meta: { total: 1, source: "leads", columns: ["title", "value"] },
      timestamp: "2026-07-24T13:10:00Z",
    },
    curlExample: `curl -X POST "https://yournexuscrm.app/api/v1/reports/run" \\
  -H "Authorization: Bearer nx_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"source":"leads","columns":["title","value"]}'`,
  },
];

/**
 * Architectural Note on Inline Docs vs External OpenAPI Specs:
 * - External OpenAPI (Swagger) specifications often drift out of sync as developers edit internal Next.js API route handlers.
 * - Co-locating interactive documentation directly within the web app ensures a single source of truth, 
 *   eliminates documentation drift, and allows instant "Copy as cURL" testing for developer onboarding.
 */
export default function ApiDocsPage() {
  const [selectedDocId, setSelectedDocId] = useState<string>("get-customers");
  const [copiedCurl, setCopiedCurl] = useState(false);

  const currentDoc = API_ENDPOINTS.find((d) => d.id === selectedDocId) || API_ENDPOINTS[0];

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(currentDoc.curlExample);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const getMethodBadgeColor = (method: ApiEndpointDoc["method"]) => {
    switch (method) {
      case "GET":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "POST":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "PUT":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "DELETE":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
  };

  return (
    <div className="max-w-6xl space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings/api"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-crm-border bg-crm-card/50 text-crm-muted hover:text-white hover:bg-crm-card transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-crm-primary" />
            <span>Developer REST API v1 Reference</span>
          </h1>
          <p className="text-xs text-crm-muted">Complete interactive endpoint documentation and code snippets.</p>
        </div>
      </div>

      {/* Main Layout: Sidebar Navigation + Endpoint Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Endpoint List */}
        <div className="glass-panel rounded-xl border border-crm-border/60 p-4 space-y-4 h-fit">
          <span className="text-xs font-bold uppercase tracking-wider text-crm-muted block border-b border-crm-border/40 pb-2">
            API Endpoints
          </span>
          <div className="space-y-1">
            {API_ENDPOINTS.map((doc) => {
              const isSelected = selectedDocId === doc.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`flex w-full items-center justify-between p-2.5 rounded-lg text-left text-xs transition-all ${
                    isSelected
                      ? "bg-crm-primary text-white font-bold shadow-md shadow-crm-primary/20"
                      : "text-crm-muted hover:bg-crm-cardHover hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${getMethodBadgeColor(doc.method)}`}>
                      {doc.method}
                    </span>
                    <span className="truncate">{doc.title}</span>
                  </div>
                  {isSelected && <ChevronRight className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="glass-panel md:col-span-3 rounded-xl border border-crm-border/60 p-6 space-y-6">
          {/* Method + Path Header */}
          <div className="space-y-2 border-b border-crm-border/40 pb-4">
            <div className="flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getMethodBadgeColor(currentDoc.method)}`}>
                {currentDoc.method}
              </span>
              <span className="font-mono text-base font-bold text-white">{currentDoc.path}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{currentDoc.title}</h2>
            <p className="text-xs text-crm-muted leading-relaxed">{currentDoc.description}</p>
          </div>

          {/* Required Permission Scope */}
          <div className="flex items-center gap-2 rounded-xl bg-crm-card/40 border border-crm-border/40 p-3 text-xs text-crm-muted">
            <ShieldAlert className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Required Scope Permission:</span>
            <span className="font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              {currentDoc.permission}
            </span>
          </div>

          {/* Query / Body Parameters */}
          {currentDoc.queryParams && (
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-crm-muted block">Query Parameters</span>
              <div className="rounded-xl border border-crm-border/50 bg-crm-card/30 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-crm-border/40 bg-crm-cardHover/40 text-crm-muted">
                    <tr>
                      <th className="p-2.5">Parameter</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Required</th>
                      <th className="p-2.5">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-crm-border/30 text-white">
                    {currentDoc.queryParams.map((param) => (
                      <tr key={param.name}>
                        <td className="p-2.5 font-mono font-bold text-indigo-300">{param.name}</td>
                        <td className="p-2.5 text-crm-muted">{param.type}</td>
                        <td className="p-2.5 text-crm-muted">{param.required ? "Yes" : "No"}</td>
                        <td className="p-2.5 text-crm-muted">{param.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* cURL Example Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-crm-muted flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Example cURL Request</span>
              </span>
              <button
                onClick={handleCopyCurl}
                className="flex items-center gap-1 rounded-lg border border-crm-border bg-crm-card/60 px-3 py-1 text-xs font-semibold text-white hover:bg-crm-card transition-all"
              >
                {copiedCurl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCurl ? "Copied!" : "Copy cURL"}</span>
              </button>
            </div>
            <pre className="rounded-xl border border-crm-border bg-crm-bg p-4 font-mono text-xs text-slate-200 overflow-x-auto">
              <code>{currentDoc.curlExample}</code>
            </pre>
          </div>

          {/* JSON Response Example */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-crm-muted block">Example JSON Response (200 OK)</span>
            <pre className="rounded-xl border border-crm-border bg-crm-bg p-4 font-mono text-xs text-sky-300 overflow-x-auto">
              <code>{JSON.stringify(currentDoc.responseExample, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
