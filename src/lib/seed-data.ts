import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { CITY } from "./maps";
import { SERVICE_CATALOG, SERVICE_RENAMES } from "./catalog";

const DEMO_PASSWORD = "ride1234";

export async function seedIfEmpty() {
  const existing = await prisma.service.count();
  if (existing === 0) await seedDatabase();
  else await refreshCatalog();
  if ((await prisma.inventoryItem.count()) === 0) {
    await prisma.inventoryItem.createMany({
      data: [
        { name: "Inner tube 700x28", sku: "TUBE-700", quantity: 40, unitPrice: 4 },
        { name: "Brake pads (pair)", sku: "BRK-PAD", quantity: 16, unitPrice: 12 },
        { name: "Chain lube", sku: "LUBE-01", quantity: 18, unitPrice: 6 },
        { name: "Shift cable", sku: "CABLE-01", quantity: 22, unitPrice: 5 },
      ],
    });
  }
  await ensureAlbaniaListings();
  await relocateDemoToTirana();
}

async function refreshCatalog() {
  const rows = await prisma.service.findMany();
  for (const row of rows) {
    const renamed = SERVICE_RENAMES[row.name];
    if (renamed && renamed !== row.name) {
      await prisma.service.update({ where: { id: row.id }, data: { name: renamed } });
      row.name = renamed;
    }
  }
  const latest = await prisma.service.findMany();
  for (const item of SERVICE_CATALOG) {
    const match = latest.find((row) => row.name === item.name);
    if (match) {
      if (
        match.description !== item.description ||
        match.category !== item.category ||
        match.basePrice !== item.basePrice ||
        match.priceMin !== item.priceMin ||
        match.priceMax !== item.priceMax ||
        match.durationMin !== item.durationMin
      ) {
        await prisma.service.update({
          where: { id: match.id },
          data: {
            description: item.description,
            category: item.category,
            basePrice: item.basePrice,
            priceMin: item.priceMin,
            priceMax: item.priceMax,
            durationMin: item.durationMin,
          },
        });
      }
    } else {
      await prisma.service.create({ data: item });
    }
  }
}

async function ensureAlbaniaListings() {
  const existing = await prisma.bikeListing.findMany({
    select: { brand: true, model: true, city: true },
  });
  const seen = new Set(existing.map((row) => `${row.brand}|${row.model}|${row.city}`));
  const missing = albaniaListings().filter((row) => !seen.has(`${row.brand}|${row.model}|${row.city}`));
  if (missing.length > 0) await prisma.bikeListing.createMany({ data: missing });
}

async function relocateDemoToTirana() {
  const alex = await prisma.customer.findFirst({
    where: { user: { email: "alex@rideready.test" } },
  });
  if (alex && (alex.city === "Austin" || (alex.lat && alex.lat < 35))) {
    await prisma.customer.update({
      where: { id: alex.id },
      data: {
        address: "Rruga Myslym Shyri 44, Tirana",
        city: "Tirana",
        lat: 41.32591,
        lng: 19.81512,
      },
    });
  }
  const mechanics = await prisma.mechanic.findMany({ include: { user: true } });
  const pins = [
    { email: "maya@rideready.test", lat: 41.31564, lng: 19.81362 },
    { email: "luis@rideready.test", lat: 41.32875, lng: 19.82366 },
    { email: "priya@rideready.test", lat: 41.32591, lng: 19.81512 },
  ];
  for (const pin of pins) {
    const mechanic = mechanics.find((row) => row.user.email === pin.email);
    if (mechanic && (!mechanic.lat || mechanic.lat < 35)) {
      await prisma.mechanic.update({ where: { id: mechanic.id }, data: { lat: pin.lat, lng: pin.lng } });
    }
  }
}

