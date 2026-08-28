export type ChatReply = {
  text: string;
  suggestions: string[];
};

const HOW_IT_WORKS = `How BikeService works:

1. Share GPS or search a city. Albania is the home map (Tirana, Shkodër, Durrës, Vlorë…). Other countries load the same OpenStreetMap bicycle-shop layer.
2. Read the price list — jobs are sorted lowest to highest. Bands come from Albanian shop rates (flats from €5 / 500 Lek, full service from €25). Other cities apply a local index.
3. Pick a service and tap Book. Choose doorstep or pickup & drop, a time, and a GPS pin.
4. Add the bike in Your bikes (garage), confirm, then track status until the stand is clear. Pay and review when it's done.

Open Book a repair, or log in as alex@rideready.test / ride1234 to try a booking.`;

const TOPICS: { keys: string[]; text: string }[] = [
  {
    keys: [
      "how it works",
      "how does it work",
      "how do i",
      "steps",
      "guide",
      "tutorial",
      "get started",
      "start",
    ],
    text: HOW_IT_WORKS,
  },
  {
    keys: ["book", "booking", "repair", "service", "appointment", "slot"],
    text: `To book a repair: create an account or log in, add a bike under Bikes in the customer app, open Services, pick a job, then choose doorstep or pickup & drop, a time, and a GPS pin. You'll see the estimated price before you confirm.

Demo customer: alex@rideready.test / ride1234`,
  },
  {
    keys: ["doorstep", "pickup", "drop", "van", "travel"],
    text: `Two service types:

• Doorstep — a mechanic comes to your GPS pin (travel fee is set in Admin → Settings, default €4 in Albania).
• Pickup & drop — a van collects the bike and brings it back (default €9).

Bikes 10+ years old may add an age surcharge.`,
  },
  {
    keys: ["buy", "sell", "market", "listing", "upload", "for sale", "marketplace"],
    text: `Bikes in the header opens the marketplace (/market), not your garage.

• Search to buy — filter by brand, model, description, or city (try Tirana). Tap a card for the seller's contact.
• Upload a bike — photo, description, price, city, and your contact. Buyers can search it right away.

Your garage for servicing is still /bikes after you log in as a customer.`,
  },
  {
    keys: ["price", "cost", "fee", "quote", "lek", "euro", "all"],
    text: `Catalog prices are euro bands from Albanian shops, sorted low to high. A flat is €5–€12; a full service is €25–€80. Tirana also shows lek (about 100 Lek / €1). Other countries multiply by a local index (Italy and the US sit higher).

The booking quote adds travel and a possible age fee. Admins change bands under Admin → Services.`,
  },
  {
    keys: ["mechanic", "job", "accept", "earnings"],
    text: `Mechanics log in at Mechanic zone. Demo: maya@rideready.test / ride1234.

They see New / Accepted / Completed jobs, accept or reject, update status (on the way, in the stand), log parts from inventory, and check Earnings.`,
  },
  {
    keys: ["admin", "dashboard", "inventory", "settings"],
    text: `Admins use /admin. Demo: admin@rideready.test / ride1234.

Sidebar: Dashboard, Users, Mechanics, Bookings, Services, Inventory, Payments, Reviews, Reports, Settings.`,
  },
  {
    keys: ["login", "account", "password", "demo", "register"],
    text: `Password for all demo accounts: ride1234

• Customer alex@rideready.test → /home
• Mechanic maya@rideready.test → /mechanic
• Admin admin@rideready.test → /admin

Register creates a customer account.`,
  },
  {
    keys: ["track", "status", "payment", "pay", "review"],
    text: `Open Jobs in the customer app to track a booking: requested → assigned → on the way → in the stand → ready → completed.

After the job you can pay (card, UPI, or wallet — demo only) and leave a star review.`,
  },
  {
    keys: ["city", "tirana", "albania", "gps", "map", "workshop", "shkoder", "shkodër", "osm"],
    text: `Tap Use my GPS or search a city. The map loads OpenStreetMap bicycle shops and repair stands — about 99 in Albania (Bike Doctor, Bike Point, Biçiklist in Shkodër, Ani's in Berat…). Other countries use the same Overpass API inside that city's GPS box.`,
  },
];

const OFF_TOPIC =
  "I only help with this BikeService app — booking repairs, the bike marketplace, how it works, and the demo accounts. Ask about those.";

function score(text: string, keys: string[]) {
  return keys.reduce((sum, key) => (text.includes(key) ? sum + key.length : 0 + sum), 0);
}

export function answerBikeService(question: string): ChatReply {
  const text = question.toLowerCase().trim();
  if (!text) {
    return {
      text: "Ask me how BikeService works, how to book, or how to buy/sell a bike. I only answer questions about this program.",
      suggestions: ["How it works", "Book a repair", "Buy or sell a bike"],
    };
  }

  if (
    /weather|news|recipe|capital of|who is the president|joke|python code|write me an essay/.test(
      text,
    )
  ) {
    return { text: OFF_TOPIC, suggestions: ["How it works", "Book a repair"] };
  }

  let best = { n: 0, text: "" };
  for (const topic of TOPICS) {
    const n = score(text, topic.keys);
    if (n > best.n) best = { n, text: topic.text };
  }

  if (best.n === 0) {
    return { text: OFF_TOPIC, suggestions: ["How it works", "Book a repair", "Prices"] };
  }

  return {
    text: best.text,
    suggestions: ["How it works", "Prices", "Find a workshop"],
  };
}
