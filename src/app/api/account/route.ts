import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireCustomer, createSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export async function PATCH(request: Request) {
  const { session, error } = await requireCustomer();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Could not update the profile." }, { status: 400 });
  }
  const prisma = await db();
  const user = await prisma.user.update({
    where: { id: session.id },
    data: {
      name: parsed.data.name?.trim() ?? undefined,
      phone: parsed.data.phone?.trim() ?? undefined,
      customer: {
        update: {
          address: parsed.data.address?.trim() ?? undefined,
        },
      },
    },
    include: { customer: true },
  });
  await createSession({
    ...session,
    name: user.name,
    phone: user.phone,
  });
  return NextResponse.json({
    user: {
      ...session,
      name: user.name,
      phone: user.phone,
      address: user.customer?.address ?? null,
    },
  });
}
