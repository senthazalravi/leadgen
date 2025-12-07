import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// POST /api/leads/[id]/restore - restore a soft-deleted lead
export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    console.warn('[POST /api/leads/[id]/restore] Invalid id param:', params.id);
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    console.log('[POST /api/leads/[id]/restore] Restoring lead with id:', id);
    const result = await sql`
      UPDATE "Lead"
      SET "deleted" = false,
          "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING "id"`;

    if (result.length === 0) {
      console.warn('[POST /api/leads/[id]/restore] Lead not found for id:', id);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    console.log('[POST /api/leads/[id]/restore] Lead restored');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[POST /api/leads/[id]/restore] Error restoring lead in Neon:', error);
    return NextResponse.json({ error: 'Failed to restore lead' }, { status: 500 });
  }
}
