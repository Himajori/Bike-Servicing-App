import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const prisma = await db();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, mechanic: true, admin: true },
  });
  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
    })),
  });
}
