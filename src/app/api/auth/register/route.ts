import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function POST(request: Request) {
  const prisma = await db();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check name, email, and a password of at least 6 characters." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase().trim();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name.trim(),
      password: await hashPassword(parsed.data.password),
      phone: parsed.data.phone?.trim() || null,
      role: "CUSTOMER",
      customer: {
        create: {
          address: parsed.data.address?.trim() || null,
          city: "Austin",
          lat: 30.2643,
          lng: -97.7312,
        },
      },
    },
    include: { customer: true },
  });

  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    customerId: user.customer!.id,
    mechanicId: null,
    adminId: null,
  });

  return NextResponse.json({ ok: true, role: user.role });
}
