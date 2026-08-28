import type { AppContext } from "./app-context";
import { formatLek, formatMoney } from "./pricing";

export type Advice = {
  text: string;
  suggestions: string[];
};

export type Intent =
  | "sell"
  | "buy"
  | "account"
  | "login"
  | "shop"
  | "price"
  | "book"
  | "map"
  | "track"
  | "how"
  | "greeting"
  | "unknown";

/** Phrases that mean the question is not about this app at all. */
const OFF_TOPIC_PATTERN =
  /\b(weather|forecast|news|recipe|capital of|president|election|stock market|crypto|bitcoin|football|movie|lyrics|homework|essay|poem|translate|javascript|python|sql query)\b/;

const INTENTS: { intent: Intent; phrases: string[] }[] = [
  {
    intent: "sell",
    phrases: [
      "upload a bike",
      "upload my bike",
      "upload bike",
      "upload",
      "sell my bike",
      "sell my bicycle",
      "sell a bike",
      "sell bike",
      "sell",
      "list my bike",
      "list a bike",
      "listing",
      "list it",
      "put my bike",
      "put a bike",
      "post my bike",
      "post a bike",
      "add my bike",
      "add a bike",
      "add bike",
      "share my bike",
      "advertise",
      "publish",
      "for sale",
      "get rid of my bike",
      "sell it",
    ],
  },
  {
    intent: "buy",
    phrases: [
      "buy a bike",
      "buy bike",
      "buy",
      "purchase",
      "second hand",
      "secondhand",
      "used bike",
      "cheap bike",
      "marketplace",
      "bikes for sale",
      "shopping for a bike",
      "find a bike",
      "get a bike",
    ],
  },
  {
    intent: "account",
    phrases: [
      "create an account",
      "create account",
      "make an account",
      "open an account",
      "new account",
      "register",
      "registration",
      "sign up",
      "signup",
      "join",
    ],
  },
  {
    intent: "login",
    phrases: ["log in", "login", "sign in", "signin", "password", "demo account", "forgot", "credentials"],
  },
  {
    intent: "shop",
    phrases: [
      "which shop",
      "what shop",
      "best shop",
      "which workshop",
      "which mechanic",
      "recommend a shop",
      "recommend",
      "nearest shop",
      "nearest",
      "closest",
      "near me",
      "where should i go",
      "where can i fix",
      "where to repair",
      "good shop",
      "workshop",
      "bike shop",
      "repair shop",
    ],
  },
  {
    intent: "price",
    phrases: [
      "how much",
      "price",
      "prices",
      "price list",
      "cost",
      "costs",
      "how expensive",
      "cheapest",
      "rate",
      "fee",
      "quote",
      "lek",
      "euro",
    ],
  },
  {
    intent: "book",
    phrases: [
      "book a repair",
      "book",
      "booking",
      "appointment",
      "schedule",
      "reserve",
      "doorstep",
      "pickup",
      "pick up",
      "repair my bike",
      "fix my bike",
      "service my bike",
      "my brakes",
      "my chain",
      "my gears",
      "flat tyre",
      "flat tire",
      "puncture",
    ],
  },
  {
    intent: "map",
    phrases: ["map", "gps", "location", "city", "cities", "tirana", "albania", "shkoder", "shkodër", "durres", "durrës"],
  },
  {
    intent: "track",
    phrases: ["track", "status", "where is my", "pay", "payment", "review", "rate the mechanic", "invoice"],
  },
  {
    intent: "how",
    phrases: [
      "how it works",
      "how does it work",
      "how do i start",
      "what is this",
      "what can you do",
      "what do you do",
      "help",
      "guide",
      "explain",
      "get started",
    ],
  },
  {
    intent: "greeting",
    phrases: ["hello", "hi ", "hey", "good morning", "good evening", "thanks", "thank you"],
  },
];

/** Longer phrases win, so "sell my bike" beats a bare "bike". */
function scorePhrase(phrase: string) {
  return phrase.trim().split(/\s+/).length * 3 + 1;
}