function albaniaListings() {
  return [
    {
      brand: "Giant",
      model: "Escape 3",
      year: 2022,
      color: "Black",
      city: "Tirana",
      price: 280,
      sellerName: "Arben Hoxha",
      sellerEmail: "alex@rideready.test",
      sellerPhone: "+355 69 555 0148",
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80",
      description: "City hybrid, 54cm. Serviced at Bike Point on Myslym Shyri. Pickup in Tirana.",
    },
    {
      brand: "Trek",
      model: "Marlin 5",
      year: 2023,
      color: "Blue",
      city: "Tirana",
      price: 420,
      sellerName: "Arben Hoxha",
      sellerEmail: "alex@rideready.test",
      sellerPhone: "+355 69 555 0148",
      imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76e25f54?auto=format&fit=crop&w=1200&q=80",
      description: "Hardtail MTB, little trail use. New chain. Can meet near Sheshi Skënderbej.",
    },
    {
      brand: "Decathlon",
      model: "Riverside 500",
      year: 2021,
      color: "Grey",
      city: "Durrës",
      price: 190,
      sellerName: "Lira Meta",
      sellerEmail: "lira@example.test",
      sellerPhone: "+355 69 200 1100",
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec71c6b3ace?auto=format&fit=crop&w=1200&q=80",
      description: "Touring hybrid. Some cable stretch; priced for a tune-up. Pickup in Durrës.",
    },
    {
      brand: "Kross",
      model: "Hexagon 2.0",
      year: 2020,
      color: "Green",
      city: "Shkodër",
      price: 160,
      sellerName: "Genti Beci",
      sellerEmail: "genti@example.test",
      sellerPhone: "+355 69 400 2200",
      imageUrl: "https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=1200&q=80",
      description: "Trail bike from a Shkodër Biçiklist stand. Honest wear on the grips.",
    },
    {
      brand: "Romet",
      model: "Wagant 1",
      year: 2019,
      color: "Red",
      city: "Warszawa",
      price: 310,
      sellerName: "Ola Wiśniewska",
      sellerEmail: "ola@example.test",
      imageUrl: "https://images.unsplash.com/photo-1511994298241-608e28f6f2ce?auto=format&fit=crop&w=1200&q=80",
      description: "City hybrid, recently cleaned. Can deliver in Warszawa.",
    },
    {
      brand: "Bianchi",
      model: "Via Nirone 7",
      year: 2021,
      color: "Celeste",
      city: "Roma",
      price: 890,
      sellerName: "Luca Bianchi",
      sellerEmail: "luca@example.test",
      imageUrl: "https://images.unsplash.com/photo-1511994298241-608e28f6f2ce?auto=format&fit=crop&w=1200&q=80",
      description: "Endurance road bike. Italian shop price — higher than Tirana listings.",
    },
  ];
}

