import type { AppContext } from "./app-context";
import { formatLek, formatMoney } from "./pricing";

export type Advice = {
  text: string;
  suggestions: string[];
};

const OFF_TOPIC =
  "I only help with this BikeService app — booking repairs, picking a workshop, the bike marketplace, accounts, and prices. Ask me one of those.";

const OFF_TOPIC_PATTERN =
  /weather|news|recipe|capital of|president|election|stock|crypto|football|movie|song|write me (an essay|a poem)|python code|homework/;

function money(amount: number, ctx: AppContext) {
  const euro = formatMoney(amount);
  return ctx.city.countryCode === "AL" ? `${euro} (${formatLek(amount)})` : euro;
}

function band(min: number, max: number, ctx: AppContext) {
  if (min === max) return money(min, ctx);
  return ctx.city.countryCode === "AL"
    ? `${formatMoney(min)}–${formatMoney(max)} (${formatLek(min)}–${formatLek(max)})`
    : `${formatMoney(min)}–${formatMoney(max)}`;
}

function shopLines(ctx: AppContext, limit = 3) {
  return ctx.shops
    .slice(0, limit)
    .map((shop) => {
      const contact = shop.phone ? ` · ${shop.phone}` : shop.website ? ` · ${shop.website}` : "";
      const kind = shop.kind === "repair_station" ? "public repair stand" : "bike shop";
      return `• ${shop.name} — ${shop.address} (${kind}, ${shop.km} km from the centre)${contact}`;
    })
    .join("\n");
}

function matchService(ctx: AppContext, text: string) {
  const words = [
    { keys: ["flat", "puncture", "tube", "tyre", "tire"], name: "Flat repair" },
    { keys: ["brake"], name: "Brake pads & setup" },
    { keys: ["gear", "shift", "derailleur", "index"], name: "Gear indexing" },
    { keys: ["wheel", "spoke", "true", "buckle"], name: "Wheel true" },
    { keys: ["chain", "drivetrain", "cassette", "lube"], name: "Chain & drivetrain clean" },
    { keys: ["full service", "overhaul", "everything"], name: "Full service" },
    { keys: ["tune", "service"], name: "Basic tune-up" },
    { keys: ["e-bike", "ebike", "battery", "motor"], name: "E-bike diagnostic" },
    { keys: ["bleed", "hydraulic"], name: "Hydraulic bleed" },
    { keys: ["safety", "check"], name: "Safety check" },
    { keys: ["emergency", "roadside", "stuck", "urgent"], name: "Emergency callout" },
  ];
  for (const word of words) {
    if (word.keys.some((key) => text.includes(key))) {
      const found = ctx.services.find((s) => s.name === word.name);
      if (found) return found;
    }
  }
  return null;
}

