import { boundsAround, foldAscii } from "./geo";

export type MapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  kind: "customer" | "mechanic" | "workshop" | "pin";
  detail?: string;
};

export type ServiceCity = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  live: boolean;
  featured: boolean;
  priceIndex: number;
  currency: "EUR" | "USD";
  center: { lat: number; lng: number };
  bounds: MapBounds;
  workshops: { id: string; name: string; address: string; lat: number; lng: number; services: string }[];
  aliases?: string[];
};

function city(input: Omit<ServiceCity, "bounds"> & { radiusKm?: number }): ServiceCity {
  return {
    ...input,
    bounds: boundsAround(input.center, input.radiusKm ?? 8),
  };
}

/** Default live city — Tirana, with OSM bicycle shops on the map. */
export const CITY = {
  name: "Tirana",
  center: { lat: 41.3275, lng: 19.8187 },
  bounds: boundsAround({ lat: 41.3275, lng: 19.8187 }, 8),
  workshop: {
    name: "Bike Doctor",
    address: "Rruga Bilal Xhaferri, Tirana",
    lat: 41.31564,
    lng: 19.81362,
  },
};

export const SERVICE_CITIES: ServiceCity[] = [
  city({
    slug: "tirana",
    name: "Tirana",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 1,
    currency: "EUR",
    center: CITY.center,
    radiusKm: 9,
    workshops: [
      {
        id: "bike-doctor",
        name: "Bike Doctor",
        address: CITY.workshop.address,
        lat: CITY.workshop.lat,
        lng: CITY.workshop.lng,
        services: "Repair · Full service from €25",
      },
      {
        id: "bike-point",
        name: "Bike Point Albania",
        address: "Rruga Myslym Shyri 44, Tirana",
        lat: 41.32591,
        lng: 19.81512,
        services: "Shop · Service",
      },
      {
        id: "evergreen",
        name: "Evergreen Rent & Service",
        address: "Rruga Ibrahim Rugova, Tirana",
        lat: 41.31774,
        lng: 19.81891,
        services: "Rental · Repair",
      },
    ],
  }),
  city({
    slug: "durres",
    name: "Durrës",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.95,
    currency: "EUR",
    center: { lat: 41.3231, lng: 19.4414 },
    aliases: ["Durres", "Durazzo"],
    workshops: [
      {
        id: "road-bike-team",
        name: "Road Bike Team",
        address: "Durrës",
        lat: 41.31876,
        lng: 19.45831,
        services: "Shop · Repair",
      },
    ],
  }),
  city({
    slug: "shkoder",
    name: "Shkodër",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.92,
    currency: "EUR",
    center: { lat: 42.0683, lng: 19.5126 },
    radiusKm: 6,
    aliases: ["Shkoder", "Shkodra", "Scutari"],
    workshops: [
      {
        id: "biciklist-center",
        name: "Biçiklist",
        address: "Rruga Berdicej, Shkodër",
        lat: 42.06624,
        lng: 19.51779,
        services: "Parts · Repair",
      },
    ],
  }),
  city({
    slug: "vlore",
    name: "Vlorë",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.95,
    currency: "EUR",
    center: { lat: 40.4667, lng: 19.4897 },
    aliases: ["Vlore", "Vlora"],
    workshops: [
      {
        id: "vlore-riparim",
        name: "Riparim Biçikletash",
        address: "Vlorë",
        lat: 40.4667,
        lng: 19.4897,
        services: "Repair station",
      },
    ],
  }),
  city({
    slug: "elbasan",
    name: "Elbasan",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.9,
    currency: "EUR",
    center: { lat: 41.1125, lng: 20.0822 },
    workshops: [
      {
        id: "antonio-elbasan",
        name: "Antonio's bike shop",
        address: "Elbasan",
        lat: 41.10686,
        lng: 20.08227,
        services: "Shop · Repair",
      },
    ],
  }),
  city({
    slug: "fier",
    name: "Fier",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.9,
    currency: "EUR",
    center: { lat: 40.7239, lng: 19.5561 },
    workshops: [
      {
        id: "altini-fier",
        name: "Altini e biçikletë",
        address: "Fier",
        lat: 40.72752,
        lng: 19.55676,
        services: "Repair",
      },
    ],
  }),
  city({
    slug: "berat",
    name: "Berat",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.9,
    currency: "EUR",
    center: { lat: 40.7058, lng: 19.9522 },
    workshops: [
      {
        id: "anis-berat",
        name: "Ani's Bicycle Shop",
        address: "Rruga Antipatrea, Berat",
        lat: 40.70916,
        lng: 19.93926,
        services: "Shop · Repair",
      },
    ],
  }),
  city({
    slug: "korce",
    name: "Korçë",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.9,
    currency: "EUR",
    center: { lat: 40.6186, lng: 20.7808 },
    workshops: [
      {
        id: "bicikletari",
        name: "Bicikletari",
        address: "Korçë",
        lat: 40.61769,
        lng: 20.77499,
        services: "Shop · Repair",
      },
    ],
  }),
  city({
    slug: "gjirokaster",
    name: "Gjirokastër",
    country: "Albania",
    countryCode: "AL",
    live: true,
    featured: true,
    priceIndex: 0.88,
    currency: "EUR",
    center: { lat: 40.0758, lng: 20.1389 },
    workshops: [
      {
        id: "pasioni-gjiro",
        name: "Bicikleta Pasioni Im",
        address: "Gjirokastër",
        lat: 40.07758,
        lng: 20.13633,
        services: "Shop",
      },
    ],
  }),
  city({
    slug: "prishtina",
    name: "Prishtina",
    country: "Kosovo",
    countryCode: "XK",
    live: true,
    featured: false,
    priceIndex: 0.95,
    currency: "EUR",
    center: { lat: 42.6629, lng: 21.1655 },
    workshops: [
      {
        id: "prishtina-center",
        name: "BikeService Prishtina",
        address: "Bulevardi Nënë Tereza, Prishtina",
        lat: 42.6629,
        lng: 21.1655,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "skopje",
    name: "Skopje",
    country: "North Macedonia",
    countryCode: "MK",
    live: true,
    featured: false,
    priceIndex: 0.92,
    currency: "EUR",
    center: { lat: 41.9981, lng: 21.4254 },
    workshops: [
      {
        id: "skopje-center",
        name: "BikeService Skopje",
        address: "Macedonia Street, Skopje",
        lat: 41.9981,
        lng: 21.4254,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "podgorica",
    name: "Podgorica",
    country: "Montenegro",
    countryCode: "ME",
    live: true,
    featured: false,
    priceIndex: 1.08,
    currency: "EUR",
    center: { lat: 42.4304, lng: 19.2594 },
    workshops: [
      {
        id: "podgorica-center",
        name: "BikeService Podgorica",
        address: "Bulevar Svetog Petra Cetinjskog, Podgorica",
        lat: 42.4304,
        lng: 19.2594,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "thessaloniki",
    name: "Thessaloniki",
    country: "Greece",
    countryCode: "GR",
    live: true,
    featured: false,
    priceIndex: 1.3,
    currency: "EUR",
    center: { lat: 40.6401, lng: 22.9444 },
    workshops: [
      {
        id: "skg-center",
        name: "BikeService Thessaloniki",
        address: "Tsimiski, Thessaloniki",
        lat: 40.6401,
        lng: 22.9444,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "athens",
    name: "Athens",
    country: "Greece",
    countryCode: "GR",
    live: true,
    featured: false,
    priceIndex: 1.35,
    currency: "EUR",
    center: { lat: 37.9838, lng: 23.7275 },
    radiusKm: 10,
    workshops: [
      {
        id: "ath-center",
        name: "BikeService Athens",
        address: "Panepistimiou, Athens",
        lat: 37.9838,
        lng: 23.7275,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "bari",
    name: "Bari",
    country: "Italy",
    countryCode: "IT",
    live: true,
    featured: false,
    priceIndex: 1.45,
    currency: "EUR",
    center: { lat: 41.1171, lng: 16.8719 },
    workshops: [
      {
        id: "bari-center",
        name: "BikeService Bari",
        address: "Via Sparano, Bari",
        lat: 41.1171,
        lng: 16.8719,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "roma",
    name: "Roma",
    country: "Italy",
    countryCode: "IT",
    live: true,
    featured: false,
    priceIndex: 1.65,
    currency: "EUR",
    center: { lat: 41.9028, lng: 12.4964 },
    radiusKm: 10,
    workshops: [
      {
        id: "roma-center",
        name: "BikeService Roma",
        address: "Via Nazionale, Roma",
        lat: 41.9028,
        lng: 12.4964,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "milano",
    name: "Milano",
    country: "Italy",
    countryCode: "IT",
    live: true,
    featured: false,
    priceIndex: 1.7,
    currency: "EUR",
    center: { lat: 45.4642, lng: 9.19 },
    workshops: [
      {
        id: "milano-center",
        name: "BikeService Milano",
        address: "Corso Buenos Aires, Milano",
        lat: 45.4642,
        lng: 9.19,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "warszawa",
    name: "Warszawa",
    country: "Poland",
    countryCode: "PL",
    live: true,
    featured: false,
    priceIndex: 1.4,
    currency: "EUR",
    center: { lat: 52.2297, lng: 21.0122 },
    radiusKm: 10,
    workshops: [
      {
        id: "waw-mokotow",
        name: "BikeService Mokotów",
        address: "ul. Puławska 120, Warszawa",
        lat: 52.201,
        lng: 21.023,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "krakow",
    name: "Kraków",
    country: "Poland",
    countryCode: "PL",
    live: true,
    featured: false,
    priceIndex: 1.35,
    currency: "EUR",
    center: { lat: 50.0647, lng: 19.945 },
    workshops: [
      {
        id: "krk-kazimierz",
        name: "BikeService Kazimierz",
        address: "ul. Dietla 50, Kraków",
        lat: 50.051,
        lng: 19.945,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "poznan",
    name: "Poznań",
    country: "Poland",
    countryCode: "PL",
    live: true,
    featured: false,
    priceIndex: 1.32,
    currency: "EUR",
    center: { lat: 52.4064, lng: 16.9252 },
    workshops: [
      {
        id: "poz-jezyce",
        name: "BikeService Jeżyce",
        address: "ul. Dąbrowskiego 40, Poznań",
        lat: 52.41,
        lng: 16.91,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "wroclaw",
    name: "Wrocław",
    country: "Poland",
    countryCode: "PL",
    live: true,
    featured: false,
    priceIndex: 1.32,
    currency: "EUR",
    center: { lat: 51.1079, lng: 17.0385 },
    workshops: [
      {
        id: "wro-nadodrze",
        name: "BikeService Nadodrze",
        address: "ul. Pomorska 40, Wrocław",
        lat: 51.122,
        lng: 17.03,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "gdansk",
    name: "Gdańsk",
    country: "Poland",
    countryCode: "PL",
    live: true,
    featured: false,
    priceIndex: 1.35,
    currency: "EUR",
    center: { lat: 54.352, lng: 18.6466 },
    workshops: [
      {
        id: "gdn-wrzeszcz",
        name: "BikeService Wrzeszcz",
        address: "ul. Grunwaldzka 90, Gdańsk",
        lat: 54.38,
        lng: 18.61,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "austin",
    name: "Austin",
    country: "USA",
    countryCode: "US",
    live: true,
    featured: false,
    priceIndex: 1.85,
    currency: "USD",
    center: { lat: 30.2672, lng: -97.7431 },
    radiusKm: 10,
    workshops: [
      {
        id: "austin-lamar",
        name: "BikeService Lamar",
        address: "1800 South Lamar Blvd, Austin, TX",
        lat: 30.2506,
        lng: -97.7653,
        services: "Doorstep · Pickup",
      },
    ],
  }),
  city({
    slug: "dallas",
    name: "Dallas",
    country: "USA",
    countryCode: "US",
    live: true,
    featured: false,
    priceIndex: 1.8,
    currency: "USD",
    center: { lat: 32.7767, lng: -96.797 },
    workshops: [
      {
        id: "dallas-oak",
        name: "BikeService Oak Lawn",
        address: "3900 McKinney Ave, Dallas, TX",
        lat: 32.8015,
        lng: -96.8065,
        services: "Doorstep · Pickup",
      },
    ],
  }),
];

export const SAVED_PLACES = [
  {
    label: "Home — Myslym Shyri",
    address: "Rruga Myslym Shyri 44, Tirana",
    lat: 41.32591,
    lng: 19.81512,
  },
  {
    label: "Office — Skanderbeg",
    address: "Sheshi Skënderbej, Tirana",
    lat: 41.3279,
    lng: 19.8187,
  },
  {
    label: "Workshop drop-off",
    address: CITY.workshop.address,
    lat: CITY.workshop.lat,
    lng: CITY.workshop.lng,
  },
];

export function cityBySlug(slug: string | null | undefined) {
  if (!slug) return undefined;
  return SERVICE_CITIES.find((item) => item.slug === slug.toLowerCase());
}

export function cityByName(name: string | null | undefined) {
  if (!name) return undefined;
  const target = foldAscii(name.trim());
  return SERVICE_CITIES.find(
    (item) => foldAscii(item.name) === target || (item.aliases ?? []).some((alias) => foldAscii(alias) === target),
  );
}

export function cityMatchesQuery(city: ServiceCity, query: string) {
  const q = foldAscii(query);
  if (!q) return true;
  const haystack = [city.slug, city.name, city.country, city.countryCode, ...(city.aliases ?? [])]
    .map(foldAscii)
    .join(" ");
  return haystack.includes(q);
}

export function citiesMatching(query: string) {
  const q = query.trim();
  if (!q) return SERVICE_CITIES;
  return SERVICE_CITIES.filter((city) => cityMatchesQuery(city, q));
}

export function nearestCity(lat: number, lng: number) {
  let best = SERVICE_CITIES[0];
  let bestKm = Number.POSITIVE_INFINITY;
  for (const item of SERVICE_CITIES) {
    const dLat = ((item.center.lat - lat) * Math.PI) / 180;
    const dLng = ((item.center.lng - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((item.center.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    const km = 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(a)));
    if (km < bestKm) {
      best = item;
      bestKm = km;
    }
  }
  return { city: best, km: Math.round(bestKm * 10) / 10 };
}

export function projectToMap(lat: number, lng: number, bounds: MapBounds = CITY.bounds) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(96, Math.max(4, y)),
  };
}

export function unprojectFromMap(x: number, y: number, bounds: MapBounds = CITY.bounds) {
  const lng = bounds.minLng + (x / 100) * (bounds.maxLng - bounds.minLng);
  const lat = bounds.maxLat - (y / 100) * (bounds.maxLat - bounds.minLat);
  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
}

/** @deprecated Use CITY.bounds — kept for older map callers. */
export const AUSTIN_BOUNDS = CITY.bounds;
