import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/middleware/apiKeyAuth";
import { leadsService } from "@/lib/services/leadsService";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "read:leads");
  if (errorResponse) return errorResponse;

  try {
    const lead = await leadsService.getLead(params.id);
    if (!lead) {
      return NextResponse.json({ success: false, error: "Lead deal record not found", timestamp: new Date().toISOString() }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: lead, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "write:leads");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const updated = await leadsService.updateLead(params.id, body);
    return NextResponse.json({ success: true, data: updated, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "delete:leads");
  if (errorResponse) return errorResponse;

  try {
    await leadsService.deleteLead(params.id);
    return NextResponse.json({ success: true, message: "Lead deal successfully deleted", timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
