// src/app/api/test-db/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Simple query to verify connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      database: 'PostgreSQL',
      connected: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

