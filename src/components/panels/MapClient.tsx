"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Popup, useMap, Marker, Polyline } from "react-leaflet";
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
  elevated: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

// Animation speeds based on threat level
const PULSE_SPEEDS: Record<ThreatLevel, string> = {
  low: "3s",
  elevated: "2s",
  high: "1.5s",
  critical: "1s",
};

// Connection lines between related hotspots
const CONNECTIONS: Array<{ from: string; to: string; type: 'alliance' | 'conflict' | 'tension' }> = [
  { from: "dc", to: "brussels", type: "alliance" },
  { from: "dc", to: "telaviv", type: "alliance" },
  { from: "moscow", to: "kyiv", type: "conflict" },
  { from: "beijing", to: "taipei", type: "tension" },
  { from: "tehran", to: "hormuz", type: "tension" },
  { from: "tehran", to: "telaviv", type: "conflict" },
];

function MapController() {
  const map = useMap();

  useEffect(() => {
    // Enable scroll zoom
    map.scrollWheelZoom.enable();

    // Move zoom control to left side
    map.zoomControl.setPosition('topleft');
  }, [map]);

  return null;
}

// Create pulsing marker with glow effect
function createPulsingIcon(name: string, color: string, status: ThreatLevel) {
  const isCritical = status === "critical";
  const isHigh = status === "high" || status === "critical";
  const pulseSpeed = PULSE_SPEEDS[status];

  // Double ring for critical status
  const criticalRing = isCritical
    ? `<div class="marker-pulse-ring" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:40px;height:40px;border-radius:50%;border:1px solid ${color};opacity:0;animation:pulse-ring ${pulseSpeed} ease-out infinite 0.5s;"></div>`
    : '';

  return L.divIcon({
    className: 'custom-marker-container',
    html: `
      <div class="hotspot-marker" data-status="${status}">
        <!-- Outer pulse rings -->
        <div class="marker-pulse-ring" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;border-radius:50%;border:2px solid ${color};opacity:0;animation:pulse-ring ${pulseSpeed} ease-out infinite;"></div>
        ${criticalRing}

        <!-- Glow layer -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:${color};filter:blur(8px);opacity:0.4;"></div>

        <!-- Inner solid dot -->
        <div class="marker-dot" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${isHigh ? 12 : 10}px;height:${isHigh ? 12 : 10}px;background:${color};border-radius:50%;box-shadow:0 0 10px ${color}, 0 0 20px ${color}40;border:2px solid rgba(255,255,255,0.3);transition:transform 0.2s ease;"></div>

        <!-- Label -->
        <div class="marker-label" style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:8px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:#e5e5e5;text-shadow:0 0 4px #000,0 0 8px #000,0 2px 4px rgba(0,0,0,0.8);white-space:nowrap;letter-spacing:1px;text-transform:uppercase;">${name}</div>
      </div>
    `,
    iconSize: [80, 50],
    iconAnchor: [40, 20],
  });
}

export default function MapClient({ hotspots }: MapClientProps) {
  // Build connection lines data
  const connectionLines = CONNECTIONS.map(conn => {
    const fromHotspot = hotspots.find(h => h.id === conn.from);
    const toHotspot = hotspots.find(h => h.id === conn.to);
    if (!fromHotspot || !toHotspot) return null;
    return {
      positions: [[fromHotspot.lat, fromHotspot.lng], [toHotspot.lat, toHotspot.lng]] as [number, number][],
      type: conn.type,
    };
  }).filter(Boolean);

  return (
    <div className="map-wrapper">
      {/* Scanline overlay */}
      <div className="map-scanlines" />

      {/* Vignette overlay */}
      <div className="map-vignette" />

      <div className="map-container">
        <MapContainer
          center={[25, 20]}
          zoom={2}
          minZoom={2}
          maxZoom={8}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          attributionControl={false}
          scrollWheelZoom={true}
          worldCopyJump={false}
          maxBoundsViscosity={1.0}
          maxBounds={[[-90, -180], [90, 180]]}
        >
          <MapController />

          {/* Dark tile layer */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution=""
            noWrap={true}
            bounds={[[-90, -180], [90, 180]]}
          />

          {/* Connection lines */}
          {connectionLines.map((line, idx) => line && (
            <Polyline
              key={idx}
              positions={line.positions}
              pathOptions={{
                color: line.type === 'conflict' ? '#ef4444' : line.type === 'tension' ? '#f59e0b' : '#06b6d4',
                weight: 1,
                opacity: 0.25,
                dashArray: '8, 8',
              }}
            />
          ))}

          {/* Grid overlay */}
          <GridOverlay />

          {/* Hotspot markers */}
          {hotspots.map((hotspot) => (
            <HotspotMarker key={hotspot.id} hotspot={hotspot} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

// Grid overlay component
function GridOverlay() {
  const map = useMap();

  useEffect(() => {
    const gridPane = map.createPane('grid');
    gridPane.style.zIndex = '250';
    gridPane.style.pointerEvents = 'none';

    const latLabels = [-60, -30, 0, 30, 60];
    const lngLabels = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];

    const markers: L.Marker[] = [];

    // Latitude labels
    latLabels.forEach(lat => {
      const icon = L.divIcon({
        className: 'coord-label',
        html: `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#3a3a3a;text-shadow:0 0 2px #000;">${Math.abs(lat)}°${lat >= 0 ? 'N' : 'S'}</span>`,
        iconSize: [35, 14],
        iconAnchor: [17, 7],
      });
      const marker = L.marker([lat, -178], { icon, interactive: false, pane: 'grid' }).addTo(map);
      markers.push(marker);
    });

    // Longitude labels
    lngLabels.forEach(lng => {
      const icon = L.divIcon({
        className: 'coord-label',
        html: `<span style="font-family:'JetBrains Mono',monospace;font-size:9px;color:#3a3a3a;text-shadow:0 0 2px #000;">${Math.abs(lng)}°${lng >= 0 ? 'E' : 'W'}</span>`,
        iconSize: [35, 14],
        iconAnchor: [17, 7],
      });
      const marker = L.marker([-85, lng], { icon, interactive: false, pane: 'grid' }).addTo(map);
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
  const icon = createPulsingIcon(hotspot.name, color, hotspot.status);

  return (
    <Marker
      position={[hotspot.lat, hotspot.lng]}
      icon={icon}
    >
      <Popup className="command-popup">
        <div className="popup-content">
          {/* Header */}
          <div className="popup-header">
            <div className="popup-title">{hotspot.name}</div>
            <div
              className="popup-status"
              style={{
                backgroundColor: `${color}20`,
                color: color,
                borderColor: `${color}60`,
              }}
            >
              {hotspot.status}
            </div>
          </div>

          {/* Sublabel */}
          {hotspot.label && (
            <div className="popup-sublabel">{hotspot.label}</div>
          )}

          {/* Headlines */}
          <div className="popup-headlines">
            <div className="popup-headlines-header">RECENT ACTIVITY</div>
            {hotspot.headlines.length > 0 ? (
              hotspot.headlines.slice(0, 5).map((headline, idx) => (
                <div key={idx} className="popup-headline">
                  <span className="headline-bullet">▸</span>
                  {headline}
                </div>
              ))
            ) : (
              <div className="popup-no-data">No recent intelligence</div>
            )}
          </div>

          {/* Coordinates */}
          <div className="popup-coords">
            <span className="coords-icon">◎</span>
            {hotspot.lat.toFixed(2)}°{hotspot.lat >= 0 ? 'N' : 'S'}, {Math.abs(hotspot.lng).toFixed(2)}°{hotspot.lng >= 0 ? 'E' : 'W'}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
