import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, toSessionUser, verifyPassword } from "@/lib/auth";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const prisma = await db();
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase().trim() },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return NextResponse.json({ error: "Those details do not match an account." }, { status: 401 });
  }

  const session = await toSessionUser(user.id);
  if (!session) {
    return NextResponse.json({ error: "Could not open a session." }, { status: 500 });
  }
  await createSession(session);
  return NextResponse.json({ ok: true, role: session.role });
}
