"use client";

import { useEffect, useState, useCallback } from "react";
import type { EconomicEvent } from "@/app/api/calendar/route";

// Map currency codes to country flags
const currencyToFlag: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  CNY: "🇨🇳",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  NZD: "🇳🇿",
};

const KEY_EVENT_PATTERNS = [
  "nonfarm payrolls",
  "nfp",
  "cpi",
  "consumer price index",
  "interest rate",
  "fed funds",
  "fomc",
  "ecb",
  "european central bank",
  "boe",
  "bank of england",
  "gdp",
  "retail sales",
  "pmi",
];

function isKeyEvent(eventName: string): boolean {
  const lower = eventName.toLowerCase();
  return KEY_EVENT_PATTERNS.some((pattern) => lower.includes(pattern));
}

function getImpactDot(impact: string): { color: string; bgColor: string } {
  switch (impact?.toLowerCase()) {
    case "high":
      return { color: "bg-red-500", bgColor: "bg-red-500/5" };
    case "medium":
      return { color: "bg-orange-500", bgColor: "bg-transparent" };
    case "low":
      return { color: "bg-yellow-500", bgColor: "bg-transparent" };
    default:
      return { color: "bg-gray-500", bgColor: "bg-transparent" };
  }
}

function formatEventTime(timeStr: string): { date: string; time: string } {
  const date = new Date(timeStr);
  const dateFormatted = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const timeFormatted = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });
  return { date: dateFormatted, time: timeFormatted };
}

function getCountdown(timeStr: string): string | null {
  const eventTime = new Date(timeStr).getTime();
  const now = Date.now();
  const diff = eventTime - now;

  if (diff < 0) return null; // Event has passed
  if (diff > 24 * 60 * 60 * 1000) return null; // More than 24 hours away

  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `in ${hours}h ${minutes}m`;
  }
  return `in ${minutes}m`;
}

// Skeleton loader
function CalendarSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
          <div className="w-16 h-8 bg-gray-800 rounded" />
          <div className="w-6 h-6 bg-gray-800 rounded" />
          <div className="flex-1 h-4 bg-gray-800 rounded" />
          <div className="w-16 h-4 bg-gray-800 rounded" />
        </div>
      ))}
    </div>
  );
}

type ImpactFilter = "all" | "high";

interface CalendarResponse {
  events: EconomicEvent[];
  cached?: boolean;
  cacheAge?: number;
  error?: string;
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>("high");
  const [cacheAge, setCacheAge] = useState<number>(0);
  const [, setTick] = useState(0);

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/calendar");
      const data: CalendarResponse = await response.json();

      if (data.error && (!data.events || data.events.length === 0)) {
        setError(data.error);
      } else {
        setEvents(data.events || []);
        setCacheAge(data.cacheAge || 0);
      }
    } catch {
      setError("Unable to load calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();

    // Refresh every 5 minutes (matching API rate limit)
    const refreshInterval = setInterval(fetchEvents, 5 * 60 * 1000);

    // Update countdown every minute
    const tickInterval = setInterval(() => setTick((t) => t + 1), 60 * 1000);

    return () => {
      clearInterval(refreshInterval);
      clearInterval(tickInterval);
    };
  }, [fetchEvents]);

  const filteredEvents = events.filter((event) => {
    if (impactFilter === "high") {
      return event.impact?.toLowerCase() === "high";
    }
    return true;
  });

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-amber-500 font-mono">
              ECONOMIC CALENDAR
            </h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              High-impact events
              {cacheAge > 0 && (
                <span className="ml-2 text-gray-600">
                  (updated {cacheAge}m ago)
                </span>
              )}
            </p>
          </div>
          {/* Filter toggle */}
          <div className="flex items-center gap-1 bg-[#1a1a1a] rounded p-0.5">
            <button
              onClick={() => setImpactFilter("high")}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                impactFilter === "high"
                  ? "bg-red-500/20 text-red-400"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              High
            </button>
            <button
              onClick={() => setImpactFilter("all")}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                impactFilter === "all"
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-gray-500 hover:text-gray-400"
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {loading ? (
          <CalendarSkeleton />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <p className="text-gray-500 font-mono text-sm mb-3">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                fetchEvents();
              }}
              className="px-3 py-1.5 text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded hover:bg-amber-500/30 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 font-mono text-sm">
              {impactFilter === "high"
                ? "No high-impact events scheduled"
                : "No major events scheduled"}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredEvents.map((event, idx) => {
              const { date, time } = formatEventTime(event.time);
              const countdown = getCountdown(event.time);
              const impact = getImpactDot(event.impact);
              const isKey = isKeyEvent(event.event);

              return (
                <div
                  key={`${event.time}-${event.event}-${idx}`}
                  className={`flex items-start gap-2 p-2 rounded ${impact.bgColor} hover:bg-[#1a1a1a]/50 transition-colors`}
                >
                  {/* Date/Time column */}
                  <div className="flex-shrink-0 w-20 text-right">
                    <div className="text-xs text-gray-400 font-mono">
                      {date}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {time}
                    </div>
                    {countdown && (
                      <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                        {countdown}
                      </div>
                    )}
                  </div>

                  {/* Flag (from currency) */}
                  <div className="flex-shrink-0 text-sm">
                    {currencyToFlag[event.currency] || "🌐"}
                  </div>

                  {/* Impact dot */}
                  <div className="flex-shrink-0 mt-1.5">
                    <div className={`w-2 h-2 rounded-full ${impact.color}`} />
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-mono truncate ${
                          isKey ? "text-gray-200 font-bold" : "text-gray-400"
                        }`}
                      >
                        {event.event}
                      </span>
                      {isKey && (
                        <span className="flex-shrink-0 px-1 py-0.5 text-[9px] font-mono bg-amber-500/20 text-amber-400 rounded">
                          KEY
                        </span>
                      )}
                    </div>
                    {/* Forecast / Previous / Actual */}
                    {(event.forecast || event.previous || event.actual) && (
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] font-mono">
                        {event.forecast && (
                          <span className="text-gray-500">
                            F: <span className="text-gray-400">{event.forecast}</span>
                          </span>
                        )}
                        {event.previous && (
                          <span className="text-gray-500">
                            P: <span className="text-gray-400">{event.previous}</span>
                          </span>
                        )}
                        {event.actual && (
                          <span className="text-gray-500">
                            A: <span className="text-green-400">{event.actual}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
