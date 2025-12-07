import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET /api/leads/[id] - fetch a single lead
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    const rows = await sql`SELECT * FROM "Lead" WHERE "id" = ${id}`;
    const lead = rows[0];

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead from Neon:', error);
    return NextResponse.json({ error: 'Failed to load lead' }, { status: 500 });
  }
}

// DELETE /api/leads/[id] - delete a single lead
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    const result = await sql`DELETE FROM "Lead" WHERE "id" = ${id} RETURNING "id"`;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead from Neon:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}
