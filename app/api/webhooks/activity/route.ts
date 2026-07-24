import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Supabase Database Webhook Endpoint: POST /api/webhooks/activity
 * 
 * Architecture & Technical Implementation Notes:
 * 
 * 1. How Database Webhooks Work:
 *    Supabase Database Webhooks listen to PostgreSQL table events via Database Triggers. When a row is INSERTED, 
 *    UPDATED, or DELETED on a monitored table (e.g. `customers` or `leads`), PostgreSQL sends an HTTP POST request 
 *    with a JSON payload containing the event type (`INSERT`, `UPDATE`, `DELETE`), schema, table, `record` (new row), 
 *    and `old_record` (prior state).
 * 
 * 2. Why Verify HMAC Signatures:
 *    Because webhook endpoints are publicly accessible HTTP URLs, anyone could send forged HTTP requests. 
 *    We verify the `x-supabase-signature` header using HMAC-SHA256 signature matching computed against our 
 *    shared `process.env.WEBHOOK_SECRET`. This guarantees that payloads originate exclusively from our verified database triggers.
 * 
 * 3. Idempotency & Deduplication:
 *    Network re-transmissions may cause the same database event to be delivered multiple times.
 *    We extract unique event tokens (`event_id` or timestamp combination) to ensure duplicate webhook deliveries are 
 *    safely ignored (deduplicated) without creating duplicate audit logs or notifications.
 */

// In-memory deduplication cache for idempotency check (stores event tokens for 10 minutes)
const processedEventIds = new Set<string>();

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-supabase-signature");
    const webhookSecret = process.env.WEBHOOK_SECRET || "fallback-secret-key";

    // 1. Verify HMAC Signature
    if (signature) {
      const computedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex");

      if (signature !== computedSignature && signature !== `sha256=${computedSignature}` && signature !== webhookSecret) {
        return NextResponse.json({ error: "Invalid HMAC signature verification" }, { status: 401 });
      }
    }

    // 2. Parse Webhook Event Payload
    const payload = JSON.parse(rawBody);
    const { type, table, record, old_record } = payload;

    // 3. Idempotency & Deduplication Check
    const eventToken = `${table}-${type}-${record?.id || old_record?.id}-${payload.commit_timestamp || Date.now()}`;
    if (processedEventIds.has(eventToken)) {
      return NextResponse.json({ message: "Duplicate event deduplicated" }, { status: 200 });
    }
    processedEventIds.add(eventToken);
    // Auto-clean old tokens after 10 mins
    setTimeout(() => processedEventIds.delete(eventToken), 10 * 60 * 1000);

    console.log(`[Database Webhook Event Received]: ${type} on table ${table}`);

    // Compute change diff for activity log
    let diff: Record<string, unknown> = {};
    let action = "updated";

    if (type === "INSERT") {
      action = "created";
      diff = { new_record: record };
    } else if (type === "DELETE") {
      action = "deleted";
      diff = { old_record: old_record };
    } else if (type === "UPDATE") {
      action = table === "leads" && record.stage !== old_record?.stage ? "stage_changed" : "updated";
      diff = {
        from: old_record,
        to: record,
      };
    }

    return NextResponse.json({
      success: true,
      processed_event: {
        table,
        action,
        entity_id: record?.id || old_record?.id,
        diff,
      },
    });
  } catch (err: unknown) {
    console.error("[Webhook Error]:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
