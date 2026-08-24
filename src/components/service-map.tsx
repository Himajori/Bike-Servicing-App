"use client";

import { useEffect, useRef } from "react";
import { CITY, projectToMap, unprojectFromMap, type MapMarker } from "@/lib/maps";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: {
      maps: {
        Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMapHandle;
        Marker: new (opts: Record<string, unknown>) => { setMap: (m: unknown) => void };
        event: { addListener: (t: unknown, n: string, fn: (e: { latLng: { lat: () => number; lng: () => number } }) => void) => void };
      };
    };
  }
}

type GoogleMapHandle = {
  setCenter: (c: { lat: number; lng: number }) => void;
};

const KIND_COLOR: Record<MapMarker["kind"], string> = {
  customer: "#d97706",
  mechanic: "#0f766e",
  workshop: "#1d4ed8",
  pin: "#b45309",
};

export function ServiceMap({
  center = CITY.center,
  markers = [],
  onPick,
  className,
}: {
  center?: { lat: number; lng: number };
  markers?: MapMarker[];
  onPick?: (lat: number, lng: number) => void;
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
  return <FallbackMap center={center} markers={markers} onPick={onPick} className={className} />;
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

function FallbackMap({
  markers,
  onPick,
  className,
}: {
  center: { lat: number; lng: number };
  markers: MapMarker[];
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-[#c5d4c0]",
        className,
      )}
      onClick={(event) => {
        if (!onPick) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const point = unprojectFromMap(x, y);
        onPick(point.lat, point.lng);
      }}
      role={onPick ? "button" : "img"}
      aria-label="Service area map"
    >
      <svg viewBox="0 0 100 70" className="h-full w-full" preserveAspectRatio="none">
        <rect width="100" height="70" fill="#c5d4c0" />
        <rect x="0" y="28" width="100" height="10" fill="#9bb39a" />
        <path d="M0 18 H100 M0 42 H100 M0 55 H100" stroke="#d7e3d4" strokeWidth="2" />
        <path d="M12 0 V70 M28 0 V70 M48 0 V70 M70 0 V70 M88 0 V70" stroke="#e8efe4" strokeWidth="3.2" />
        <path d="M0 12 C 20 10, 40 22, 100 16" stroke="#8aa4c7" strokeWidth="2.4" fill="none" />
        <circle cx="72" cy="22" r="8" fill="#8fbf86" />
        <text x="4" y="8" fontSize="3.2" fill="#3f4a3d">
          Austin · BikeApp zone
        </text>
      </svg>
      {markers.map((marker) => {
        const pos = projectToMap(marker.lat, marker.lng);
        return (
          <div
            key={marker.id}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${pos.x}%`, top: `${(pos.y / 100) * 70 + 8}%` }}
          >
            <div
              className="rounded-full px-1.5 py-0.5 text-[10px] font-medium text-white shadow"
              style={{ background: KIND_COLOR[marker.kind] }}
            >
              {marker.label}
            </div>
            <div
              className="mx-auto mt-0.5 size-2.5 rounded-full border-2 border-white shadow"
              style={{ background: KIND_COLOR[marker.kind] }}
            />
          </div>
        );
      })}
      {onPick ? (
        <p className="absolute bottom-2 left-2 rounded-md bg-background/85 px-2 py-1 text-[10px] text-muted-foreground">
          Tap the map to drop a pin · Google Maps key optional
        </p>
      ) : null}
    </div>
  );
}
