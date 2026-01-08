"use client";

import { ThreatLevel } from "@/types";

interface StatusIndicatorProps {
  status: ThreatLevel;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  pulse?: boolean;
}

const STATUS_CONFIG: Record<ThreatLevel, { label: string; color: string; bgColor: string; borderColor: string }> = {
  low: {
    label: "LOW",
    color: "text-green-500",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500",
  },
  elevated: {
    label: "ELEVATED",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500",
  },
  high: {
    label: "HIGH",
    color: "text-orange-500",
    bgColor: "bg-orange-500/20",
    borderColor: "border-orange-500",
  },
  critical: {
    label: "CRITICAL",
    color: "text-red-500",
    bgColor: "bg-red-500/20",
    borderColor: "border-red-500",
  },
};

const SIZE_CONFIG = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export function StatusIndicator({
  status,
  showLabel = true,
  size = "md",
  pulse = true,
}: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={`
          ${SIZE_CONFIG[size]} rounded-full ${config.bgColor} border ${config.borderColor}
          ${pulse && (status === "high" || status === "critical") ? "animate-pulse" : ""}
        `}
      />
      {showLabel && (
        <span className={`text-xs font-mono font-semibold tracking-wider ${config.color}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: ThreatLevel }) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold
        ${config.bgColor} ${config.color} border ${config.borderColor}
      `}
    >
      {config.label}
    </span>
  );
}
