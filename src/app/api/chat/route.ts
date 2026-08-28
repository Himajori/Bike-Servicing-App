import { NextResponse } from "next/server";
import { z } from "zod";
import { adviseFromContext } from "@/lib/advisor";
import { buildAppContext } from "@/lib/app-context";
import { askOpenAI, hasOpenAI } from "@/lib/openai";

const schema = z.object({
  message: z.string().max(500),
  city: z.string().max(40).optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(1500) }))
    .max(8)
    .optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Send a short question about BikeService." }, { status: 400 });
  }

  const ctx = await buildAppContext(parsed.data.city);
  const fallback = adviseFromContext(parsed.data.message, ctx);

  const answer = await askOpenAI(parsed.data.message, ctx, parsed.data.history ?? []);

  return NextResponse.json({
    text: answer ?? fallback.text,
    suggestions: fallback.suggestions,
    source: answer ? "openai" : hasOpenAI() ? "app-advisor (OpenAI unavailable)" : "app-advisor",
    city: ctx.city.name,
  });
}
