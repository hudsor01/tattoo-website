import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import { logger } from "@/lib/logger";
export async function GET(request: NextRequest) {
  try {
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: request.headers
    });

    return NextResponse.json({
      status: "success",
      session: session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
        sessionId: session.session.id,
      } : null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    void logger.error('Auth debug error:', error);
    
    return NextResponse.json({
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
