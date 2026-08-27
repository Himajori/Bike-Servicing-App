import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  quantity: z.number().int().min(0),
  unitPrice: z.number().positive(),
});

export async function GET() {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Name, SKU, quantity, and price are required." }, { status: 400 });
  const prisma = await db();
  const item = await prisma.inventoryItem.create({ data: parsed.data });
  return NextResponse.json({ item });
}
