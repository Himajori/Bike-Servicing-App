import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const prisma = await db();
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const customer = session.customerId
    ? await prisma.customer.findUnique({ where: { id: session.customerId } })
    : null;
  return NextResponse.json({
    user: { ...session, address: customer?.address ?? null },
  });
}
