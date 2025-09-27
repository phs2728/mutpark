import { NextResponse } from "next/server";
import { isDatabaseHealthy } from "@/lib/prisma";

export async function GET() {
  try {
    const isHealthy = await isDatabaseHealthy();

    if (isHealthy) {
      return NextResponse.json(
        {
          status: "healthy",
          message: "Database connection is working",
          timestamp: new Date().toISOString(),
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          status: "unhealthy",
          message: "Database connection failed",
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("Database health check error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}