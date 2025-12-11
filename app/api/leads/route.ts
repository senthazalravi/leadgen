import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET /api/leads - list all leads ordered by createdAt desc
export async function GET() {
  try {
    const sql = neon(process.env.NEON_DATABASE_URL!);
    console.log('[GET /api/leads] Fetching active leads from Neon DB');
    const rows = await sql`SELECT * FROM "Lead" ORDER BY "createdAt" DESC`;
    console.log('[GET /api/leads] Loaded leads:', rows.length);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('[GET /api/leads] Error fetching leads from Neon:', error);
    return NextResponse.json({ error: 'Failed to load leads' }, { status: 500 });
  }
}

// POST /api/leads - create a new lead
export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = (formData.get('name') as string) ?? '';
    const country = (formData.get('country') as string) ?? '';
    const rawStatus = (formData.get('status') as string) ?? 'HOT';
    const phoneNumber = (formData.get('phoneNumber') as string) ?? '';
    const whatsappNumber = (formData.get('whatsappNumber') as string) ?? '';
    const website = (formData.get('website') as string) ?? '';
    const email = (formData.get('email') as string) ?? '';
    const notes = (formData.get('notes') as string) ?? '';

    if (!name.trim()) {
      console.warn('[POST /api/leads] Missing name field');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Map UI statuses into the PostgreSQL LeadStatus enum
    // DB enum values: HOT, PROGRESS, DISQUALIFIED
    let status: 'HOT' | 'PROGRESS' | 'DISQUALIFIED';
    switch (rawStatus) {
      case 'HOT':
        status = 'HOT';
        break;
      case 'PROGRESS':
      case 'WARM':
        status = 'PROGRESS';
        break;
      case 'COLD':
      case 'COMPLETED':
      case 'DISQUALIFIED':
        status = 'DISQUALIFIED';
        break;
      default:
        status = 'HOT';
        break;
    }

    console.log('[POST /api/leads] Creating lead with data:', {
      name,
      country,
      rawStatus,
      mappedStatus: status,
      phoneNumber,
      whatsappNumber,
      website,
      email,
      hasNotes: !!notes,
    });

    const sql = neon(process.env.NEON_DATABASE_URL!);

    const rows = await sql`
      INSERT INTO "Lead" (
        "name",
        "country",
        "phoneNumber",
        "whatsappNumber",
        "dealProfile",
        "website",
        "email",
        "notes",
        "status",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${name},
        ${country || null},
        ${phoneNumber || null},
        ${whatsappNumber || null},
        ${null},
        ${website || null},
        ${email || null},
        ${notes || null},
        ${status}::"LeadStatus",
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    const lead = rows[0];
    console.log('[POST /api/leads] Created lead with id:', lead?.id);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('[POST /api/leads] Error creating lead in Neon:', error);
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
  }
}
