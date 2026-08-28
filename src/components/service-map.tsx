"use client";

import { useEffect, useRef } from "react";
import { CITY, type MapBounds, type MapMarker } from "@/lib/maps";
import { LeafletMap } from "@/components/leaflet-map";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMapHandle;
        Marker: new (opts: Record<string, unknown>) => { setMap: (m: unknown) => void };
        event: {
          addListener: (
            t: unknown,
            n: string,
            fn: (e: { latLng: { lat: () => number; lng: () => number } }) => void,
          ) => void;
        };
      };
    };
  }
}

type GoogleMapHandle = {
  setCenter: (c: { lat: number; lng: number }) => void;
};

export function ServiceMap({
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
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    return (
      <GoogleMap
        apiKey={apiKey}
        center={center}
        markers={markers}
        onPick={onPick}
        className={className}
      />
    );
  }
  return (
    <LeafletMap
      center={center}
      bounds={bounds}
      markers={markers}
      onPick={onPick}
      selectedId={selectedId}
      onSelect={onSelect}
      showLegend={showLegend}
      className={className}
    />
  );
}

function GoogleMap({
  apiKey,
  center,
  markers,
  onPick,
  className,
}: {
  apiKey: string;
  center: { lat: number; lng: number };
  markers: MapMarker[];
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    const ready = () =>
      new Promise<void>((resolve) => {
        if (window.google?.maps) {
          resolve();
          return;
        }
        const existing = document.getElementById("gmaps-js");
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          return;
        }
        const script = document.createElement("script");
        script.id = "gmaps-js";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
        script.async = true;
        script.onload = () => resolve();
        document.head.appendChild(script);
      });

    void ready().then(() => {
      if (cancelled || !window.google?.maps || !ref.current) return;
      const map = new window.google.maps.Map(ref.current, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
      });
      for (const marker of markers) {
        new window.google.maps.Marker({
          map,
          position: { lat: marker.lat, lng: marker.lng },
          title: marker.label,
        });
      }
      if (onPick) {
        window.google.maps.event.addListener(map, "click", (event) => {
          onPick(event.latLng.lat(), event.latLng.lng());
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [apiKey, center, markers, onPick]);

  return <div ref={ref} className={cn("overflow-hidden rounded-2xl bg-muted", className)} />;
}
