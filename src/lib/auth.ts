import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "./db";
import { prisma } from "./prisma";

const COOKIE = "rideready_session";
const SECRET = process.env.AUTH_SECRET ?? "rideready-local-dev-secret";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: Role;
  customerId: string | null;
  mechanicId: string | null;
  adminId: string | null;
};

function sign(value: string) {
  return createHmac("sha256", SECRET).update(value).digest("hex");
}

function encode(payload: SessionUser) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string): SessionUser | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const jar = await cookies();
  jar.set(COOKIE, encode(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;
  return decode(raw);
}

export async function requireCustomer() {
  await db();
  const session = await getSession();
  if (!session || session.role !== "CUSTOMER" || !session.customerId) {
    return { session: null as SessionUser | null, error: "Sign in as a customer to continue." };
  }
  return { session, error: null };
}

export async function requireMechanic() {
  await db();
  const session = await getSession();
  if (!session || session.role !== "MECHANIC" || !session.mechanicId) {
    return { session: null as SessionUser | null, error: "Sign in as a mechanic to continue." };
  }
  return { session, error: null };
}

export async function requireAdmin() {
  await db();
  const session = await getSession();
  if (!session || session.role !== "ADMIN" || !session.adminId) {
    return { session: null as SessionUser | null, error: "Sign in as an admin to continue." };
  }
  return { session, error: null };
}

export async function toSessionUser(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { customer: true, mechanic: true, admin: true },
  });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    customerId: user.customer?.id ?? null,
    mechanicId: user.mechanic?.id ?? null,
    adminId: user.admin?.id ?? null,
  };
}
