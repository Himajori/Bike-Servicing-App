import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const prisma = await db();
  const services = await prisma.service.findMany({ orderBy: { basePrice: "asc" } });
  return NextResponse.json({ services });
}
