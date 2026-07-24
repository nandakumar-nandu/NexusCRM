import { Resend } from "resend";

/**
 * Resend Email Client Service Initializer & Transport Wrapper
 * 
 * Architectural & Technical Design Notes:
 * 
 * 1. Why Resend over Nodemailer?
 *    - Serverless & Edge Compatibility: Standard Nodemailer requires low-level TCP/SMTP socket connections (port 587/465). 
 *      Serverless and Edge environments (Next.js Edge Middleware, Vercel Edge, Supabase Deno Edge Functions) block raw TCP sockets.
 *    - Resend operates via secure HTTPS REST API requests, allowing zero-latency email dispatch across Node.js and Edge runtimes.
 * 
 * 2. Rate Limiting Considerations:
 *    - Resend default developer plans enforce rate limits (e.g., 2 emails/second, 100 emails/day on free tier).
 *    - Production systems should decouple email dispatch into async background job queues (e.g., Upstash QStash, BullMQ)
 *      or batch multiple recipient calls via Resend's batch endpoint to prevent HTTP 429 rate limit errors.
 */

const resendApiKey = process.env.RESEND_API_KEY || "re_mock_development_key";
export const resend = new Resend(resendApiKey);

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
}

export async function sendEmail({ to, subject, react, from }: SendEmailOptions) {
  const fromAddress = from || `${process.env.RESEND_FROM_NAME || "NexusCRM"} <${process.env.RESEND_FROM_EMAIL || "noreply@yournexuscrm.app"}>`;

  // Fallback for offline development / mock mode when API key is missing or placeholder
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes("mock")) {
    console.log(`[Development Mock Email Dispatch] To: ${Array.isArray(to) ? to.join(", ") : to} | Subject: "${subject}"`);
    return { id: "mock-email-id-" + Date.now(), error: null };
  }

  try {
    const response = await resend.emails.send({
      from: fromAddress,
      to,
      subject,
      react,
    });
    return response;
  } catch (error) {
    console.error("[Resend Email Dispatch Error]:", error);
    throw error;
  }
}
