import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET /api/leads/[id] - fetch a single lead
export async function GET(
  _req: Request,
  context: any,
) {
  const params = await context.params;
  const id = Number(params?.id);
  if (Number.isNaN(id)) {
    console.warn('[GET /api/leads/[id]] Invalid id param:', params?.id);
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    console.log('[GET /api/leads/[id]] Fetching lead with id:', id);
    const rows = await sql`SELECT * FROM "Lead" WHERE "id" = ${id}`;
    const lead = rows[0];

    if (!lead) {
      console.warn('[GET /api/leads/[id]] Lead not found for id:', id);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    console.log('[GET /api/leads/[id]] Loaded lead');
    return NextResponse.json(lead);
  } catch (error) {
    console.error('[GET /api/leads/[id]] Error fetching lead from Neon:', error);
    return NextResponse.json({ error: 'Failed to load lead' }, { status: 500 });
  }
}

// DELETE /api/leads/[id] - delete a single lead
export async function DELETE(
  _req: Request,
  context: any,
) {
  const params = await context.params;
  const id = Number(params?.id);
  if (Number.isNaN(id)) {
    console.warn('[DELETE /api/leads/[id]] Invalid id param:', params?.id);
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    console.log('[DELETE /api/leads/[id]] Soft-deleting lead with id:', id);
    const result = await sql`
      UPDATE "Lead"
      SET "deleted" = true,
          "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING "id"
    `;

    if (result.length === 0) {
      console.warn('[DELETE /api/leads/[id]] Lead not found for id:', id);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    console.log('[DELETE /api/leads/[id]] Lead deleted');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[DELETE /api/leads/[id]] Error deleting lead from Neon:', error);
    return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
  }
}

// PUT /api/leads/[id] - update a single lead
export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params?.id);
  if (Number.isNaN(id)) {
    console.warn('[PUT /api/leads/[id]] Invalid id param:', params?.id);
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    const updatedLead = await request.json();
    console.log('[PUT /api/leads/[id]] Updating lead with id:', id, 'Data:', updatedLead);
    const result = await sql`
      UPDATE \"Lead\"
      SET 
        \"name\" = ${updatedLead.name},
        \"country\" = ${updatedLead.country},
        \"status\" = ${updatedLead.status},
        \"phoneNumber\" = ${updatedLead.phoneNumber},
        \"whatsappNumber\" = ${updatedLead.whatsappNumber},
        \"website\" = ${updatedLead.website},
        \"notes\" = ${updatedLead.notes},
        \"updatedAt\" = NOW()
      WHERE \"id\" = ${id}
      RETURNING *
    `;
    if (result.length === 0) {
      console.warn('[PUT /api/leads/[id]] Lead not found for id:', id);
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    console.log('[PUT /api/leads/[id]] Lead updated');
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('[PUT /api/leads/[id]] Error updating lead from Neon:', error);
    return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
  }
}
