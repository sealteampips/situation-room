"use client";

import { useState, useEffect } from "react";

interface HeaderProps {
  onRefresh?: () => void;
  lastUpdated?: Date;
  isRefreshing?: boolean;
}

export function Header({ onRefresh, lastUpdated, isRefreshing = false }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1f1f1f]">
      <div className="max-w-[1920px] mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Title Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <h1 className="text-lg md:text-xl font-bold tracking-widest text-amber-500 font-mono">
                SITUATION ROOM
              </h1>
            </div>
            <span className="hidden sm:block text-xs text-gray-600 font-mono">
              v1.0.0
            </span>
          </div>

          {/* Status Section */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* System Time */}
            {mounted && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono uppercase">SYS TIME</span>
                <span className="text-sm text-green-400 font-mono font-semibold">
                  {currentTime}
                </span>
              </div>
            )}

            {/* Last Updated */}
            {mounted && lastUpdated && (
              <div className="hidden md:flex items-center gap-2">
                <span className="text-xs text-gray-500 font-mono uppercase">UPDATED</span>
                <span className="text-sm text-gray-400 font-mono">
                  {formatLastUpdated(lastUpdated)}
                </span>
              </div>
            )}

            {/* Refresh Button */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded border
                  text-xs font-mono uppercase tracking-wider
                  transition-all duration-200
                  ${
                    isRefreshing
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-500 cursor-wait"
                      : "bg-[#111] border-[#333] text-gray-400 hover:border-amber-500 hover:text-amber-500"
                  }
                `}
              >
                <RefreshIcon className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">
                  {isRefreshing ? "SYNCING" : "REFRESH"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
