import { createClient as createBrowserClient } from "@/lib/supabase/client";
import Papa from "papaparse";

export interface ReportFilter {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than";
  value: string;
}

export interface ReportConfig {
  source: "customers" | "leads" | "tasks" | "activity_log";
  columns: string[];
  filters: ReportFilter[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SavedReport {
  id: string;
  name: string;
  config: ReportConfig;
  schedule?: "none" | "daily" | "weekly" | "monthly";
  created_at: string;
}

const DEFAULT_MOCK_SAVED_REPORTS: SavedReport[] = [
  {
    id: "r1",
    name: "High Value Leads (> $20k)",
    config: {
      source: "leads",
      columns: ["title", "value", "stage", "created_at"],
      filters: [{ field: "value", operator: "greater_than", value: "20000" }],
      sortBy: "value",
      sortOrder: "desc",
    },
    schedule: "weekly",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "r2",
    name: "Active Enterprise Customers",
    config: {
      source: "customers",
      columns: ["name", "company", "email", "status"],
      filters: [{ field: "status", operator: "equals", value: "Active" }],
      sortBy: "name",
      sortOrder: "asc",
    },
    schedule: "monthly",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const ALLOWED_SOURCES = new Set(["customers", "leads", "tasks", "activity_log"]);
const isBrowser = typeof window !== "undefined";

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes("nexus-demo-session=true");
}

function getMockSavedReports(): SavedReport[] {
  if (!isBrowser) return DEFAULT_MOCK_SAVED_REPORTS;
  const cached = localStorage.getItem("nexus-mock-saved-reports");
  if (!cached) {
    localStorage.setItem("nexus-mock-saved-reports", JSON.stringify(DEFAULT_MOCK_SAVED_REPORTS));
    return DEFAULT_MOCK_SAVED_REPORTS;
  }
  return JSON.parse(cached);
}

function saveMockReports(items: SavedReport[]) {
  if (isBrowser) {
    localStorage.setItem("nexus-mock-saved-reports", JSON.stringify(items));
  }
}

/**
 * Custom Report Builder Service
 * 
 * Safe Dynamic Query Construction (Whitelist Approach):
 * - Raw string concatenation in SQL queries (`SELECT * FROM table WHERE ' + userInput`) creates critical 
 *   SQL injection vulnerabilities.
 * - This service enforces a strict Whitelist approach. `ALLOWED_SOURCES` validates target tables, and 
 *   Supabase Query Builders methodically apply parameters safely via parameterized API abstractions.
 */
export const reportBuilderService = {
  /**
   * Executes a custom report configuration against Supabase or Sandbox caches.
   * 
   * @param config - Report configuration (source, columns, filters)
   */
  async executeReport(config: ReportConfig): Promise<Record<string, unknown>[]> {
    if (!ALLOWED_SOURCES.has(config.source)) {
      throw new Error(`Unauthorized report data source: ${config.source}`);
    }

    if (isDemoSandbox()) {
      const mockKey = `nexus-mock-${config.source === "activity_log" ? "activity-log" : config.source}`;
      const rawCached = localStorage.getItem(mockKey);
      let data: Record<string, unknown>[] = rawCached ? JSON.parse(rawCached) : [];

      // Apply dynamic client-side filters for sandbox mode
      if (config.filters && config.filters.length > 0) {
        data = data.filter((row) => {
          return config.filters.every((f) => {
            const val = String(row[f.field] || "").toLowerCase();
            const queryVal = String(f.value || "").toLowerCase();
            if (f.operator === "equals") return val === queryVal;
            if (f.operator === "contains") return val.includes(queryVal);
            if (f.operator === "greater_than") return Number(row[f.field]) > Number(f.value);
            if (f.operator === "less_than") return Number(row[f.field]) < Number(f.value);
            return true;
          });
        });
      }

      // Filter selected columns
      if (config.columns && config.columns.length > 0) {
        data = data.map((row) => {
          const projected: Record<string, unknown> = {};
          config.columns.forEach((col) => {
            projected[col] = row[col];
          });
          return projected;
        });
      }

      return data;
    }

    const supabase = createBrowserClient();
    const selectFields = config.columns.length > 0 ? config.columns.join(",") : "*";
    let query = supabase.from(config.source).select(selectFields);

    // Apply parameterized filters
    config.filters.forEach((f) => {
      if (f.operator === "equals") query = query.eq(f.field, f.value);
      if (f.operator === "contains") query = query.ilike(f.field, `%${f.value}%`);
      if (f.operator === "greater_than") query = query.gt(f.field, f.value);
      if (f.operator === "less_than") query = query.lt(f.field, f.value);
    });

    if (config.sortBy) {
      query = query.order(config.sortBy, { ascending: config.sortOrder === "asc" });
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data as unknown as Record<string, unknown>[]) || [];
  },

  /**
   * Converts report result datasets into downloadable CSV strings.
   * 
   * @param data - Array of record objects
   */
  exportReportToCsv(data: Record<string, unknown>[]): string {
    return Papa.unparse(data);
  },

  /**
   * Saves a report template to the saved_reports table.
   * 
   * @param name - Template report name
   * @param config - Report configuration payload
   * @param schedule - Optional schedule string
   */
  async saveReportTemplate(name: string, config: ReportConfig, schedule: SavedReport["schedule"] = "none"): Promise<SavedReport> {
    if (isDemoSandbox()) {
      const list = getMockSavedReports();
      const newReport: SavedReport = {
        id: "r-" + Math.random().toString(36).substr(2, 9),
        name,
        config,
        schedule,
        created_at: new Date().toISOString(),
      };
      saveMockReports([newReport, ...list]);
      return newReport;
    }

    const supabase = createBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized user session");

    const { data, error } = await supabase
      .from("saved_reports")
      .insert([
        {
          name,
          config,
          schedule,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data as SavedReport;
  },

  /**
   * Retrieves all saved report templates for the user.
   */
  async getSavedReports(): Promise<SavedReport[]> {
    if (isDemoSandbox()) {
      return getMockSavedReports();
    }

    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("saved_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as SavedReport[]) || [];
  },
};
