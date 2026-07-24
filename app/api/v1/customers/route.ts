import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/middleware/apiKeyAuth";
import { customersService } from "@/lib/services/customersService";

export async function GET(request: Request) {
  const { errorResponse } = await validateApiKey(request, "read:customers");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "All";
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await customersService.getCustomers(page, search, status, limit);
    const totalPages = Math.ceil(result.count / limit) || 1;

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: {
        page,
        limit,
        total: result.count,
        totalPages,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await validateApiKey(request, "write:customers");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const newCustomer = await customersService.createCustomer({
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone || "",
      status: body.status || "Lead",
      tags: body.tags || [],
      notes: body.notes || "",
    });

    return NextResponse.json({
      success: true,
      data: newCustomer,
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 400 });
  }
}