/** Fold synonyms and slang so one phrase list covers many ways of asking. */
export function normalizeQuestion(question: string) {
  const body = question
    .toLowerCase()
    .replace(/bicycles?/g, "bike")
    .replace(/\bcycles?\b/g, "bike")
    .replace(/\bwanna\b/g, "want to")
    .replace(/\bgonna\b/g, "going to")
    .replace(/\bhowto\b/g, "how to")
    .replace(/[^\w\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return ` ${body} `;
}

export function classify(question: string): { intent: Intent; score: number } {
  const text = normalizeQuestion(question);
  const totals = new Map<Intent, number>();

  for (const group of INTENTS) {
    let score = 0;
    for (const phrase of group.phrases) {
      if (text.includes(phrase)) score += scorePhrase(phrase);
    }
    if (score > 0) totals.set(group.intent, score);
  }

  // "add my bike for sale" is selling, not shopping.
  const mine = /\b(my|mine)\b/.test(text);
  if (mine && totals.has("sell")) totals.set("sell", (totals.get("sell") ?? 0) + 6);
  if (/\b(want to buy|looking to buy|buy|purchase)\b/.test(text)) {
    totals.set("buy", (totals.get("buy") ?? 0) + 6);
  }

  let best: Intent = "unknown";
  let bestScore = 0;
  for (const [intent, score] of totals) {
    if (score > bestScore) {
      best = intent;
      bestScore = score;
    }
  }
  return { intent: best, score: bestScore };
}

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

function priceRangeOfListings(ctx: AppContext) {
  if (ctx.listings.length === 0) return null;
  const prices = ctx.listings.map((l) => l.price);
  return { low: Math.min(...prices), high: Math.max(...prices) };
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

const MENU_SUGGESTIONS = [
  "Which shop should I use?",
  "How do I upload a bike?",
  "How do I create an account?",
];

function menu(ctx: AppContext, lead: string): Advice {
  return {
    text: `${lead}

• **Book a repair** — pick a job, then doorstep or pickup & drop.
• **Find a workshop** — ${ctx.shops.length} shops mapped around ${ctx.city.name}.
• **Prices** — from ${money(ctx.services[0].priceMin, ctx)} for a ${ctx.services[0].name.toLowerCase()}.
• **Buy or sell a bike** — the Bikes menu is the marketplace.
• **Accounts** — registering, logging in, and the demo logins.

Ask me any of those in your own words.`,
    suggestions: MENU_SUGGESTIONS,
  };
}

/** Deterministic, data-backed answers. Also the fallback when OpenAI is unavailable. */
export function adviseFromContext(question: string, ctx: AppContext): Advice {
  const text = question.toLowerCase().trim();

  if (!text) return menu(ctx, "Here is what I can do inside BikeService:");

  const { intent, score } = classify(text);

  // Only refuse when nothing in the app matched and the topic is clearly elsewhere.
  if (intent === "unknown" || score === 0) {
    if (OFF_TOPIC_PATTERN.test(text)) {
      return {
        text: "That one is outside this app. I cover booking repairs, choosing a workshop, prices, the bike marketplace, and accounts.",
        suggestions: MENU_SUGGESTIONS,
      };
    }
    return menu(ctx, "I did not catch which part of the app you meant. Here is what I can help with:");
  }

  switch (intent) {
    case "greeting":
      return menu(ctx, "Hi. I am the BikeService assistant — here is what I can do:");

    case "sell": {
      const range = priceRangeOfListings(ctx);
      const pricing = range
        ? `\n\nBikes listed right now run ${money(range.low, ctx)} to ${money(range.high, ctx)}, so price yours in that range to sell quickly.`
        : "";
      return {
        text: `To upload a bike for sale:

1. Open **Bikes** in the top menu — that is the marketplace at /market.
2. Switch to the **Sell a bike** tab.
3. Fill brand, model, year, colour, price, and your city — for example ${ctx.city.name}.
4. Write a short description: size, condition, and what was serviced.
5. Add a photo (JPG, PNG, or WebP up to 3 MB) or paste a photo URL.
6. Leave your name, email, and phone, then press **List the bike**.

It shows in the buy search straight away.${pricing}`,
        suggestions: ["Where can I buy a bike?", "How do I create an account?", "Which shop should I use?"],
      };
    }

    case "buy": {
      if (ctx.listings.length === 0) {
        return {
          text: `Nothing is listed in the marketplace yet. Open **Bikes** in the top menu to check again, or list your own under the **Sell a bike** tab.`,
          suggestions: ["How do I upload a bike?", "Which shop should I use?", "Prices"],
        };
      }
      const local = ctx.listings.filter((l) => l.city === ctx.city.name);
      const pool = local.length > 0 ? local : ctx.listings;
      const lines = pool
        .slice(0, 3)
        .map(
          (l) =>
            `• ${l.brand} ${l.model}${l.year ? ` (${l.year})` : ""} — ${money(l.price, ctx)}, ${l.city}. Contact ${l.seller} at ${l.contact}.`,
        )
        .join("\n");
      const safety = ctx.services.find((s) => s.name === "Safety check");
      return {
        text: `Open **Bikes** in the menu and search the marketplace. ${
          local.length > 0
            ? `In ${ctx.city.name} right now:`
            : `Nothing in ${ctx.city.name} yet, so the closest options are:`
        }

${lines}

My pick: the cheapest one whose description mentions recent service — then book a **Safety check**${
          safety ? ` (${band(safety.priceMin, safety.priceMax, ctx)})` : ""
        } before you ride it far.`,
        suggestions: ["How do I upload a bike?", "Which shop should I use?", "Book a repair"],
      };
    }

    case "account":
      return {
        text: `To create an account:

1. Press **Book a repair** on the landing page, or **Log in → Create one** (that is /register).
2. Enter your full name, email, phone, and a password of at least 6 characters.
3. Home address is optional — add something like "Rruga Myslym Shyri, ${ctx.city.name}" so doorstep visits find you.
4. Submit, and you land in the customer app at /home.

New accounts are customers. Mechanics and admins are created by the workshop. To try the demo instead, log in as alex@rideready.test with the password ride1234.`,
        suggestions: ["How do I book a repair?", "How do I upload a bike?", "Which shop should I use?"],
      };

    case "login":
      return {
        text: `Demo password for every role: **ride1234**

• Customer — alex@rideready.test → /home
• Mechanic — maya@rideready.test → /mechanic
• Admin — admin@rideready.test → /admin

Register creates a customer account. Mechanics accept and update jobs; admins edit prices, inventory, and settings.`,
        suggestions: ["How do I create an account?", "How do I book a repair?", "Which shop should I use?"],
      };

    case "shop": {
      const service = matchService(ctx, text);
      const top = ctx.shops[0];
      const detail = service
        ? `\n\nFor **${service.name}** expect ${band(service.priceMin, service.priceMax, ctx)} and about ${service.durationMin} minutes.`
        : "";
      if (!top) {
        return {
          text: `I have no mapped shops for ${ctx.city.name} yet. Search another city on the landing map, or book doorstep service so a mechanic comes to your pin.${detail}`,
          suggestions: ["Prices", "How do I book a repair?", "How do I upload a bike?"],
        };
      }
      const reason = top.phone
        ? `it is a named shop ${top.km} km from the centre with a phone number, so call ${top.phone} to check they have the part`
        : top.website
          ? `it is a named shop ${top.km} km from the centre and lists details at ${top.website}`
          : `it is the closest mapped shop at ${top.km} km from the centre`;
      return {
        text: `Options on the ${ctx.city.name} map (OpenStreetMap data), best first:

${shopLines(ctx)}

My pick: **${top.name}** — ${reason}.${detail}

If you would rather not ride there, book **doorstep** service (${money(ctx.travel.doorstep, ctx)} travel) or **pickup & drop** (${money(ctx.travel.pickup, ctx)}).`,
        suggestions: ["Prices", "How do I book a repair?", "Where can I buy a bike?"],
      };
    }

    case "price": {
      const service = matchService(ctx, text);
      if (service) {
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
        )}. Bands come from Albanian shop rates, scaled ${ctx.city.priceIndex.toFixed(2)}× for ${ctx.city.name}. Travel is added at booking.`,
        suggestions: ["Which shop should I use?", "How do I book a repair?", "Where can I buy a bike?"],
      };
    }

    case "book": {
      const service = matchService(ctx, text);
      const hint = service
        ? `\n\nFor your problem that is **${service.name}** — ${band(service.priceMin, service.priceMax, ctx)}, about ${service.durationMin} minutes.`
        : "";
      return {
        text: `To book a repair:

1. Log in or register, then add your bike under **Bikes** in the customer app.
2. Open **Services** and pick a job — they are sorted cheapest first.
3. Choose **doorstep** (${money(ctx.travel.doorstep, ctx)} travel) or **pickup & drop** (${money(ctx.travel.pickup, ctx)}).
4. Pick a date and time, then press **Use my GPS** or tap the map to drop a pin.
5. Add a note about the fault, check the estimate, and confirm.

Track it under **Jobs**: requested → assigned → on the way → in the stand → ready → completed.${hint}`,
        suggestions: ["Which shop should I use?", "Prices", "How do I create an account?"],
      };
    }

    case "map":
      return {
        text: `The landing map is OpenStreetMap. Press **Use my GPS** and it snaps to your nearest service city, or type a city — ${ctx.cities
          .slice(0, 6)
          .join(", ")} and more.

${ctx.shops.length > 0 ? `Top pins in ${ctx.city.name}:\n${shopLines(ctx)}` : `No mapped shops in ${ctx.city.name} yet.`}

Prices follow the city you select, so switching the map switches the price list too.`,
        suggestions: ["Which shop should I use?", "Prices", "How do I book a repair?"],
      };

    case "track":
      return {
        text: `Open **Jobs** in the customer app to follow a booking: requested → confirmed → assigned → on the way → in the stand → ready → completed.

When it is done, open the job to pay (card, UPI, or wallet — demo only) and leave a star review for the mechanic. Mechanics update the status from their own **Jobs** screen.`,
        suggestions: ["How do I book a repair?", "Prices", "Which shop should I use?"],
      };

    case "how":
    default:
      return {
        text: `BikeService, in short:

1. Share GPS or pick a city — ${ctx.city.name} is showing now.
2. Read the price list, sorted lowest to highest (from ${money(ctx.services[0].priceMin, ctx)}).
3. Pick a job and book doorstep or pickup & drop with a map pin.
4. Track the status, pay, and review when the bike is back.

You can also buy or sell a bike under **Bikes** in the menu.`,
        suggestions: MENU_SUGGESTIONS,
      };
  }
}
