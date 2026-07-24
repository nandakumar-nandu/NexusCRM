import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/middleware/apiKeyAuth";
import { leadsService } from "@/lib/services/leadsService";

export async function GET(request: Request) {
  const { errorResponse } = await validateApiKey(request, "read:leads");
  if (errorResponse) return errorResponse;

  try {
    const leads = await leadsService.getLeads();
    return NextResponse.json({
      success: true,
      data: leads,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await validateApiKey(request, "write:leads");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const newLead = await leadsService.createLead({
      title: body.title,
      customer_id: body.customer_id,
      value: body.value,
      stage: body.stage || "New",
      probability: body.probability || 50,
      expected_close_date: body.expected_close_date,
      notes: body.notes || "",
    });

    return NextResponse.json({
      success: true,
      data: newLead,
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 400 });
  }
}
