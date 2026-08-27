import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireMechanic } from "@/lib/auth";

export async function GET() {
  const { session, error } = await requireMechanic();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const items = await prisma.inventoryItem.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ items });
}
