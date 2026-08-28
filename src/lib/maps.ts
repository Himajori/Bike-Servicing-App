export type MapBounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export const AUSTIN_BOUNDS: MapBounds = {
  minLat: 30.22,
  maxLat: 30.32,
  minLng: -97.8,
  maxLng: -97.7,
};

/** Default service city — Austin, used when Google Maps has no key. */
export const CITY = {
  name: "Austin",
  center: { lat: 30.2672, lng: -97.7431 },
  bounds: AUSTIN_BOUNDS,
  workshop: {
    name: "BikeService Workshop",
    address: "1800 South Lamar Blvd, Austin, TX",
    lat: 30.2506,
    lng: -97.7653,
  },
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
  live: boolean;
  center: { lat: number; lng: number };
  bounds: MapBounds;
  workshops: { id: string; name: string; address: string; lat: number; lng: number; services: string }[];
};

export const SERVICE_CITIES: ServiceCity[] = [
  {
    slug: "austin",
    name: "Austin",
    country: "USA",
    live: true,
    center: CITY.center,
    bounds: AUSTIN_BOUNDS,
    workshops: [
      {
        id: "austin-lamar",
        name: "BikeService Lamar",
        address: CITY.workshop.address,
        lat: CITY.workshop.lat,
        lng: CITY.workshop.lng,
        services: "Doorstep · Pickup & drop",
      },
    ],
  },
  {
    slug: "dallas",
    name: "Dallas",
    country: "USA",
    live: false,
    center: { lat: 32.7767, lng: -96.797 },
    bounds: { minLat: 32.72, maxLat: 32.84, minLng: -96.86, maxLng: -96.72 },
    workshops: [
      {
        id: "dallas-oak",
        name: "BikeService Oak Lawn",
        address: "3900 McKinney Ave, Dallas, TX",
        lat: 32.8015,
        lng: -96.8065,
        services: "Coming soon",
      },
    ],
  },
  {
    slug: "houston",
    name: "Houston",
    country: "USA",
    live: false,
    center: { lat: 29.7604, lng: -95.3698 },
    bounds: { minLat: 29.7, maxLat: 29.82, minLng: -95.44, maxLng: -95.3 },
    workshops: [
      {
        id: "houston-montrose",
        name: "BikeService Montrose",
        address: "1200 Westheimer Rd, Houston, TX",
        lat: 29.743, lng: -95.392,
        services: "Coming soon",
      },
    ],
  },
  {
    slug: "warszawa",
    name: "Warszawa",
    country: "Poland",
    live: false,
    center: { lat: 52.2297, lng: 21.0122 },
    bounds: { minLat: 52.18, maxLat: 52.28, minLng: 20.94, maxLng: 21.08 },
    workshops: [
      {
        id: "waw-mokotow",
        name: "BikeService Mokotów",
        address: "ul. Puławska 120, Warszawa",
        lat: 52.201, lng: 21.023,
        services: "Waitlist",
      },
      {
        id: "waw-praga",
        name: "BikeService Praga",
        address: "ul. Ząbkowska 8, Warszawa",
        lat: 52.252, lng: 21.04,
        services: "Waitlist",
      },
    ],
  },
  {
    slug: "krakow",
    name: "Kraków",
    country: "Poland",
    live: false,
    center: { lat: 50.0647, lng: 19.945 },
    bounds: { minLat: 50.02, maxLat: 50.1, minLng: 19.88, maxLng: 20.02 },
    workshops: [
      {
        id: "krk-kazimierz",
        name: "BikeService Kazimierz",
        address: "ul. Dietla 50, Kraków",
        lat: 50.051, lng: 19.945,
        services: "Waitlist",
      },
    ],
  },
  {
    slug: "poznan",
    name: "Poznań",
    country: "Poland",
    live: false,
    center: { lat: 52.4064, lng: 16.9252 },
    bounds: { minLat: 52.36, maxLat: 52.45, minLng: 16.86, maxLng: 16.99 },
    workshops: [
      {
        id: "poz-jezyce",
        name: "BikeService Jeżyce",
        address: "ul. Dąbrowskiego 40, Poznań",
        lat: 52.41, lng: 16.91,
        services: "Waitlist",
      },
    ],
  },
  {
    slug: "wroclaw",
    name: "Wrocław",
    country: "Poland",
    live: false,
    center: { lat: 51.1079, lng: 17.0385 },
    bounds: { minLat: 51.06, maxLat: 51.16, minLng: 16.96, maxLng: 17.12 },
    workshops: [
      {
        id: "wro-nadodrze",
        name: "BikeService Nadodrze",
        address: "ul. Pomorska 40, Wrocław",
        lat: 51.122, lng: 17.03,
        services: "Waitlist",
      },
    ],
  },
  {
    slug: "gdansk",
    name: "Gdańsk",
    country: "Poland",
    live: false,
    center: { lat: 54.352, lng: 18.6466 },
    bounds: { minLat: 54.32, maxLat: 54.4, minLng: 18.58, maxLng: 18.72 },
    workshops: [
      {
        id: "gdn-wrzeszcz",
        name: "BikeService Wrzeszcz",
        address: "ul. Grunwaldzka 90, Gdańsk",
        lat: 54.38, lng: 18.61,
        services: "Waitlist",
      },
    ],
  },
];

export const SAVED_PLACES = [
  {
    label: "Home — East 6th",
    address: "1204 East 6th Street, Austin, TX",
    lat: 30.2643,
    lng: -97.7312,
  },
  {
    label: "Office — Downtown",
    address: "301 Congress Avenue, Austin, TX",
    lat: 30.2651,
    lng: -97.743,
  },
  {
    label: "Workshop drop-off",
    address: CITY.workshop.address,
    lat: CITY.workshop.lat,
    lng: CITY.workshop.lng,
  },
];

export function projectToMap(
  lat: number,
  lng: number,
  bounds: MapBounds = AUSTIN_BOUNDS,
) {
  const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 100;
  return {
    x: Math.min(96, Math.max(4, x)),
    y: Math.min(96, Math.max(4, y)),
  };
}

export function unprojectFromMap(
  x: number,
  y: number,
  bounds: MapBounds = AUSTIN_BOUNDS,
) {
  const lng = bounds.minLng + (x / 100) * (bounds.maxLng - bounds.minLng);
  const lat = bounds.maxLat - (y / 100) * (bounds.maxLat - bounds.minLat);
  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
}
