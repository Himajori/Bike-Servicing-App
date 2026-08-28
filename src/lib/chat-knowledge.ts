export type ChatReply = {
  text: string;
  suggestions: string[];
};

const HOW_IT_WORKS = `How BikeService works:

1. Find a workshop or select a city. Austin is live on the map; other cities are waitlist.
2. Pick a service (oil change, tune-up, brakes, e-bike diagnostic) and tap Book. Prices are on the card.
3. Choose a date and how we reach you: doorstep visit or pickup & drop. Drop a pin on the map.
4. Enter your details and add the bike in Your bikes (garage).
5. Add a comment if you want, confirm, then track status until the stand is clear. Pay and review when it's done.

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
    text: `To book a repair: create an account or log in, add a bike under Bikes in the customer app, open Services, pick a job, then choose doorstep or pickup & drop, a time, and a map pin. You'll see the estimated price before you confirm.

Demo customer: alex@rideready.test / ride1234`,
  },
  {
    keys: ["doorstep", "pickup", "drop", "van", "travel"],
    text: `Two service types:

• Doorstep — a mechanic comes to your pin (travel fee is set in Admin → Settings, default $8).
• Pickup & drop — a van collects the bike and brings it back (default $18).

Bikes 10+ years old may add an age surcharge.`,
  },
  {
    keys: ["buy", "sell", "market", "listing", "upload", "for sale", "marketplace"],
    text: `Bikes in the header opens the marketplace (/market), not your garage.

• Search to buy — filter by brand, model, description, or city. Tap a card for the seller's contact.
• Upload a bike — photo, description, price, city, and your contact. Buyers can search it right away.

Your garage for servicing is still /bikes after you log in as a customer.`,
  },
  {
    keys: ["price", "cost", "fee", "quote", "oil", "tune"],
    text: `Catalog prices show on Services. The quote adds travel (doorstep or pickup) and a possible age fee. Admins change catalog prices under Admin → Services and travel fees under Settings.

Open Services after login to see live numbers.`,
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
    keys: ["city", "austin", "warsaw", "warszawa", "map", "workshop"],
    text: `Search a city on the home map. Austin is live with mechanics you can book. Polish and other cities are waitlist — you can still join from Register. Tap pins on the map for workshops and mobile mechanics.`,
  },
];

const OFF_TOPIC =
  "I only help with this BikeService app — booking repairs, the bike marketplace, how it works, and the demo accounts. Ask about those.";

function score(text: string, keys: string[]) {
  return keys.reduce((sum, key) => (text.includes(key) ? sum + key.length : sum), 0);
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
    return { text: OFF_TOPIC, suggestions: ["How it works", "Book a repair", "Buy or sell a bike"] };
  }

  return {
    text: best.text,
    suggestions: ["How it works", "Track a job", "Mechanic login"].filter(
      (item) => !text.includes(item.toLowerCase().slice(0, 8)),
    ),
  };
}
