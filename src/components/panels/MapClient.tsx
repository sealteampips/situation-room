"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import type { ThreatLevel } from "@/types";
import "leaflet/dist/leaflet.css";

interface HotspotData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  situationId: string | null;
  status: ThreatLevel;
  headlines: string[];
}

interface MapClientProps {
  hotspots: HotspotData[];
}

const STATUS_COLORS: Record<ThreatLevel, string> = {
  low: "#22c55e",
  elevated: "#eab308",
  high: "#f97316",
  critical: "#ef4444",
};

function MapController() {
  const map = useMap();

  useEffect(() => {
    // Disable scroll zoom for better UX
    map.scrollWheelZoom.disable();

    // Re-enable on focus
    map.on("focus", () => map.scrollWheelZoom.enable());
    map.on("blur", () => map.scrollWheelZoom.disable());
  }, [map]);

  return null;
}

export default function MapClient({ hotspots }: MapClientProps) {
  return (
    <div className="map-container">
      <MapContainer
        center={[30, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false}
      >
        <MapController />

        {/* Dark tile layer - CartoDB Dark Matter */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        {/* Hotspot markers */}
        {hotspots.map((hotspot) => (
          <HotspotMarker key={hotspot.id} hotspot={hotspot} />
        ))}
      </MapContainer>
    </div>
  );
}

function HotspotMarker({ hotspot }: { hotspot: HotspotData }) {
  const color = STATUS_COLORS[hotspot.status];
  const isHighPriority = hotspot.status === "high" || hotspot.status === "critical";

  return (
    <>
      {/* Outer pulse ring for high priority */}
      {isHighPriority && (
        <CircleMarker
          center={[hotspot.lat, hotspot.lng]}
          radius={18}
          pathOptions={{
            color: color,
            fillColor: color,
            fillOpacity: 0.1,
            weight: 1,
            opacity: 0.3,
          }}
        />
      )}

      {/* Main marker */}
      <CircleMarker
        center={[hotspot.lat, hotspot.lng]}
        radius={isHighPriority ? 10 : 8}
        pathOptions={{
          color: color,
          fillColor: color,
          fillOpacity: 0.6,
          weight: 2,
          opacity: 1,
        }}
      >
        <Popup>
          <div className="min-w-[200px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#262626]">
              <span className="font-mono font-semibold text-amber-400 text-sm">
                {hotspot.name}
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  border: `1px solid ${color}40`,
                }}
              >
                {hotspot.status}
              </span>
            </div>

            {/* Headlines */}
            {hotspot.headlines.length > 0 ? (
              <div className="space-y-2">
                <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                  Recent Activity
                </div>
                {hotspot.headlines.map((headline, idx) => (
                  <div
                    key={idx}
                    className="text-xs text-gray-300 leading-relaxed line-clamp-2"
                  >
                    {headline}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500 font-mono">
                No recent headlines
              </div>
            )}

            {/* Coordinates */}
            <div className="mt-3 pt-2 border-t border-[#262626]">
              <span className="text-[10px] font-mono text-gray-500">
                {hotspot.lat.toFixed(2)}°N, {Math.abs(hotspot.lng).toFixed(2)}°
                {hotspot.lng >= 0 ? "E" : "W"}
              </span>
            </div>
          </div>
        </Popup>
      </CircleMarker>
    </>
  );
}
