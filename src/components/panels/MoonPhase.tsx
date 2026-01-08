"use client";

import { useState, useEffect } from "react";
import { Panel } from "@/components/ui/Panel";
import { getMoonPhase, formatPhaseDate } from "@/lib/moon";
import { MoonPhaseData } from "@/types";

export function MoonPhasePanel() {
  const [moonData, setMoonData] = useState<MoonPhaseData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMoonData(getMoonPhase());
  }, []);

  if (!mounted || !moonData) {
    return (
      <Panel title="LUNAR PHASE" loading={true}>
        <div className="h-32" />
      </Panel>
    );
  }

  return (
    <Panel title="LUNAR PHASE">
      <div className="flex flex-col items-center gap-4">
        {/* Moon Visual */}
        <MoonVisual illumination={moonData.illumination} phase={moonData.phase} />

        {/* Phase Info */}
        <div className="text-center">
          <div className="text-lg font-semibold text-amber-400 font-mono">
            {moonData.phase}
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {moonData.illumination}%
          </div>
          <div className="text-xs text-gray-500 font-mono mt-1">
            ILLUMINATED
          </div>
        </div>

        {/* Upcoming Phases */}
        <div className="w-full border-t border-[#1f1f1f] pt-3 mt-2">
          <div className="text-xs text-gray-500 font-mono mb-2 uppercase">
            Upcoming Phases
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <PhaseDate label="New Moon" date={moonData.nextPhases.newMoon} emoji="🌑" />
            <PhaseDate label="First Qtr" date={moonData.nextPhases.firstQuarter} emoji="🌓" />
            <PhaseDate label="Full Moon" date={moonData.nextPhases.fullMoon} emoji="🌕" />
            <PhaseDate label="Last Qtr" date={moonData.nextPhases.lastQuarter} emoji="🌗" />
          </div>
        </div>
      </div>
    </Panel>
  );
}

interface MoonVisualProps {
  illumination: number;
  phase: string;
}

function MoonVisual({ illumination, phase }: MoonVisualProps) {
  // Calculate shadow position based on phase
  const isWaxing = phase.includes("Waxing") || phase === "First Quarter";
  const isWaning = phase.includes("Waning") || phase === "Last Quarter";
  const isNew = phase === "New Moon";
  const isFull = phase === "Full Moon";

  // Shadow width based on illumination
  const shadowWidth = isFull ? 0 : isNew ? 100 : Math.abs(100 - illumination * 2);

  return (
    <div className="relative">
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, rgba(255,255,255,${illumination / 400}) 0%, transparent 70%)`,
          transform: "scale(1.5)",
        }}
      />

      {/* Moon body */}
      <svg width="100" height="100" viewBox="0 0 100 100" className="relative z-10">
        <defs>
          {/* Moon surface gradient */}
          <radialGradient id="moonGradient" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#f5f5f5" />
            <stop offset="50%" stopColor="#d4d4d4" />
            <stop offset="100%" stopColor="#a3a3a3" />
          </radialGradient>

          {/* Shadow clip path */}
          <clipPath id="moonClip">
            <circle cx="50" cy="50" r="48" />
          </clipPath>
        </defs>

        {/* Moon base */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="url(#moonGradient)"
          className="drop-shadow-lg"
        />

        {/* Crater details */}
        <g opacity="0.3" clipPath="url(#moonClip)">
          <circle cx="30" cy="35" r="8" fill="#9a9a9a" />
          <circle cx="65" cy="25" r="5" fill="#9a9a9a" />
          <circle cx="45" cy="60" r="10" fill="#9a9a9a" />
          <circle cx="70" cy="55" r="6" fill="#9a9a9a" />
          <circle cx="25" cy="65" r="4" fill="#9a9a9a" />
        </g>

        {/* Shadow overlay */}
        {!isFull && (
          <g clipPath="url(#moonClip)">
            {isNew ? (
              // New moon - full shadow
              <circle cx="50" cy="50" r="48" fill="#0a0a0a" />
            ) : isWaxing ? (
              // Waxing - shadow on left
              <ellipse
                cx={50 - (shadowWidth / 100) * 48}
                cy="50"
                rx={(shadowWidth / 100) * 48}
                ry="48"
                fill="#0a0a0a"
              />
            ) : isWaning ? (
              // Waning - shadow on right
              <ellipse
                cx={50 + (shadowWidth / 100) * 48}
                cy="50"
                rx={(shadowWidth / 100) * 48}
                ry="48"
                fill="#0a0a0a"
              />
            ) : null}
          </g>
        )}
      </svg>
    </div>
  );
}

interface PhaseDateProps {
  label: string;
  date: Date;
  emoji: string;
}

function PhaseDate({ label, date, emoji }: PhaseDateProps) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <span>{emoji}</span>
      <span className="text-gray-500">{label}:</span>
      <span className="text-amber-400">{formatPhaseDate(date)}</span>
    </div>
  );
}
