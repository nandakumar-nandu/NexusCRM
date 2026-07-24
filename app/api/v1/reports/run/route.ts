import { NextResponse } from "next/server";
import { validateApiKey } from "@/lib/middleware/apiKeyAuth";
import { reportBuilderService, type ReportConfig } from "@/lib/services/reportBuilderService";

export async function POST(request: Request) {
  const { errorResponse } = await validateApiKey(request, "execute:reports");
  if (errorResponse) return errorResponse;

  try {
    const config: ReportConfig = await request.json();

    if (!config.source || !config.columns) {
      return NextResponse.json(
        { success: false, error: "Invalid report configuration. 'source' and 'columns' are required.", timestamp: new Date().toISOString() },
        { status: 400 }
      );
    }

    const data = await reportBuilderService.executeReport(config);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        total: data.length,
        source: config.source,
        columns: config.columns,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message, timestamp: new Date().toISOString() }, { status: 500 });
  }
}
