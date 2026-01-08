"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import type { ThreatLevel } from "@/types";
import "leaflet/dist/leaflet.css";

interface HotspotData {
  id: string;
  name: string;
  label?: string;
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
    // Enable scroll zoom by default
    map.scrollWheelZoom.enable();
  }, [map]);

  return null;
}

// Create a custom div icon for labeled markers
function createLabeledIcon(name: string, color: string, isHighPriority: boolean) {
  const size = isHighPriority ? 10 : 8;
  const pulseRing = isHighPriority
    ? `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:24px;height:24px;border-radius:50%;border:1px dashed ${color};opacity:0.5;animation:pulse 2s infinite;"></div>`
    : '';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        ${pulseRing}
        <div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;box-shadow:0 0 8px ${color};border:1px solid rgba(255,255,255,0.3);"></div>
        <div style="margin-top:4px;font-family:monospace;font-size:9px;font-weight:bold;color:#f5f5f5;text-shadow:0 0 3px #000,0 0 6px #000;white-space:nowrap;letter-spacing:0.5px;">${name}</div>
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 5],
  });
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

        {/* Grid overlay */}
        <GridOverlay />

        {/* Hotspot markers with labels */}
        {hotspots.map((hotspot) => (
          <HotspotMarker key={hotspot.id} hotspot={hotspot} />
        ))}
      </MapContainer>
    </div>
  );
}

// Grid overlay component for lat/lng lines
function GridOverlay() {
  const map = useMap();

  useEffect(() => {
    // Create grid lines using SVG overlay
    const gridPane = map.createPane('grid');
    gridPane.style.zIndex = '250';
    gridPane.style.pointerEvents = 'none';

    // Add lat/lng labels around the edges
    const latLabels = [-60, -30, 0, 30, 60];
    const lngLabels = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];

    const markers: L.Marker[] = [];

    // Latitude labels on left edge
    latLabels.forEach(lat => {
      const icon = L.divIcon({
        className: 'coord-label',
        html: `<span style="font-family:monospace;font-size:8px;color:#4a4a4a;">${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}</span>`,
        iconSize: [30, 12],
        iconAnchor: [15, 6],
      });
      const marker = L.marker([lat, -175], { icon, interactive: false, pane: 'grid' }).addTo(map);
      markers.push(marker);
    });

    // Longitude labels on bottom edge
    lngLabels.forEach(lng => {
      const icon = L.divIcon({
        className: 'coord-label',
        html: `<span style="font-family:monospace;font-size:8px;color:#4a4a4a;">${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}</span>`,
        iconSize: [30, 12],
        iconAnchor: [15, 6],
      });
      const marker = L.marker([-75, lng], { icon, interactive: false, pane: 'grid' }).addTo(map);
      markers.push(marker);
    });

    return () => {
      markers.forEach(m => m.remove());
    };
  }, [map]);

  return null;
}

function HotspotMarker({ hotspot }: { hotspot: HotspotData }) {
  const color = STATUS_COLORS[hotspot.status];
  const isHighPriority = hotspot.status === "high" || hotspot.status === "critical";
  const icon = createLabeledIcon(hotspot.name, color, isHighPriority);

  return (
    <Marker
      position={[hotspot.lat, hotspot.lng]}
      icon={icon}
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

          {/* Label/Description */}
          {hotspot.label && (
            <div className="text-xs text-gray-400 font-mono mb-2">
              {hotspot.label}
            </div>
          )}

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
              {hotspot.lat.toFixed(2)}°{hotspot.lat >= 0 ? 'N' : 'S'}, {Math.abs(hotspot.lng).toFixed(2)}°
              {hotspot.lng >= 0 ? "E" : "W"}
            </span>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
