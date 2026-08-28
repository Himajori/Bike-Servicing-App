import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";

const schema = z.object({
  workshopName: z.string().min(2),
  supportEmail: z.string().email(),
  doorstepTravel: z.number().min(0),
  pickupTravel: z.number().min(0),
  ageSurcharge: z.number().min(0),
});

export async function GET() {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  return NextResponse.json({ settings: getSettings() });
}

export async function PATCH(request: Request) {
  const { session, error } = await requireAdmin();
  if (!session) return NextResponse.json({ error }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check workshop name, email, and fees." }, { status: 400 });
  saveSettings(parsed.data);
  return NextResponse.json({ settings: getSettings() });
}
