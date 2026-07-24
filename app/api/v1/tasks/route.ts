import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/middleware/apiKeyAuth";
import { tasksService } from "@/lib/services/tasksService";

export async function GET(request: Request) {
  const { errorResponse } = await validateApiKey(request, "read:tasks");
  if (errorResponse) return errorResponse;

  try {
    const tasks = await tasksService.getTasks();
    return NextResponse.json({
      success: true,
      data: tasks,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { errorResponse } = await validateApiKey(request, "write:tasks");
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const newTask = await tasksService.createTask({
      title: body.title,
      customer_id: body.customer_id,
      lead_id: body.lead_id,
      due_date: body.due_date,
      priority: body.priority || "Medium",
      completed: body.completed ?? false,
    });

    return NextResponse.json({
      success: true,
      data: newTask,
      timestamp: new Date().toISOString(),
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 400 });
  }
}
