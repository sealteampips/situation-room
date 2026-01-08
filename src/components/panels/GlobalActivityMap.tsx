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
    <div className="map-container bg-[#0d0d0d] flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <div className="text-sm text-gray-400 font-mono">LOADING MAP DATA...</div>
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
        headlines = relevantNews.slice(0, 3).map((n) => n.title);
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

  return (
    <div className="relative">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-widest text-amber-500 font-mono uppercase">
            GLOBAL ACTIVITY MONITOR
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#262626] to-transparent" />
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <MapComponent hotspots={hotspotsWithData} />

        {/* Classification Badge */}
        <div className="absolute top-3 left-3 z-[1000]">
          <div className="bg-[#0d0d0d]/90 border border-[#262626] rounded px-3 py-1.5">
            <span className="text-[10px] font-mono text-gray-400 tracking-wider">
              CLASSIFICATION: <span className="text-green-500">OPEN SOURCE</span>
            </span>
          </div>
        </div>

        {/* Legend - Top Right */}
        <div className="absolute top-3 right-3 z-[1000]">
          <div className="bg-[#0d0d0d]/90 border border-[#262626] rounded px-3 py-2">
            <div className="text-[10px] font-mono text-gray-400 mb-2 uppercase tracking-wider">
              Threat Level
            </div>
            <div className="flex flex-col gap-1.5">
              <LegendItem color="#22c55e" label="Low" />
              <LegendItem color="#eab308" label="Elevated" />
              <LegendItem color="#f97316" label="High" />
              <LegendItem color="#ef4444" label="Critical" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-[11px] font-mono text-gray-300">{label}</span>
    </div>
  );
}

// Static fallback for when there's no data
export function GlobalActivityMapStatic() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold tracking-widest text-amber-500 font-mono uppercase">
          GLOBAL ACTIVITY MONITOR
        </h2>
      </div>
      <div className="map-container bg-[#0d0d0d] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 opacity-30">🌍</div>
          <div className="text-sm text-gray-400 font-mono">INITIALIZING...</div>
        </div>
      </div>
    </div>
  );
}
