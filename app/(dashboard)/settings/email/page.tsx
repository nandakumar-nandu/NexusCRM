"use client";

import React, { useState } from "react";
import { Mail, Check, Send } from "lucide-react";
import { emailService } from "@/lib/services/emailService";

/**
 * Settings Page: Email Preferences (/settings/email)
 * 
 * Architectural & Trade-off Comments:
 * 
 * JSONB vs Separate Database Columns Trade-off:
 * - Separate Columns (e.g. `welcome_emails BOOLEAN`): Requires explicit table migrations whenever new alert toggles 
 *   are introduced. Provides static type constraints.
 * - JSONB Payload (`email_preferences JSONB`): Allows flexible key-value flag storage without schema locks or 
 *   database migration overhead.
 */
export default function EmailSettingsPage() {
  const [preferences, setPreferences] = useState({
    welcome_emails: true,
    task_reminders: true,
    deal_updates: true,
    weekly_reports: true,
  });

  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [loadingTest, setLoadingTest] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestEmail = async () => {
    setLoadingTest(true);
    setTestEmailStatus(null);
    try {
      await emailService.sendWeeklyReport(
        "admin@yournexuscrm.app",
        "Sample Test Report",
        {
          totalCustomers: 128,
          openDealsValue: 340000,
          tasksCompleted: 54,
          winRatePercent: 72,
        }
      );
      setTestEmailStatus("Test email dispatched successfully!");
    } catch (err: unknown) {
      console.error("Failed to send test email:", err);
      setTestEmailStatus("Failed to send test email. Check API key settings.");
    } finally {
      setLoadingTest(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Email Notification Settings</h1>
        <p className="mt-1 text-sm text-crm-muted">
          Manage your automated transactional email notifications and weekly executive digests.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="glass-panel space-y-6 rounded-xl border border-crm-border/60 p-6">
        <div className="flex items-center gap-3 border-b border-crm-border/40 pb-4">
          <div className="rounded-xl bg-crm-primary/10 p-2.5 text-crm-primary border border-crm-primary/20">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Transactional Channels</h2>
            <p className="text-xs text-crm-muted">Configure triggers for automated client and internal email alerts.</p>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-crm-card/40 border border-crm-border/40">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white">Welcome Customer Emails</span>
              <p className="text-xs text-crm-muted">Send automated welcome kits when new customers are registered.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("welcome_emails")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.welcome_emails ? "bg-crm-primary" : "bg-crm-cardHover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.welcome_emails ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-crm-card/40 border border-crm-border/40">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white">Task Deadline Reminders</span>
              <p className="text-xs text-crm-muted">Receive email alerts for tasks due within the next 24 hours.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("task_reminders")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.task_reminders ? "bg-crm-primary" : "bg-crm-cardHover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.task_reminders ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-crm-card/40 border border-crm-border/40">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white">Deal Stage Updates</span>
              <p className="text-xs text-crm-muted">Notify team leads when high-value opportunities move to Closed/Won.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("deal_updates")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.deal_updates ? "bg-crm-primary" : "bg-crm-cardHover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.deal_updates ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-crm-card/40 border border-crm-border/40">
            <div className="space-y-0.5">
              <span className="text-sm font-semibold text-white">Weekly Executive Digest</span>
              <p className="text-xs text-crm-muted">Receive a Monday morning KPI report summarizing weekly sales volume.</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("weekly_reports")}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                preferences.weekly_reports ? "bg-crm-primary" : "bg-crm-cardHover"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  preferences.weekly_reports ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-crm-border/40 pt-4">
          <button
            type="button"
            onClick={handleSendTestEmail}
            disabled={loadingTest}
            className="flex items-center gap-2 rounded-lg border border-crm-border bg-crm-card/60 px-4 py-2 text-xs font-semibold text-crm-primary hover:bg-crm-cardHover transition-all disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>{loadingTest ? "Sending..." : "Send Test Email"}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-crm-primary px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition-all shadow-md shadow-crm-primary/20"
          >
            <Check className="h-4 w-4" />
            <span>{savedSuccess ? "Saved Preferences!" : "Save Preferences"}</span>
          </button>
        </div>

        {testEmailStatus && (
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
            {testEmailStatus}
          </div>
        )}
      </div>
    </div>
  );
}
