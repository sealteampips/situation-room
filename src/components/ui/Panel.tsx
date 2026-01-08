"use client";

import { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerRight?: ReactNode;
  loading?: boolean;
  error?: string;
  compact?: boolean;
}

export function Panel({
  title,
  children,
  className = "",
  headerRight,
  loading = false,
  error,
  compact = false,
}: PanelProps) {
  return (
    <div
      className={`
        bg-[#111111] border border-[#1f1f1f] rounded-lg overflow-hidden
        ${className}
      `}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#1f1f1f] bg-[#0d0d0d]">
        <h2 className="text-xs font-semibold tracking-wider text-amber-500 uppercase font-mono">
          {title}
        </h2>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>

      {/* Panel Content */}
      <div className={`${compact ? "p-2" : "p-3"} ${loading ? "animate-pulse" : ""}`}>
        {error ? (
          <div className="text-red-400 text-xs font-mono py-4 text-center">
            <span className="text-red-500">ERROR:</span> {error}
          </div>
        ) : loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-[#1a1a1a] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
