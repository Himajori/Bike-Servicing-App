import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer } from "@/lib/auth";

const schema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1970).max(new Date().getFullYear() + 1).nullable().optional(),
  registration: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const bikes = await prisma.bike.findMany({
    where: { customerId: session.customerId! },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ bikes });
}

export async function POST(request: Request) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Brand and model are required." }, { status: 400 });
  }
  const prisma = await db();
  const bike = await prisma.bike.create({
    data: {
      customerId: session.customerId!,
      brand: parsed.data.brand.trim(),
      model: parsed.data.model.trim(),
      year: parsed.data.year ?? null,
      registration: parsed.data.registration?.trim() || null,
      color: parsed.data.color?.trim() || null,
    },
  });
  return NextResponse.json({ bike });
}
