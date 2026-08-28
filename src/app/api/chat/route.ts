import { NextResponse } from "next/server";
import { z } from "zod";
import { answerBikeService } from "@/lib/chat-knowledge";

const schema = z.object({ message: z.string().max(500) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Send a short question about BikeService." }, { status: 400 });
  }
  return NextResponse.json(answerBikeService(parsed.data.message));
}
