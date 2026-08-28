import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function GET(request: Request) {
  const prisma = await db();
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const city = url.searchParams.get("city")?.trim() ?? "";
  const listings = await prisma.bikeListing.findMany({
    where: { status: "FOR_SALE" },
    orderBy: { createdAt: "desc" },
  });
  const filtered = listings.filter((item) => {
    const hay = `${item.brand} ${item.model} ${item.description} ${item.color ?? ""} ${item.city}`.toLowerCase();
    const matchesQ = !q || hay.includes(q);
    const matchesCity = !city || item.city.toLowerCase() === city.toLowerCase();
    return matchesQ && matchesCity;
  });
  return NextResponse.json({ listings: filtered });
}

export async function POST(request: Request) {
  const prisma = await db();
  const session = await getSession();
  const form = await request.formData();
  const brand = String(form.get("brand") ?? "").trim();
  const model = String(form.get("model") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const sellerName = String(form.get("sellerName") ?? session?.name ?? "").trim();
  const sellerEmail = String(form.get("sellerEmail") ?? session?.email ?? "").trim();
  const sellerPhone = String(form.get("sellerPhone") ?? session?.phone ?? "").trim() || null;
  const yearRaw = String(form.get("year") ?? "");
  const price = Number(form.get("price"));
  if (!brand || !model || description.length < 8 || !city || !sellerName || !sellerEmail || !price) {
    return NextResponse.json(
      { error: "Brand, model, city, price, seller, and a short description are required." },
      { status: 400 },
    );
  }

  let imageUrl: string | null = String(form.get("imageUrl") ?? "").trim() || null;
  const file = form.get("photo");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED.has(file.type) || file.size > 3_000_000) {
      return NextResponse.json({ error: "Photo must be a JPG, PNG, or WebP under 3 MB." }, { status: 400 });
    }
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const dir = path.join(process.cwd(), "public", "uploads", "bikes");
    await mkdir(dir, { recursive: true });
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    imageUrl = `/uploads/bikes/${filename}`;
  }

  const listing = await prisma.bikeListing.create({
    data: {
      brand,
      model,
      description,
      city,
      price,
      sellerName,
      sellerEmail,
      sellerPhone,
      year: yearRaw ? Number(yearRaw) : null,
      color: String(form.get("color") ?? "").trim() || null,
      imageUrl,
    },
  });
  return NextResponse.json({ listing });
}
