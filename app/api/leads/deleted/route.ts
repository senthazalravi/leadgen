import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET /api/leads/deleted - list all soft-deleted leads ordered by updatedAt desc
export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    console.log('[GET /api/leads/deleted] Fetching deleted leads from Neon DB');
    const rows = await sql`SELECT * FROM "Lead" WHERE "deleted" = true ORDER BY "updatedAt" DESC`;
    console.log('[GET /api/leads/deleted] Loaded deleted leads:', rows.length);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[GET /api/leads/deleted] Error fetching deleted leads from Neon:', error);
    return NextResponse.json({ error: 'Failed to load deleted leads' }, { status: 500 });
  }
}
