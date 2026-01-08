"use client";

import { useEffect, useState } from "react";
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

// Connection lines between hotspots
type ConnectionType = "alliance" | "tension" | "conflict";

interface Connection {
  from: string;
  to: string;
  type: ConnectionType;
}

const CONNECTIONS: Connection[] = [
  { from: "dc", to: "brussels", type: "alliance" },
  { from: "dc", to: "telaviv", type: "alliance" },
  { from: "moscow", to: "kyiv", type: "conflict" },
  { from: "beijing", to: "taipei", type: "tension" },
  { from: "tehran", to: "hormuz", type: "tension" },
];

const CONNECTION_COLORS: Record<ConnectionType, string> = {
  alliance: "#06b6d4",
  tension: "#f59e0b",
  conflict: "#ef4444",
};

function MapController({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMap();

  useEffect(() => {
    map.scrollWheelZoom.enable();
    map.zoomControl.setPosition('topleft');

    // Initial zoom
    onZoomChange(map.getZoom());

    // Listen to zoom changes
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on('zoomend', handleZoom);

    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}

// Create pulsing marker with glow effect - showLabel controls visibility
function createPulsingIcon(name: string, color: string, status: ThreatLevel, showLabel: boolean) {
  const isCritical = status === "critical";
  const isHigh = status === "high" || status === "critical";
  const pulseSpeed = PULSE_SPEEDS[status];

  const criticalRing = isCritical
    ? `<div class="marker-pulse-ring" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;border:1px solid ${color};opacity:0;animation:pulse-ring ${pulseSpeed} ease-out infinite 0.5s;"></div>`
    : '';

  const labelHtml = showLabel
    ? `<div class="marker-label" style="position:absolute;top:100%;left:50%;transform:translateX(-50%);margin-top:6px;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:600;color:#e5e5e5;text-shadow:0 0 4px #000,0 0 8px #000,0 2px 4px rgba(0,0,0,0.8);white-space:nowrap;letter-spacing:1px;text-transform:uppercase;">${name}</div>`
    : '';

  return L.divIcon({
    className: 'custom-marker-container',
    html: `
      <div class="hotspot-marker" data-status="${status}">
        <div class="marker-pulse-ring" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;border-radius:50%;border:2px solid ${color};opacity:0;animation:pulse-ring ${pulseSpeed} ease-out infinite;"></div>
        ${criticalRing}
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:${color};filter:blur(6px);opacity:0.4;"></div>
        <div class="marker-dot" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:${isHigh ? 10 : 8}px;height:${isHigh ? 10 : 8}px;background:${color};border-radius:50%;box-shadow:0 0 8px ${color}, 0 0 16px ${color}40;border:2px solid rgba(255,255,255,0.3);transition:transform 0.2s ease;"></div>
        ${labelHtml}
      </div>
    `,
    iconSize: [80, 60],
    iconAnchor: [40, 25],
  });
}

export default function MapClient({ hotspots }: MapClientProps) {
  const [zoomLevel, setZoomLevel] = useState(2);
  const [showConnections, setShowConnections] = useState(false);

  const showLabels = zoomLevel >= 4;

  // Build lookup for hotspot coordinates
  const hotspotCoords: Record<string, [number, number]> = {};
  hotspots.forEach(h => {
    hotspotCoords[h.id] = [h.lat, h.lng];
  });

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
          <MapController onZoomChange={setZoomLevel} />

          {/* Dark tile layer WITH labels for detail when zoomed in */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution=""
            noWrap={true}
            bounds={[[-90, -180], [90, 180]]}
          />

          {/* Grid overlay */}
          <GridOverlay />

          {/* Connection lines */}
          {showConnections && CONNECTIONS.map((conn, idx) => {
            const from = hotspotCoords[conn.from];
            const to = hotspotCoords[conn.to];
            if (!from || !to) return null;

            return (
              <Polyline
                key={idx}
                positions={[from, to]}
                pathOptions={{
                  color: CONNECTION_COLORS[conn.type],
                  weight: 2,
                  opacity: 0.25,
                  dashArray: conn.type === "alliance" ? undefined : "8, 8",
                }}
              />
            );
          })}

          {/* Hotspot markers */}
          {hotspots.map((hotspot) => (
            <HotspotMarker key={hotspot.id} hotspot={hotspot} showLabel={showLabels} />
          ))}
        </MapContainer>
      </div>

      {/* Connections Toggle - Bottom Left */}
      <div className="absolute bottom-3 left-3 z-[1000]">
        <div className="bg-[#0a0a0a]/95 border border-amber-500/30 rounded backdrop-blur-sm">
          <button
            onClick={() => setShowConnections(!showConnections)}
            className="flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider transition-colors"
          >
            <div
              className={`w-3 h-3 rounded-sm border transition-colors ${
                showConnections
                  ? 'bg-amber-500 border-amber-500'
                  : 'bg-transparent border-gray-500'
              }`}
            >
              {showConnections && (
                <svg className="w-3 h-3 text-black" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 6l3 3 5-6" />
                </svg>
              )}
            </div>
            <span className={showConnections ? 'text-amber-500' : 'text-gray-400'}>
              Connections
            </span>
          </button>

          {/* Connection Legend */}
          {showConnections && (
            <div className="border-t border-amber-500/20 px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-cyan-500"></div>
                <span className="text-[9px] font-mono text-gray-400">Alliance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-amber-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)' }}></div>
                <span className="text-[9px] font-mono text-gray-400">Tension</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #ef4444 0, #ef4444 3px, transparent 3px, transparent 6px)' }}></div>
                <span className="text-[9px] font-mono text-gray-400">Conflict</span>
              </div>
            </div>
          )}
        </div>
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

function HotspotMarker({ hotspot, showLabel }: { hotspot: HotspotData; showLabel: boolean }) {
  const color = STATUS_COLORS[hotspot.status];
  const icon = createPulsingIcon(hotspot.name, color, hotspot.status, showLabel);

  return (
    <Marker
      position={[hotspot.lat, hotspot.lng]}
      icon={icon}
    >
      <Popup className="command-popup">
        <div className="popup-content">
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

          {hotspot.label && (
            <div className="popup-sublabel">{hotspot.label}</div>
          )}

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

          <div className="popup-coords">
            <span className="coords-icon">◎</span>
            {hotspot.lat.toFixed(2)}°{hotspot.lat >= 0 ? 'N' : 'S'}, {Math.abs(hotspot.lng).toFixed(2)}°{hotspot.lng >= 0 ? 'E' : 'W'}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
