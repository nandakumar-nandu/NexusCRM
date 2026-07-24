import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/middleware/apiKeyAuth";
import { customersService } from "@/lib/services/customersService";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "read:customers");
  if (errorResponse) return errorResponse;

  try {
    const customer = await customersService.getCustomer(params.id);
    if (!customer) {
      return NextResponse.json({ success: false, error: "Customer record not found", timestamp: new Date().toISOString() }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: customer, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 404 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "write:customers");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const updated = await customersService.updateCustomer(params.id, body);
    return NextResponse.json({ success: true, data: updated, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "delete:customers");
  if (errorResponse) return errorResponse;

  try {
    await customersService.deleteCustomer(params.id);
    return NextResponse.json({ success: true, message: "Customer successfully deleted", timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