/** Deterministic, data-backed answers. Also the fallback when OpenAI is unavailable. */
export function adviseFromContext(question: string, ctx: AppContext): Advice {
  const text = question.toLowerCase().trim();

  if (!text) {
    return {
      text: "Ask me how to book a repair, which workshop to use, how to list a bike for sale, or how to create an account.",
      suggestions: ["Which shop should I use?", "How do I upload a bike?", "How do I create an account?"],
    };
  }

  if (OFF_TOPIC_PATTERN.test(text)) {
    return { text: OFF_TOPIC, suggestions: ["Which shop should I use?", "Prices", "How it works"] };
  }

  // Upload / sell a bike
  if (/(upload|list|sell|post|advertise).*(bike|bicycle)|how.*(sell|list)/.test(text)) {
    return {
      text: `To upload a bike for sale:

1. Open **Bikes** in the top menu (that is the marketplace at /market).
2. Switch to the **Sell a bike** tab.
3. Fill brand, model, year, colour, price, and your city — for example ${ctx.city.name}.
4. Write at least a short description: size, condition, what was serviced.
5. Add a photo (JPG, PNG, or WebP up to 3 MB) or paste a photo URL.
6. Leave your name, email, and phone so buyers can reach you, then press **List the bike**.

It appears in the buy search straight away. Bikes listed now run ${money(
        Math.min(...ctx.listings.map((l) => l.price)),
        ctx,
      )} to ${money(Math.max(...ctx.listings.map((l) => l.price)), ctx)}, so price yours in that range to sell quickly.`,
      suggestions: ["Where can I buy a bike?", "How do I create an account?", "Which shop should I use?"],
    };
  }

  // Buy a bike — decide for them
  if (/(buy|purchase|looking for|second hand|used|cheap).*(bike|bicycle)|marketplace|for sale/.test(text)) {
    const local = ctx.listings.filter((l) => l.city === ctx.city.name);
    const pool = local.length > 0 ? local : ctx.listings;
    const lines = pool
      .slice(0, 3)
      .map((l) => `• ${l.brand} ${l.model}${l.year ? ` (${l.year})` : ""} — ${money(l.price, ctx)}, ${l.city}. Contact ${l.seller} at ${l.contact}.`)
      .join("\n");
    return {
      text: `Open **Bikes** in the menu and search the marketplace. ${
        local.length > 0 ? `In ${ctx.city.name} right now:` : `Nothing listed in ${ctx.city.name} yet, so the closest options are:`
      }

${lines}

My pick: the cheapest one that already has service history in the description — then book a **Safety check** (${band(
        ctx.services.find((s) => s.name === "Safety check")?.priceMin ?? 8,
        ctx.services.find((s) => s.name === "Safety check")?.priceMax ?? 18,
        ctx,
      )}) before you ride it far.`,
      suggestions: ["How do I upload a bike?", "Which shop should I use?", "Book a repair"],
    };
  }

  // Create an account
  if (/(create|make|open|register|sign ?up|new).*(account|profile)|register/.test(text)) {
    return {
      text: `To create an account:

1. Press **Book a repair** or **Log in → Create one** on the landing page (that is /register).
2. Enter your full name, email, phone, and a password of at least 6 characters.
3. Home address is optional — add something like "Rruga Myslym Shyri, ${ctx.city.name}" so doorstep visits find you.
4. Submit and you land straight in the customer app at /home.

New accounts are customers. Mechanics and admins are created by the workshop. To try the demo instead, log in with alex@rideready.test and the password ride1234.`,
      suggestions: ["How do I book a repair?", "How do I upload a bike?", "Which shop should I use?"],
    };
  }

  // Which shop — the core decision question
  if (/(which|what|best|recommend|where|nearest|closest|good).*(shop|workshop|mechanic|repair|service|place|fix)/.test(text)) {
    const service = matchService(ctx, text);
    const top = ctx.shops[0];
    const detail = service
      ? `\n\nFor **${service.name}** expect ${band(service.priceMin, service.priceMax, ctx)} and about ${service.durationMin} minutes.`
      : "";
    if (!top) {
      return {
        text: `I have no mapped shops for ${ctx.city.name} yet. Search another city on the landing map, or book doorstep service and a mechanic comes to your pin.${detail}`,
        suggestions: ["Prices", "How do I book a repair?"],
      };
    }
    const reason = top.phone
      ? `it is a named shop ${top.km} km from the centre with a phone number, so call ${top.phone} to check they have the part`
      : top.website
        ? `it is a named shop ${top.km} km from the centre and lists opening details at ${top.website}`
        : `it is the closest mapped shop at ${top.km} km from the centre`;
    return {
      text: `Options on the ${ctx.city.name} map (OpenStreetMap data), best first:

${shopLines(ctx)}

My pick: **${top.name}** — ${reason}.${detail}

If you would rather not ride there, book **doorstep** service (${money(ctx.travel.doorstep, ctx)} travel) or **pickup & drop** (${money(ctx.travel.pickup, ctx)}).`,
      suggestions: ["Prices", "How do I book a repair?", "Where can I buy a bike?"],
    };
  }

  // Price of a specific job
  const service = matchService(ctx, text);
  if (service && /(price|cost|how much|charge|fee|quote|€|eur|lek)/.test(text)) {
    return {
      text: `**${service.name}** in ${ctx.city.name}: ${band(service.priceMin, service.priceMax, ctx)}, typically ${money(
        service.typical,
        ctx,
      )}, about ${service.durationMin} minutes.

The low end is a simple job at a street shop; the high end is worn or seized parts. Doorstep adds ${money(
        ctx.travel.doorstep,
        ctx,
      )} and pickup & drop adds ${money(ctx.travel.pickup, ctx)}. Bikes over 10 years old can add ${money(
        ctx.travel.ageSurcharge,
        ctx,
      )}.`,
      suggestions: ["Which shop should I use?", "Show the full price list", "How do I book a repair?"],
    };
  }

  // Whole price list
  if (/(price|cost|how much|cheap|expensive|list|rate)/.test(text)) {
    const cheapest = ctx.services[0];
    const dearest = ctx.services[ctx.services.length - 1];
    const lines = ctx.services
      .slice(0, 6)
      .map((s) => `• ${s.name} — ${band(s.priceMin, s.priceMax, ctx)}`)
      .join("\n");
    return {
      text: `Prices in ${ctx.city.name}, lowest to highest:

${lines}

The cheapest job is **${cheapest.name}** from ${money(cheapest.priceMin, ctx)}; the biggest is **${dearest.name}** up to ${money(
        dearest.priceMax,
        ctx,
      )}. Bands come from Albanian shop rates and are scaled ${ctx.city.priceIndex.toFixed(2)}× for ${ctx.city.name}. Travel is added at booking.`,
      suggestions: ["Which shop should I use?", "How do I book a repair?", "Where can I buy a bike?"],
    };
  }

  // Booking
  if (/(book|booking|appointment|slot|schedule|repair|fix|doorstep|pickup)/.test(text)) {
    return {
      text: `To book a repair:

1. Log in (or register) and add your bike under **Bikes** in the customer app.
2. Open **Services** and pick a job — they are sorted cheapest first.
3. Choose **doorstep** (${money(ctx.travel.doorstep, ctx)} travel) or **pickup & drop** (${money(ctx.travel.pickup, ctx)}).
4. Pick a date and time, then press **Use my GPS** or tap the map to drop a pin.
5. Add a note about the fault, check the estimate, and confirm.

Then track it under **Jobs**: requested → assigned → on the way → in the stand → ready → completed. You pay and leave a review at the end.`,
      suggestions: ["Which shop should I use?", "Prices", "How do I create an account?"],
    };
  }

  // Map / GPS / cities
  if (/(map|gps|location|city|near me|tirana|albania|find)/.test(text)) {
    return {
      text: `The landing map is OpenStreetMap. Press **Use my GPS** and it snaps to your nearest service city, or type a city — ${ctx.cities
        .slice(0, 6)
        .join(", ")} and more.

${ctx.city.name} currently shows ${ctx.shops.length > 0 ? "these top pins:" : "no mapped shops yet."}
${ctx.shops.length > 0 ? shopLines(ctx) : ""}

Prices follow the city you select, so switching the map also switches the price list.`,
      suggestions: ["Which shop should I use?", "Prices", "How it works"],
    };
  }

  // Login / demo accounts
  if (/(log ?in|sign ?in|password|demo|account|forgot)/.test(text)) {
    return {
      text: `Demo password for every role: **ride1234**

• Customer — alex@rideready.test → /home
• Mechanic — maya@rideready.test → /mechanic
• Admin — admin@rideready.test → /admin

Register creates a customer account. Mechanics see and accept jobs; admins edit prices, inventory, and settings.`,
      suggestions: ["How do I create an account?", "How do I book a repair?", "Which shop should I use?"],
    };
  }

  // How it works
  if (/(how it works|how does|what is this|what can you|help|start|guide)/.test(text)) {
    return {
      text: `BikeService, in short:

1. Share GPS or pick a city — ${ctx.city.name} is showing now.
2. Read the price list, sorted lowest to highest (from ${money(ctx.services[0].priceMin, ctx)}).
3. Pick a job and book doorstep or pickup & drop with a map pin.
4. Track status, pay, and review when the bike is back.

You can also buy or sell a bike under **Bikes** in the menu.`,
      suggestions: ["Which shop should I use?", "How do I upload a bike?", "How do I create an account?"],
    };
  }

  return {
    text: OFF_TOPIC,
    suggestions: ["Which shop should I use?", "How do I upload a bike?", "How do I create an account?"],
  };
}
