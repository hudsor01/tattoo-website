import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/auth';

import { logger } from "@/lib/logger";
export async function GET(_request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      status: 'success',
      message: 'Database connection working',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    void logger.error('Database connection error:', error);
    return NextResponse.json({ 
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
