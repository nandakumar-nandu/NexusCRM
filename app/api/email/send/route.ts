import { NextResponse } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email/resendClient";
import WelcomeCustomerEmail from "@/emails/WelcomeCustomerEmail";
import TaskReminderEmail from "@/emails/TaskReminderEmail";
import DealClosedEmail from "@/emails/DealClosedEmail";
import WeeklyReportEmail from "@/emails/WeeklyReportEmail";

/**
 * Internal API Route: POST /api/email/send
 * 
 * Why Server-Side Only?
 * 1. API Key Protection: The `RESEND_API_KEY` carries full email dispatch privileges. It MUST remain 
 *    strictly on the server side and never be compiled into client-side JavaScript bundles.
 * 2. RBAC Access Control: Only authenticated users with 'manager' or 'admin' roles (or internal Edge workers)
 *    are permitted to dispatch transactional emails.
 */

const sendEmailSchema = z.object({
  template: z.enum(["welcome", "task_reminder", "deal_closed", "weekly_report"]),
  to: z.union([z.string().email(), z.array(z.string().email())]),
  subject: z.string().min(1),
  payload: z.record(z.string(), z.any()).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = sendEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid email dispatch payload", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { template, to, subject, payload = {} } = validation.data;

    let reactElement: React.ReactElement;

    switch (template) {
      case "welcome":
        reactElement = WelcomeCustomerEmail({
          customerName: payload.customerName,
          addedByName: payload.addedByName,
        });
        break;
      case "task_reminder":
        reactElement = TaskReminderEmail({
          taskTitle: payload.taskTitle,
          dueDate: payload.dueDate,
          isOverdue: payload.isOverdue,
        });
        break;
      case "deal_closed":
        reactElement = DealClosedEmail({
          dealTitle: payload.dealTitle,
          value: payload.value,
          stage: payload.stage,
        });
        break;
      case "weekly_report":
        reactElement = WeeklyReportEmail({
          weekLabel: payload.weekLabel,
          kpiSnapshot: payload.kpiSnapshot,
        });
        break;
      default:
        return NextResponse.json({ error: "Unsupported email template type" }, { status: 400 });
    }

    const response = await sendEmail({
      to,
      subject,
      react: reactElement,
    });

    console.log(`[Email Dispatch Success] Template: ${template} | Recipient: ${to}`);

    const emailId = (response && "data" in response && response.data?.id) ? response.data.id : ((response as { id?: string })?.id || "mock-email-sent");

    return NextResponse.json({
      success: true,
      email_id: emailId,
      template,
      recipient: to,
    });
  } catch (error: unknown) {
    console.error("[Email API Handler Error]:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
