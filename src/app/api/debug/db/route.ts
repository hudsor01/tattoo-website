import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { logger } from "@/lib/logger";
export async function GET(_request: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    void logger.info("Testing database connection...");
    
    // Test basic connection
    await prisma.$connect();
    void logger.info("✅ Connected to database");
    
    // Test if tables exist
    const userCount = await prisma.user.count();
    void logger.info("✅ User table exists, count:", userCount);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: "success",
      message: "Database connection working",
      userCount,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    void logger.error("❌ Database error:", error);
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: "error",
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
