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
        bg-[#141414] border border-[#262626] rounded-lg overflow-hidden
        ${className}
      `}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#262626] bg-[#0f0f0f]">
        <h2 className="text-sm font-semibold tracking-wider text-amber-500 uppercase font-mono">
          {title}
        </h2>
        {headerRight && <div className="flex items-center gap-2">{headerRight}</div>}
      </div>

      {/* Panel Content */}
      <div className={`${compact ? "p-3" : "p-4"} ${loading ? "animate-pulse" : ""}`}>
        {error ? (
          <div className="text-red-400 text-sm font-mono py-4 text-center">
            <span className="text-red-500">ERROR:</span> {error}
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-5 bg-[#1f1f1f] rounded animate-pulse" />
            ))}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
