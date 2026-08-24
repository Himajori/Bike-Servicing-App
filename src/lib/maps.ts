/** Default service city — Austin, used when Google Maps has no key. */
export const CITY = {
  name: "Austin",
  center: { lat: 30.2672, lng: -97.7431 },
  workshop: {
    name: "BikeApp Workshop",
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
};

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
  bounds = { minLat: 30.22, maxLat: 30.32, minLng: -97.8, maxLng: -97.7 },
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
  bounds = { minLat: 30.22, maxLat: 30.32, minLng: -97.8, maxLng: -97.7 },
) {
  const lng = bounds.minLng + (x / 100) * (bounds.maxLng - bounds.minLng);
  const lat = bounds.maxLat - (y / 100) * (bounds.maxLat - bounds.minLat);
  return { lat: Number(lat.toFixed(5)), lng: Number(lng.toFixed(5)) };
}
