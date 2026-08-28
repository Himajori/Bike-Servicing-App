import type { AppContext } from "./app-context";
import { formatLek, formatMoney } from "./pricing";

export type ChatTurn = { role: "user" | "assistant"; content: string };

const ENDPOINT = process.env.OPENAI_BASE_URL
  ? `${process.env.OPENAI_BASE_URL.replace(/\/$/, "")}/chat/completions`
  : "https://api.openai.com/v1/chat/completions";

export function hasOpenAI() {
  return Boolean(process.env.OPENAI_API_KEY);
}

function contextBlock(ctx: AppContext) {
  const money = (n: number) =>
    ctx.city.countryCode === "AL" ? `${formatMoney(n)} / ${formatLek(n)}` : formatMoney(n);

  const services = ctx.services
    .map((s) => `- ${s.name} (${s.category}): ${money(s.priceMin)} to ${money(s.priceMax)}, typical ${money(s.typical)}, ${s.durationMin} min`)
    .join("\n");

  const shops = ctx.shops
    .map(
      (s) =>
        `- ${s.name} — ${s.address}; ${s.kind === "repair_station" ? "public repair stand" : "bike shop"}; ${s.km} km from centre${
          s.phone ? `; phone ${s.phone}` : ""
        }${s.website ? `; ${s.website}` : ""}`,
    )
    .join("\n");

  const listings = ctx.listings
    .map(
      (l) =>
        `- ${l.brand} ${l.model}${l.year ? ` ${l.year}` : ""} — ${money(l.price)} in ${l.city}; viewing spot ${
          l.meetingPoint ?? "not set, city centre"
        }; seller ${l.seller} (${l.contact}); ${l.description}`,
    )
    .join("\n");

  return `SELECTED CITY: ${ctx.city.name}, ${ctx.city.country} (price index ${ctx.city.priceIndex}${
    ctx.city.countryCode === "AL" ? ", show euro and lek" : ", euro only"
  })

SERVICE CATALOG (lowest to highest):
${services}

TRAVEL FEES: doorstep ${money(ctx.travel.doorstep)}, pickup & drop ${money(ctx.travel.pickup)}, bikes over 10 years ${money(ctx.travel.ageSurcharge)}

NEARBY SHOPS FROM OPENSTREETMAP (${ctx.city.name}):
${shops || "none mapped yet"}

BIKES FOR SALE IN THE APP MARKETPLACE:
${listings || "none listed yet"}

SERVICE CITIES: ${ctx.cities.join(", ")}`;
}

const SYSTEM = `You are the assistant inside the BikeService web app. You help with this app only.

You may answer about: booking a repair (doorstep or pickup & drop), the service catalog and prices, choosing a workshop or bike shop from the map, the bike marketplace (buying and listing a bike), creating an account and logging in, tracking a job, paying, reviewing, and the mechanic and admin areas.

Refuse anything else — general knowledge, news, code, other companies — with one short sentence telling the user what you do cover.

Rules:
- Use only the app data below. Never invent shops, prices, or listings.
- Be decisive. When asked which shop or which bike, recommend one by name and say why in one line.
- Keep answers under 140 words. Use short numbered or bulleted steps for how-to questions.
- Prices come from the data below; do not convert currencies yourself.
- App facts: the marketplace is "Bikes" in the top menu (/market) with Buy and Sell tabs; photos are JPG/PNG/WebP up to 3 MB; registering at /register creates a customer account; the demo password for alex@rideready.test, maya@rideready.test, and admin@rideready.test is ride1234; the landing map has a "Use my GPS" button.`;

export async function askOpenAI(
  question: string,
  ctx: AppContext,
  history: ChatTurn[] = [],
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "system", content: contextBlock(ctx) },
          ...history.slice(-6),
          { role: "user", content: question },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content?.trim();
    return text && text.length > 0 ? text : null;
  } catch {
    return null;
  }
}
