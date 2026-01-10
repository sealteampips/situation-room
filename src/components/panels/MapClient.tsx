"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Popup, useMap, Marker, Polyline, CircleMarker } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import type { ThreatLevel } from "@/types";
import "leaflet/dist/leaflet.css";

// Layer types
type MapLayer = "hotspots" | "bases" | "foreign" | "nuclear";

// Foreign base country types
type ForeignCountry = "Russia" | "China" | "UK" | "France" | "India";

// Nuclear country types
type NuclearCountry = "US" | "Russia" | "China" | "Others";
type NuclearCountryFull = "US" | "Russia" | "China" | "UK" | "France" | "Israel" | "Pakistan" | "India" | "North Korea";

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

interface MilitaryBase {
  name: string;
  lat: number;
  lng: number;
  state?: string;
  country?: string;
  branch?: string;
}

interface ForeignMilitaryBase {
  name: string;
  lat: number;
  lng: number;
  country: ForeignCountry;
  hostNation: string;
  type: string;
}

interface NuclearSite {
  name: string;
  lat: number;
  lng: number;
  country: NuclearCountryFull;
  type: string;
  details?: string;
  warheads?: string;
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

// Country colors for foreign bases
const COUNTRY_COLORS: Record<ForeignCountry, string> = {
  Russia: "#ef4444",      // Red
  China: "#eab308",       // Yellow/Gold
  UK: "#3b82f6",          // Blue
  France: "#06b6d4",      // Cyan
  India: "#f97316",       // Orange
};

// Nuclear country colors
const NUCLEAR_COUNTRY_COLORS: Record<NuclearCountryFull, string> = {
  US: "#3b82f6",          // Blue
  Russia: "#ef4444",      // Red
  China: "#eab308",       // Yellow/Gold
  UK: "#60a5fa",          // Light Blue
  France: "#06b6d4",      // Cyan
  Israel: "#a855f7",      // Purple
  Pakistan: "#22c55e",    // Green
  India: "#f97316",       // Orange
  "North Korea": "#ec4899", // Pink
};

// Country flags for UI
const COUNTRY_FLAGS: Record<ForeignCountry, string> = {
  Russia: "🇷🇺",
  China: "🇨🇳",
  UK: "🇬🇧",
  France: "🇫🇷",
  India: "🇮🇳",
};

// Nuclear country flags
const NUCLEAR_COUNTRY_FLAGS: Record<NuclearCountryFull, string> = {
  US: "🇺🇸",
  Russia: "🇷🇺",
  China: "🇨🇳",
  UK: "🇬🇧",
  France: "🇫🇷",
  Israel: "🇮🇱",
  Pakistan: "🇵🇰",
  India: "🇮🇳",
  "North Korea": "🇰🇵",
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

// "Others" countries for nuclear filter
const OTHERS_COUNTRIES: NuclearCountryFull[] = ["UK", "France", "Israel", "Pakistan", "India", "North Korea"];

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

// Custom cluster icon for military bases
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 30;
  let className = "cluster-small";

  if (count > 50) {
    size = 45;
    className = "cluster-large";
  } else if (count > 20) {
    size = 38;
    className = "cluster-medium";
  }

  return L.divIcon({
    html: `<div class="military-cluster ${className}"><span>${count}</span></div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(size, size),
  });
}

// Custom cluster icon for foreign bases (multi-colored)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createForeignClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 28;
  let className = "cluster-small";

  if (count > 30) {
    size = 40;
    className = "cluster-large";
  } else if (count > 15) {
    size = 34;
    className = "cluster-medium";
  }

  return L.divIcon({
    html: `<div class="foreign-cluster ${className}"><span>${count}</span></div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(size, size),
  });
}

// Custom cluster icon for nuclear sites
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createNuclearClusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  let size = 32;
  let className = "cluster-small";

  if (count > 20) {
    size = 44;
    className = "cluster-large";
  } else if (count > 10) {
    size = 38;
    className = "cluster-medium";
  }

  return L.divIcon({
    html: `<div class="nuclear-cluster ${className}"><span>☢️ ${count}</span></div>`,
    className: "custom-cluster-icon",
    iconSize: L.point(size, size),
  });
}

