"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMapHandle, Marker as LeafletMarker } from "leaflet";
import { CITY, type MapBounds, type MapMarker } from "@/lib/maps";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

const KIND_COLOR: Record<MapMarker["kind"], string> = {
  customer: "#d97706",
  mechanic: "#0f766e",
  workshop: "#1d4ed8",
  pin: "#b45309",
};

const KIND_LABEL: Record<MapMarker["kind"], string> = {
  customer: "You",
  mechanic: "Mechanic",
  workshop: "Workshop",
  pin: "Pin",
};

function pinIcon(L: typeof import("leaflet"), color: string, selected: boolean) {
  const size = selected ? 18 : 14;
  return L.divIcon({
    className: "bikeservice-pin",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export function LeafletMap({
  center = CITY.center,
  bounds,
  markers = [],
  onPick,
  selectedId,
  onSelect,
  showLegend = false,
  className,
}: {
  center?: { lat: number; lng: number };
  bounds?: MapBounds;
  markers?: MapMarker[];
  onPick?: (lat: number, lng: number) => void;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showLegend?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMapHandle | null>(null);
  const markersRef = useRef<LeafletMarker[]>([]);
  const onPickRef = useRef(onPick);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  onPickRef.current = onPick;
  onSelectRef.current = onSelect;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;

    void import("leaflet").then((mod) => {
      if (cancelled || !containerRef.current) return;
      const L = mod.default;
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: true }).setView(
        [center.lat, center.lng],
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      map.on("click", (event) => {
        onPickRef.current?.(event.latlng.lat, event.latlng.lng);
      });
      mapRef.current = map;
      setReady(true);
      requestAnimationFrame(() => map.invalidateSize());
    });

    return () => {
      cancelled = true;
      setReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Recreate only when the map node is first mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView([center.lat, center.lng], map.getZoom() || 13);
    if (bounds) {
      void import("leaflet").then((mod) => {
        const L = mod.default;
        map.fitBounds(
          [
            [bounds.minLat, bounds.minLng],
            [bounds.maxLat, bounds.maxLng],
          ],
          { padding: [24, 24], maxZoom: 14 },
        );
        void L;
      });
    }
  }, [center.lat, center.lng, bounds, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    void import("leaflet").then((mod) => {
      const L = mod.default;
      for (const marker of markersRef.current) marker.remove();
      markersRef.current = markers.map((item) => {
        const marker = L.marker([item.lat, item.lng], {
          icon: pinIcon(L, KIND_COLOR[item.kind], item.id === selectedId),
          title: item.label,
        }).addTo(map);
        marker.bindPopup(`<strong>${item.label}</strong><br/>${item.detail ?? KIND_LABEL[item.kind]}`);
        marker.on("click", () => onSelectRef.current?.(item.id));
        if (item.id === selectedId) marker.openPopup();
        return marker;
      });
    });
  }, [markers, selectedId, ready]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-muted", className)}>
      <div ref={containerRef} className="h-full min-h-[16rem] w-full" />
      {showLegend ? (
        <ul className="absolute bottom-2 right-2 z-[500] flex flex-wrap gap-1 rounded-lg bg-background/90 p-1.5 text-[10px]">
          {(Object.keys(KIND_LABEL) as MapMarker["kind"][]).map((kind) => (
            <li key={kind} className="flex items-center gap-1 px-1">
              <span className="size-2 rounded-full" style={{ background: KIND_COLOR[kind] }} />
              {KIND_LABEL[kind]}
            </li>
          ))}
        </ul>
      ) : null}
      {onPick ? (
        <p className="absolute bottom-2 left-2 z-[500] rounded-md bg-background/85 px-2 py-1 text-[10px] text-muted-foreground">
          Tap the map to drop a pin
        </p>
      ) : null}
    </div>
  );
}