export async function seedDatabase() {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const services = await Promise.all(SERVICE_CATALOG.map((service) => prisma.service.create({ data: service })));

  const alex = await prisma.user.create({
    data: {
      email: "alex@rideready.test",
      password,
      name: "Arben Hoxha",
      phone: "+355 69 555 0148",
      role: "CUSTOMER",
      customer: {
        create: {
          address: "Rruga Myslym Shyri 44, Tirana",
          city: "Tirana",
          lat: 41.32591,
          lng: 19.81512,
        },
      },
    },
    include: { customer: true },
  });

  const maya = await prisma.user.create({
    data: {
      email: "maya@rideready.test",
      password,
      name: "Maya Chen",
      phone: "+355 69 555 0190",
      role: "MECHANIC",
      mechanic: {
        create: {
          specialty: "Drivetrain & road bikes",
          experienceYears: 8,
          rating: 4.9,
          reviewCount: 128,
          lat: 41.31564,
          lng: 19.81362,
          available: true,
        },
      },
    },
    include: { mechanic: true },
  });

  await prisma.user.create({
    data: {
      email: "luis@rideready.test",
      password,
      name: "Luis Ortega",
      phone: "+355 69 555 0172",
      role: "MECHANIC",
      mechanic: {
        create: {
          specialty: "E-bikes & cargo",
          experienceYears: 6,
          rating: 4.8,
          reviewCount: 94,
          lat: 41.32875,
          lng: 19.82366,
          available: true,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "priya@rideready.test",
      password,
      name: "Priya Shah",
      phone: "+355 69 555 0114",
      role: "MECHANIC",
      mechanic: {
        create: {
          specialty: "Wheels, brakes, commuters",
          experienceYears: 11,
          rating: 4.95,
          reviewCount: 210,
          lat: 41.32591,
          lng: 19.81512,
          available: true,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@rideready.test",
      password,
      name: "Jordan Hale",
      phone: "+355 69 555 0100",
      role: "ADMIN",
      admin: { create: {} },
    },
  });

  const customerId = alex.customer!.id;
  const trek = await prisma.bike.create({
    data: {
      customerId,
      brand: "Trek",
      model: "Domane AL 4",
      year: 2022,
      registration: "TR-AK-4421",
      color: "Juniper",
    },
  });

  const specialized = await prisma.bike.create({
    data: {
      customerId,
      brand: "Specialized",
      model: "Turbo Vado 4.0",
      year: 2023,
      registration: "TR-EV-1180",
      color: "Cast Black",
    },
  });

  const fullService = services.find((s) => s.name === "Full service")!;
  const tuneUp = services.find((s) => s.name === "Basic tune-up")!;
  const flat = services.find((s) => s.name === "Flat repair")!;

  await prisma.booking.create({
    data: {
      customerId,
      mechanicId: maya.mechanic!.id,
      bikeId: trek.id,
      serviceId: fullService.id,
      mode: "DOORSTEP",
      scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 26),
      status: "EN_ROUTE",
      address: "Rruga Myslym Shyri 44, Tirana",
      lat: 41.32591,
      lng: 19.81512,
      estimatedPrice: 44,
      notes: "Creak from the bottom bracket on climbs.",
      payment: {
        create: { customerId, amount: 44, status: "UNPAID" },
      },
      statusLogs: {
        create: [
          { status: "REQUESTED", note: "We received your booking.", createdAt: hoursAgo(30) },
          { status: "CONFIRMED", note: "The workshop confirmed your slot.", createdAt: hoursAgo(28) },
          {
            status: "MECHANIC_ASSIGNED",
            note: "Maya Chen is assigned to your bike.",
            createdAt: hoursAgo(20),
          },
          {
            status: "EN_ROUTE",
            note: "Your mechanic is heading to your doorstep.",
            createdAt: hoursAgo(1),
          },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      customerId,
      mechanicId: maya.mechanic!.id,
      bikeId: specialized.id,
      serviceId: tuneUp.id,
      mode: "PICKUP_DROP",
      scheduledAt: hoursAgo(96),
      status: "COMPLETED",
      address: CITY.workshop.address,
      lat: CITY.workshop.lat,
      lng: CITY.workshop.lng,
      estimatedPrice: 31,
      payment: {
        create: {
          customerId,
          amount: 31,
          status: "PAID",
          method: "card",
          paidAt: hoursAgo(90),
        },
      },
      review: {
        create: {
          customerId,
          mechanicId: maya.mechanic!.id,
          rating: 5,
          comment: "Quiet shifts and they texted before drop-off. Easy.",
        },
      },
      statusLogs: {
        create: [
          { status: "REQUESTED", createdAt: hoursAgo(120) },
          { status: "COMPLETED", note: "Job closed.", createdAt: hoursAgo(90) },
        ],
      },
    },
  });

  await prisma.booking.create({
    data: {
      customerId,
      bikeId: trek.id,
      serviceId: flat.id,
      mode: "DOORSTEP",
      scheduledAt: hoursAgo(12),
      status: "COMPLETED",
      address: "Rruga Myslym Shyri 44, Tirana",
      lat: 41.32591,
      lng: 19.81512,
      estimatedPrice: 12,
      payment: {
        create: { customerId, amount: 12, status: "UNPAID" },
      },
      statusLogs: {
        create: [
          { status: "REQUESTED", createdAt: hoursAgo(20) },
          { status: "COMPLETED", note: "Tube replaced, tire inspected.", createdAt: hoursAgo(12) },
        ],
      },
    },
  });

  if ((await prisma.inventoryItem.count()) === 0) {
    await prisma.inventoryItem.createMany({
      data: [
        { name: "Inner tube 700x28", sku: "TUBE-700", quantity: 40, unitPrice: 4 },
        { name: "Brake pads (pair)", sku: "BRK-PAD", quantity: 16, unitPrice: 12 },
        { name: "Chain lube", sku: "LUBE-01", quantity: 18, unitPrice: 6 },
        { name: "Shift cable", sku: "CABLE-01", quantity: 22, unitPrice: 5 },
      ],
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: alex.id,
        title: "Mechanic on the way",
        body: "Maya Chen is heading to Myslym Shyri for your Full service.",
      },
      {
        userId: maya.id,
        title: "New doorstep job",
        body: "Full service on a Trek Domane AL 4.",
      },
    ],
  });
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}
