/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL = import.meta.env.VITE_FRONTEND_FORGE_API_URL || "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.maps) return resolve();
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => { resolve(); script.remove(); };
    script.onerror = () => { script.remove(); reject(new Error("Google Maps could not be loaded")); };
    document.head.appendChild(script);
  });
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
      map.current = new window.google.maps.Map(mapContainer.current, { zoom: initialZoom, center: initialCenter, mapTypeControl: true, fullscreenControl: true, zoomControl: true, streetViewControl: true, mapId: "DEMO_MAP_ID" });
      onMapReady?.(map.current);
      setError(false);
    } catch { setError(true); }
  });
  useEffect(() => { init(); }, [init, attempt]);
  return <div className={cn("relative h-[500px] w-full", className)}><div ref={mapContainer} className="h-full w-full" />{error && <div className="absolute inset-0 flex items-center justify-center bg-[#dfeae1]/95 p-6 text-center"><div className="max-w-xs rounded-2xl border border-white bg-white/90 p-5 shadow-xl backdrop-blur"><p className="text-sm font-bold text-[#284f42]">Google Maps layer unavailable</p><p className="mt-2 text-xs leading-relaxed text-[#778a81]">The live map can be retried without losing the planning workspace.</p><Button size="sm" onClick={() => setAttempt((value) => value + 1)} className="mt-4 rounded-xl bg-[#183b31]">Retry map layer</Button></div></div>}</div>;
}