export default function MapClient({ hotspots }: MapClientProps) {
  const [zoomLevel, setZoomLevel] = useState(2);
  const [showConnections, setShowConnections] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapLayer>("hotspots");
  const [militaryBases, setMilitaryBases] = useState<MilitaryBase[]>([]);
  const [foreignBases, setForeignBases] = useState<ForeignMilitaryBase[]>([]);
  const [nuclearSites, setNuclearSites] = useState<NuclearSite[]>([]);
  const [basesLoading, setBasesLoading] = useState(false);
  const [foreignLoading, setForeignLoading] = useState(false);
  const [nuclearLoading, setNuclearLoading] = useState(false);

  // Country filter state - all on by default
  const [countryFilters, setCountryFilters] = useState<Record<ForeignCountry, boolean>>({
    Russia: true,
    China: true,
    UK: true,
    France: true,
    India: true,
  });

  // Nuclear country filter state - all on by default
  const [nuclearFilters, setNuclearFilters] = useState<Record<NuclearCountry, boolean>>({
    US: true,
    Russia: true,
    China: true,
    Others: true,
  });

  const showLabels = zoomLevel >= 4;

  // Fetch military bases when layer is activated
  const fetchMilitaryBases = useCallback(async () => {
    if (militaryBases.length > 0) return; // Already loaded

    setBasesLoading(true);
    try {
      const response = await fetch("/api/military-bases");
      const data = await response.json();
      if (data.bases) {
        setMilitaryBases(data.bases);
      }
    } catch (error) {
      console.error("Failed to fetch military bases:", error);
    } finally {
      setBasesLoading(false);
    }
  }, [militaryBases.length]);

  // Fetch foreign bases when layer is activated
  const fetchForeignBases = useCallback(async () => {
    if (foreignBases.length > 0) return; // Already loaded

    setForeignLoading(true);
    try {
      const response = await fetch("/api/foreign-bases");
      const data = await response.json();
      if (data.bases) {
        setForeignBases(data.bases);
      }
    } catch (error) {
      console.error("Failed to fetch foreign bases:", error);
    } finally {
      setForeignLoading(false);
    }
  }, [foreignBases.length]);

  // Fetch nuclear sites when layer is activated
  const fetchNuclearSites = useCallback(async () => {
    if (nuclearSites.length > 0) return; // Already loaded

    setNuclearLoading(true);
    try {
      const response = await fetch("/api/nuclear-sites");
      const data = await response.json();
      if (data.sites) {
        setNuclearSites(data.sites);
      }
    } catch (error) {
      console.error("Failed to fetch nuclear sites:", error);
    } finally {
      setNuclearLoading(false);
    }
  }, [nuclearSites.length]);

  // Load data when switching to that layer
  useEffect(() => {
    if (activeLayer === "bases") {
      fetchMilitaryBases();
    } else if (activeLayer === "foreign") {
      fetchForeignBases();
    } else if (activeLayer === "nuclear") {
      fetchNuclearSites();
    }
  }, [activeLayer, fetchMilitaryBases, fetchForeignBases, fetchNuclearSites]);

  // Filter foreign bases by selected countries
  const filteredForeignBases = foreignBases.filter(base => countryFilters[base.country]);

  // Filter nuclear sites by selected countries
  const filteredNuclearSites = nuclearSites.filter(site => {
    if (site.country === "US") return nuclearFilters.US;
    if (site.country === "Russia") return nuclearFilters.Russia;
    if (site.country === "China") return nuclearFilters.China;
    // Others: UK, France, Israel, Pakistan, India, North Korea
    if (OTHERS_COUNTRIES.includes(site.country)) return nuclearFilters.Others;
    return true;
  });

  // Toggle country filter
  const toggleCountry = (country: ForeignCountry) => {
    setCountryFilters(prev => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  // Toggle nuclear filter
  const toggleNuclearFilter = (country: NuclearCountry) => {
    setNuclearFilters(prev => ({
      ...prev,
      [country]: !prev[country],
    }));
  };

  // Build lookup for hotspot coordinates
  const hotspotCoords: Record<string, [number, number]> = {};
  hotspots.forEach(h => {
    hotspotCoords[h.id] = [h.lat, h.lng];
  });

  // Mobile: center on US, Desktop: center on Europe/Middle East
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const defaultCenter: [number, number] = isMobile ? [39, -98] : [25, 20];
  const defaultZoom = isMobile ? 3 : 2;

  const handleLayerChange = (layer: MapLayer) => {
    setActiveLayer(layer);
  };

  return (
    <div className="map-wrapper">
      {/* Scanline overlay */}
      <div className="map-scanlines" />

      {/* Vignette overlay */}
      <div className="map-vignette" />

      <div className="map-container">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
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

          {/* Connection lines - only show on hotspots layer */}
          {activeLayer === "hotspots" && showConnections && CONNECTIONS.map((conn, idx) => {
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

          {/* Hotspot markers - only on hotspots layer */}
          {activeLayer === "hotspots" && hotspots.map((hotspot) => (
            <HotspotMarker key={hotspot.id} hotspot={hotspot} showLabel={showLabels} />
          ))}

          {/* US Military bases layer with clustering */}
          {activeLayer === "bases" && militaryBases.length > 0 && (
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterIcon}
              maxClusterRadius={50}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              disableClusteringAtZoom={7}
            >
              {militaryBases.map((base, idx) => (
                <MilitaryBaseMarker key={`base-${idx}`} base={base} />
              ))}
            </MarkerClusterGroup>
          )}

          {/* Foreign military bases layer with clustering */}
          {activeLayer === "foreign" && filteredForeignBases.length > 0 && (
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createForeignClusterIcon}
              maxClusterRadius={40}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              disableClusteringAtZoom={6}
            >
              {filteredForeignBases.map((base, idx) => (
                <ForeignBaseMarker key={`foreign-${idx}`} base={base} />
              ))}
            </MarkerClusterGroup>
          )}

          {/* Nuclear sites layer with clustering */}
          {activeLayer === "nuclear" && filteredNuclearSites.length > 0 && (
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createNuclearClusterIcon}
              maxClusterRadius={35}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              disableClusteringAtZoom={5}
            >
              {filteredNuclearSites.map((site, idx) => (
                <NuclearSiteMarker key={`nuclear-${idx}`} site={site} />
              ))}
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </div>

      {/* Layer Toggle - Bottom Center */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="flex flex-col items-center gap-2">
          {/* Country filters - only visible when Foreign layer active */}
          {activeLayer === "foreign" && (
            <div className="bg-[#0a0a0a]/95 border border-gray-500/30 rounded backdrop-blur-sm flex gap-0.5 px-1 py-1 overflow-x-auto max-w-[90vw] scrollbar-hide">
              {(Object.keys(countryFilters) as ForeignCountry[]).map((country) => (
                <CountryFilterButton
                  key={country}
                  country={country}
                  active={countryFilters[country]}
                  onClick={() => toggleCountry(country)}
                />
              ))}
            </div>
          )}

          {/* Nuclear country filters - only visible when Nuclear layer active */}
          {activeLayer === "nuclear" && (
            <div className="bg-[#0a0a0a]/95 border border-yellow-500/30 rounded backdrop-blur-sm flex gap-0.5 px-1 py-1 overflow-x-auto max-w-[90vw] scrollbar-hide">
              <NuclearFilterButton
                code="US"
                flag="🇺🇸"
                active={nuclearFilters.US}
                onClick={() => toggleNuclearFilter("US")}
                color="#3b82f6"
              />
              <NuclearFilterButton
                code="RU"
                flag="🇷🇺"
                active={nuclearFilters.Russia}
                onClick={() => toggleNuclearFilter("Russia")}
                color="#ef4444"
              />
              <NuclearFilterButton
                code="CN"
                flag="🇨🇳"
                active={nuclearFilters.China}
                onClick={() => toggleNuclearFilter("China")}
                color="#eab308"
              />
              <NuclearFilterButton
                code="Other"
                flag="🌐"
                active={nuclearFilters.Others}
                onClick={() => toggleNuclearFilter("Others")}
                color="#9ca3af"
              />
            </div>
          )}

          {/* Main layer toggle */}
          <div className="bg-[#0a0a0a]/95 border border-amber-500/30 rounded backdrop-blur-sm flex">
            <LayerButton
              active={activeLayer === "hotspots"}
              onClick={() => handleLayerChange("hotspots")}
              icon="🔴"
              label="Hotspots"
            />
            <div className="w-px bg-amber-500/20" />
            <LayerButton
              active={activeLayer === "bases"}
              onClick={() => handleLayerChange("bases")}
              icon="🇺🇸"
              label="US Bases"
              loading={activeLayer === "bases" && basesLoading}
            />
            <div className="w-px bg-amber-500/20" />
            <LayerButton
              active={activeLayer === "foreign"}
              onClick={() => handleLayerChange("foreign")}
              icon="🌍"
              label="Foreign"
              loading={activeLayer === "foreign" && foreignLoading}
            />
            <div className="w-px bg-amber-500/20" />
            <LayerButton
              active={activeLayer === "nuclear"}
              onClick={() => handleLayerChange("nuclear")}
              icon="☢️"
              label="Nuclear"
              loading={activeLayer === "nuclear" && nuclearLoading}
            />
          </div>
        </div>
      </div>

      {/* Connections Toggle - Bottom Left (only show on hotspots layer) */}
      {activeLayer === "hotspots" && (
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
      )}

      {/* Bases count indicator - Bottom Left when on bases layer */}
      {activeLayer === "bases" && (
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="bg-[#0a0a0a]/95 border border-blue-500/30 rounded backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2">
            <div className="text-[10px] font-mono text-gray-400">
              <span className="text-blue-400">{militaryBases.length}</span>
              <span className="hidden md:inline"> installations loaded</span>
            </div>
            <div className="hidden md:block text-[9px] font-mono text-gray-500 mt-0.5">
              TOP SECRET // NOFORN
            </div>
          </div>
        </div>
      )}

      {/* Foreign bases count indicator - Bottom Left when on foreign layer */}
      {activeLayer === "foreign" && (
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="bg-[#0a0a0a]/95 border border-gray-500/30 rounded backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2">
            <div className="text-[10px] font-mono text-gray-400">
              <span className="text-gray-300">{filteredForeignBases.length}</span>
              <span className="hidden md:inline"> / {foreignBases.length} bases shown</span>
              <span className="md:hidden">/{foreignBases.length}</span>
            </div>
            <div className="hidden md:block text-[9px] font-mono text-gray-500 mt-0.5">
              OSINT // UNCLASSIFIED
            </div>
          </div>
        </div>
      )}

      {/* Nuclear sites count indicator - Bottom Left when on nuclear layer */}
      {activeLayer === "nuclear" && (
        <div className="absolute bottom-3 left-3 z-[1000]">
          <div className="bg-[#0a0a0a]/95 border border-yellow-500/30 rounded backdrop-blur-sm px-2 md:px-3 py-1.5 md:py-2">
            <div className="text-[10px] font-mono text-gray-400">
              <span className="text-yellow-400">{filteredNuclearSites.length}</span>
              <span className="hidden md:inline"> / {nuclearSites.length} sites shown</span>
              <span className="md:hidden">/{nuclearSites.length}</span>
            </div>
            <div className="hidden md:block text-[9px] font-mono text-yellow-600 mt-0.5">
              ☢️ NUCLEAR FORCES // RESTRICTED
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Country codes for mobile display
const COUNTRY_CODES: Record<ForeignCountry, string> = {
  Russia: "RU",
  China: "CN",
  UK: "UK",
  France: "FR",
  India: "IN",
};

// Country filter button component
interface CountryFilterButtonProps {
  country: ForeignCountry;
  active: boolean;
  onClick: () => void;
}

function CountryFilterButton({ country, active, onClick }: CountryFilterButtonProps) {
  const color = COUNTRY_COLORS[country];
  const flag = COUNTRY_FLAGS[country];
  const code = COUNTRY_CODES[country];

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-1 text-[8px] md:text-[9px] font-mono rounded transition-all whitespace-nowrap ${
        active
          ? "opacity-100"
          : "opacity-40 hover:opacity-60"
      }`}
      style={{
        backgroundColor: active ? `${color}20` : "transparent",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: active ? `${color}60` : "transparent",
      }}
    >
      <span className="hidden md:inline">{flag}</span>
      <span style={{ color: active ? color : "#6b7280" }}>
        <span className="md:hidden">{code}</span>
        <span className="hidden md:inline">{country}</span>
      </span>
    </button>
  );
}

// Nuclear filter button component
interface NuclearFilterButtonProps {
  code: string;
  flag: string;
  active: boolean;
  onClick: () => void;
  color: string;
}

function NuclearFilterButton({ code, flag, active, onClick, color }: NuclearFilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-0.5 md:gap-1 px-1.5 md:px-2 py-1 text-[8px] md:text-[9px] font-mono rounded transition-all whitespace-nowrap ${
        active
          ? "opacity-100"
          : "opacity-40 hover:opacity-60"
      }`}
      style={{
        backgroundColor: active ? `${color}20` : "transparent",
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: active ? `${color}60` : "transparent",
        color: active ? color : "#6b7280",
      }}
    >
      <span className="hidden md:inline">{flag}</span>
      <span>{code}</span>
    </button>
  );
}

// Layer toggle button component
interface LayerButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  disabled?: boolean;
  loading?: boolean;
}

function LayerButton({ active, onClick, icon, label, disabled, loading }: LayerButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 md:py-2 text-[10px] font-mono uppercase tracking-wider transition-colors ${
        disabled
          ? "text-gray-600 cursor-not-allowed"
          : active
          ? "text-amber-400 bg-amber-500/10"
          : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
      }`}
    >
      <span>{icon}</span>
      <span className="hidden md:inline">{label}</span>
      {disabled && <span className="hidden md:inline text-[8px] text-gray-600">(soon)</span>}
      {loading && (
        <div className="w-2 h-2 border border-amber-500 border-t-transparent rounded-full animate-spin" />
      )}
    </button>
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

function MilitaryBaseMarker({ base }: { base: MilitaryBase }) {
  return (
    <CircleMarker
      center={[base.lat, base.lng]}
      radius={5}
      pathOptions={{
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.7,
        weight: 1,
      }}
    >
      <Popup className="command-popup">
        <div className="popup-content">
          <div className="popup-header">
            <div className="popup-title" style={{ color: "#3b82f6" }}>{base.name}</div>
          </div>

          {base.branch && (
            <div className="popup-sublabel">{base.branch}</div>
          )}

          <div className="popup-coords" style={{ marginTop: "8px" }}>
            <span className="coords-icon">◎</span>
            {base.state ? `${base.state}, ` : ""}{base.country || "USA"}
          </div>

          <div className="popup-coords">
            {base.lat.toFixed(2)}°{base.lat >= 0 ? 'N' : 'S'}, {Math.abs(base.lng).toFixed(2)}°{base.lng >= 0 ? 'E' : 'W'}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function ForeignBaseMarker({ base }: { base: ForeignMilitaryBase }) {
  const color = COUNTRY_COLORS[base.country];
  const flag = COUNTRY_FLAGS[base.country];

  return (
    <CircleMarker
      center={[base.lat, base.lng]}
      radius={4}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: 0.8,
        weight: 1,
      }}
    >
      <Popup className="command-popup">
        <div className="popup-content">
          <div className="popup-header" style={{ backgroundColor: `${color}15` }}>
            <span className="text-lg">{flag}</span>
            <div className="popup-title" style={{ color: color }}>{base.name}</div>
          </div>

          <div className="popup-sublabel">{base.type}</div>

          <div className="px-3 py-2 border-t border-[#1f1f1f]">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-gray-500">Operator:</span>
              <span style={{ color: color }}>{base.country}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono mt-1">
              <span className="text-gray-500">Host:</span>
              <span className="text-gray-300">{base.hostNation}</span>
            </div>
          </div>

          <div className="popup-coords">
            <span className="coords-icon">◎</span>
            {base.lat.toFixed(2)}°{base.lat >= 0 ? 'N' : 'S'}, {Math.abs(base.lng).toFixed(2)}°{base.lng >= 0 ? 'E' : 'W'}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

function NuclearSiteMarker({ site }: { site: NuclearSite }) {
  const color = NUCLEAR_COUNTRY_COLORS[site.country];
  const flag = NUCLEAR_COUNTRY_FLAGS[site.country];

  // Larger radius for major sites
  const isMajor = site.type === "ICBM" || site.type === "SLBM" || site.type === "Production";
  const radius = isMajor ? 6 : 4;

  return (
    <CircleMarker
      center={[site.lat, site.lng]}
      radius={radius}
      pathOptions={{
        color: "#fbbf24",
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2,
      }}
    >
      <Popup className="command-popup">
        <div className="popup-content">
          <div className="popup-header" style={{ backgroundColor: "rgba(251, 191, 36, 0.15)" }}>
            <span className="text-lg">{flag}</span>
            <div className="popup-title" style={{ color: "#fbbf24" }}>{site.name}</div>
          </div>

          <div className="popup-sublabel" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: "#fbbf24" }}>☢️</span>
            {site.type}
          </div>

          <div className="px-3 py-2 border-t border-[#1f1f1f]">
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-gray-500">Country:</span>
              <span style={{ color: color }}>{site.country}</span>
            </div>
            {site.details && (
              <div className="text-[10px] font-mono text-gray-400 mt-1.5 leading-relaxed">
                {site.details}
              </div>
            )}
            {site.warheads && (
              <div className="flex items-center gap-2 text-[11px] font-mono mt-1.5">
                <span className="text-gray-500">Est. Warheads:</span>
                <span className="text-yellow-400">{site.warheads}</span>
              </div>
            )}
          </div>

          <div className="popup-coords">
            <span className="coords-icon">◎</span>
            {site.lat.toFixed(2)}°{site.lat >= 0 ? 'N' : 'S'}, {Math.abs(site.lng).toFixed(2)}°{site.lng >= 0 ? 'E' : 'W'}
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
}
