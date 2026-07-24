import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/middleware/apiKeyAuth";
import { tasksService } from "@/lib/services/tasksService";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "read:tasks");
  if (errorResponse) return errorResponse;

  try {
    const task = await tasksService.getTask(params.id);
    if (!task) {
      return NextResponse.json({ success: false, error: "Task record not found", timestamp: new Date().toISOString() }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: task, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "write:tasks");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const updated = await tasksService.updateTask(params.id, body);
    return NextResponse.json({ success: true, data: updated, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { errorResponse } = await validateApiKey(request, "delete:tasks");
  if (errorResponse) return errorResponse;

  try {
    await tasksService.deleteTask(params.id);
    return NextResponse.json({ success: true, message: "Task successfully deleted", timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
