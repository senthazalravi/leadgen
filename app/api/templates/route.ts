"use server";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/templates - List all email templates
export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("[GET /api/templates] Error fetching templates:", error);
    return NextResponse.json(
      { error: "Failed to load templates" },
      { status: 500 }
    );
  }
}

// POST /api/templates - Create a new email template
export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const newTemplate = await prisma.emailTemplate.create({
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error("[POST /api/templates] Error creating template:", error);
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    );
  }
}

// PUT /api/templates/[id] - Update an existing template
export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params?.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
  }

  try {
    const { title, content } = await request.json();
    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: {
        title,
        content,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error(`[PUT /api/templates/${id}] Error updating template:`, error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  const id = Number(params?.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid template ID" }, { status: 400 });
  }

  try {
    await prisma.emailTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`[DELETE /api/templates/${id}] Error deleting template:`, error);
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    );
  }
}