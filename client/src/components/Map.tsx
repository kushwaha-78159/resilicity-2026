/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

let mapScriptPromise: Promise<void> | null = null;

function loadMapScript() {
  if (window.google?.maps) return Promise.resolve();
  if (mapScriptPromise) return mapScriptPromise;

  mapScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("resilicity-google-maps") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google Maps could not be loaded")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "resilicity-google-maps";
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${encodeURIComponent(API_KEY)}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      mapScriptPromise = null;
      reject(new Error("Google Maps could not be loaded"));
    };
    document.head.appendChild(script);
  });

  return mapScriptPromise;
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({ className, initialCenter = { lat: 37.7749, lng: -122.4194 }, initialZoom = 12, onMapReady }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const init = usePersistFn(async () => {
    try {
      await loadMapScript();
      if (!mapContainer.current || !window.google?.maps) return;
      const mapsLibrary = await window.google.maps.importLibrary("maps") as google.maps.MapsLibrary;
      map.current = new mapsLibrary.Map(mapContainer.current, { zoom: initialZoom, center: initialCenter, mapTypeControl: true, fullscreenControl: true, zoomControl: true, streetViewControl: true });
      onMapReady?.(map.current);
      setError(false);
    } catch (error) {
      console.error("ResiliCity map initialization failed", error);
      setError(true);
    }
  });
  useEffect(() => {
    init();
    return () => {
      map.current = null;
    };
  }, [init, attempt]);
  const embedUrl = `https://www.google.com/maps/@?api=1&map_action=map&center=${initialCenter.lat},${initialCenter.lng}&zoom=${initialZoom}`;

  return <div className={cn("relative h-[500px] w-full", className)}>
    <div ref={mapContainer} className="h-full w-full" />
    {error && <>
      <iframe title="NRG Stadium Google Maps fallback" src={embedUrl} className="absolute inset-0 h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      <div className="absolute right-4 top-4 z-30 rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-[11px] shadow-lg backdrop-blur">
        <p className="font-bold text-[#284f42]">Google Maps overview</p>
        <p className="mt-1 text-[#778a81]">Interactive layer retry available</p>
        <Button size="sm" onClick={() => setAttempt((value) => value + 1)} className="mt-2 h-8 rounded-lg bg-[#183b31] text-xs">Retry live layer</Button>
      </div>
    </>}
  </div>;
}
