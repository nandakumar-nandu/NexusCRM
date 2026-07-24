/**
 * Transactional Email Dispatch Service
 * 
 * Provides unified helper functions for triggering customer welcome emails, task deadline alerts,
 * deal stage update notifications, and executive weekly reports.
 */

const isBrowser = typeof window !== "undefined";

function isDemoSandbox(): boolean {
  if (!isBrowser) return false;
  return document.cookie.includes("nexus-demo-session=true");
}

export const emailService = {
  /**
   * Dispatches a welcome email to a newly added corporate customer.
   * 
   * @param to - Recipient email address
   * @param customerName - Customer contact name
   * @param addedByName - Account executive or rep who added the profile
   */
  async sendWelcomeEmail(to: string, customerName: string, addedByName: string = "Sales Team") {
    if (isDemoSandbox()) {
      console.log(`[Sandbox Mock Welcome Email] To: ${to} | Customer: ${customerName}`);
      return { success: true, mock: true };
    }

    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "welcome",
        to,
        subject: `Welcome to NexusCRM, ${customerName}!`,
        payload: { customerName, addedByName },
      }),
    });

    if (!res.ok) throw new Error("Failed to dispatch welcome email");
    return res.json();
  },

  /**
   * Sends an automated task reminder alert to an assigned team member.
   * 
   * @param to - Recipient email address
   * @param taskTitle - Assigned task title
   * @param dueDate - Task target deadline
   * @param isOverdue - Whether the task is currently past due
   */
  async sendTaskReminder(to: string, taskTitle: string, dueDate: string, isOverdue: boolean = false) {
    if (isDemoSandbox()) {
      console.log(`[Sandbox Mock Task Reminder Email] To: ${to} | Task: ${taskTitle}`);
      return { success: true, mock: true };
    }

    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "task_reminder",
        to,
        subject: `${isOverdue ? "⚠️ Overdue Task Alert" : "📅 Task Due Reminder"}: ${taskTitle}`,
        payload: { taskTitle, dueDate, isOverdue },
      }),
    });

    if (!res.ok) throw new Error("Failed to dispatch task reminder email");
    return res.json();
  },

  /**
   * Dispatches deal stage update notifications when an opportunity is won/lost or moved.
   * 
   * @param to - Recipient email address
   * @param dealTitle - Opportunity title
   * @param value - Financial deal value
   * @param stage - Deal pipeline stage
   */
  async sendDealClosedEmail(to: string, dealTitle: string, value: number, stage: "Closed" | "Proposal" | "Qualified" = "Closed") {
    if (isDemoSandbox()) {
      console.log(`[Sandbox Mock Deal Email] To: ${to} | Deal: ${dealTitle} ($${value})`);
      return { success: true, mock: true };
    }

    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "deal_closed",
        to,
        subject: `🎉 Sales Deal Status Update: ${dealTitle}`,
        payload: { dealTitle, value, stage },
      }),
    });

    if (!res.ok) throw new Error("Failed to dispatch deal update email");
    return res.json();
  },

  /**
   * Dispatches the executive weekly performance summary email.
   * 
   * @param to - Recipient email address
   * @param weekLabel - Label string for the target week
   * @param kpiSnapshot - Key performance indicator metrics
   */
  async sendWeeklyReport(
    to: string,
    weekLabel: string,
    kpiSnapshot: { totalCustomers: number; openDealsValue: number; tasksCompleted: number; winRatePercent: number }
  ) {
    if (isDemoSandbox()) {
      console.log(`[Sandbox Mock Weekly Report Email] To: ${to} | Week: ${weekLabel}`);
      return { success: true, mock: true };
    }

    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        template: "weekly_report",
        to,
        subject: `📊 Executive Sales Brief: ${weekLabel}`,
        payload: { weekLabel, kpiSnapshot },
      }),
    });

    if (!res.ok) throw new Error("Failed to dispatch weekly report email");
    return res.json();
  },
};
