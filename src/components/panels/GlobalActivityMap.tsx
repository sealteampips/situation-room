"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { ThreatLevel, NewsItem } from "@/types";
import { MAP_HOTSPOTS, SITUATION_TRACKERS } from "@/lib/constants";
import { filterNewsForSituation } from "@/lib/rss";

// Dynamically import the map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("./MapClient"), {
  ssr: false,
  loading: () => (
    <div className="map-wrapper">
      <div className="map-container bg-[#080808] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-2 border-amber-500/30 rounded-full animate-ping" />
            <div className="absolute inset-2 border-2 border-amber-500/50 rounded-full animate-pulse" />
            <div className="absolute inset-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="text-xs text-amber-500/80 font-mono tracking-widest">INITIALIZING GLOBAL MONITOR</div>
          <div className="text-[10px] text-gray-500 font-mono mt-1">Loading satellite feed...</div>
        </div>
      </div>
    </div>
  ),
});

interface GlobalActivityMapProps {
  allNews: NewsItem[];
}

export function GlobalActivityMap({ allNews }: GlobalActivityMapProps) {
  // Calculate hotspot data with threat levels and relevant headlines
  const hotspotsWithData = useMemo(() => {
    return MAP_HOTSPOTS.map((hotspot) => {
      // Find matching situation tracker
      const situation = SITUATION_TRACKERS.find((s) => s.id === hotspot.situationId);
      const status: ThreatLevel = situation?.status || "low";

      // Get relevant headlines for this hotspot
      let headlines: string[] = [];
      if (situation) {
        const relevantNews = filterNewsForSituation(allNews, situation.keywords);
        headlines = relevantNews.slice(0, 5).map((n) => n.title);
      }

      return {
        id: hotspot.id,
        name: hotspot.name,
        label: hotspot.label,
        lat: hotspot.lat,
        lng: hotspot.lng,
        situationId: hotspot.situationId,
        status,
        headlines,
      };
    });
  }, [allNews]);

  // Count active situations by threat level
  const threatCounts = useMemo(() => {
    const counts = { low: 0, elevated: 0, high: 0, critical: 0 };
    hotspotsWithData.forEach(h => counts[h.status]++);
    return counts;
  }, [hotspotsWithData]);

  return (
    <div className="relative">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3 gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <h2 className="text-sm font-bold tracking-widest text-amber-500 font-mono uppercase">
            GLOBAL ACTIVITY MONITOR
          </h2>
        </div>

        {/* Center: Threat Legend - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1 bg-[#0a0a0a]/80 border border-amber-500/20 rounded">
          <span className="text-[9px] font-mono text-amber-500/80 uppercase tracking-wider font-semibold">
            Threat
          </span>
          <LegendItem color="#22c55e" label="Low" />
          <LegendItem color="#f59e0b" label="Elevated" />
          <LegendItem color="#f97316" label="High" />
          <LegendItem color="#ef4444" label="Critical" />
        </div>

        {/* Right: Monitor Count */}
        <div className="text-[10px] font-mono text-gray-500 shrink-0">
          <span className="hidden sm:inline">{hotspotsWithData.length} ACTIVE MONITORS</span>
          <span className="sm:hidden">{hotspotsWithData.length} MONITORS</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapComponent hotspots={hotspotsWithData} />

        {/* Classification Badge - Top Left (hidden on mobile) */}
        <div className="hidden md:block absolute top-3 left-14 z-[1000]">
          <div className="bg-[#0a0a0a]/95 border border-amber-500/30 rounded px-3 py-1.5 backdrop-blur-sm">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider">
              CLASSIFICATION: <span className="text-green-500 font-semibold">OSINT</span>
            </span>
          </div>
        </div>

        {/* Timestamp - Bottom Right (hidden on mobile) */}
        <div className="hidden md:block absolute bottom-3 right-3 z-[1000]">
          <div className="bg-[#0a0a0a]/95 border border-[#262626] rounded px-2.5 py-1.5 backdrop-blur-sm">
            <div className="text-[9px] font-mono text-gray-500">
              <span className="text-amber-500/60">◉</span> LIVE FEED
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Threat Legend - Below map */}
      <div className="flex md:hidden justify-center mt-3">
        <div className="flex items-center gap-3 px-3 py-1.5 bg-[#0a0a0a]/80 border border-amber-500/20 rounded">
          <span className="text-[9px] font-mono text-amber-500/80 uppercase tracking-wider font-semibold">
            Threat
          </span>
          <LegendItem color="#22c55e" label="Low" />
          <LegendItem color="#f59e0b" label="Elevated" />
          <LegendItem color="#f97316" label="High" />
          <LegendItem color="#ef4444" label="Critical" />
        </div>
      </div>
    </div>
  );
}

interface LegendItemProps {
  color: string;
  label: string;
}

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 4px ${color}`,
        }}
      />
      <span className="text-[10px] font-mono text-gray-300">{label}</span>
    </div>
  );
}

// Static fallback for when there's no data
export function GlobalActivityMapStatic() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-500/50 animate-pulse" />
          <h2 className="text-sm font-bold tracking-widest text-amber-500 font-mono uppercase">
            GLOBAL ACTIVITY MONITOR
          </h2>
        </div>
      </div>
      <div className="map-wrapper">
        <div className="map-container bg-[#080808] flex items-center justify-center">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 border-2 border-amber-500/30 rounded-full animate-ping" />
              <div className="absolute inset-2 border-2 border-amber-500/50 rounded-full animate-pulse" />
              <div className="absolute inset-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-xs text-amber-500/80 font-mono tracking-widest">INITIALIZING</div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">Establishing secure connection...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
