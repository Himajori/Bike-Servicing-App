import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const patch = z.object({
  id: z.string(),
  basePrice: z.number().positive(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  durationMin: z.number().int().positive().optional(),
});

export async function GET() {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ services });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = patch.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Need a service and a price." }, { status: 400 });
  const prisma = await db();
  const service = await prisma.service.update({
    where: { id: parsed.data.id },
    data: {
      basePrice: parsed.data.basePrice,
      ...(parsed.data.priceMin ? { priceMin: parsed.data.priceMin } : {}),
      ...(parsed.data.priceMax ? { priceMax: parsed.data.priceMax } : {}),
      ...(parsed.data.durationMin ? { durationMin: parsed.data.durationMin } : {}),
    },
  });
  return NextResponse.json({ service });
}
