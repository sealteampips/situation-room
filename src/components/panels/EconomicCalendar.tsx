"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

// All available currencies for filtering
const ALL_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF"];
const DEFAULT_CURRENCIES = ["USD", "EUR", "GBP", "JPY"];

// US Holidays 2026 (Markets Closed)
const US_HOLIDAYS_2026: Record<string, string> = {
  "2026-01-01": "New Year's Day",
  "2026-01-20": "MLK Day",
  "2026-02-16": "Presidents' Day",
  "2026-04-03": "Good Friday",
  "2026-05-25": "Memorial Day",
  "2026-06-19": "Juneteenth",
  "2026-07-03": "Independence Day",
  "2026-09-07": "Labor Day",
  "2026-11-26": "Thanksgiving",
  "2026-12-25": "Christmas",
};

// Hardcoded high-impact event patterns
const HIGH_IMPACT_EVENTS = [
  "nonfarm payrolls",
  "non-farm employment change",
  "nfp",
  "cpi m/m",
  "cpi y/y",
  "core cpi",
  "consumer price index",
  "interest rate decision",
  "fed funds rate",
  "fomc",
  "fomc minutes",
  "fed chair powell",
  "ecb interest rate",
  "ecb monetary policy",
  "boe interest rate",
  "bank of england",
  "gdp q/q",
  "gdp y/y",
  "advance gdp",
  "preliminary gdp",
  "retail sales m/m",
  "core retail sales",
  "ism manufacturing pmi",
  "ism non-manufacturing pmi",
  "ism services pmi",
  "unemployment rate",
  "unemployment claims",
  "initial jobless claims",
  "ppi m/m",
  "ppi y/y",
  "core ppi",
  "pce price index",
  "core pce",
];

// Medium impact events
const MEDIUM_IMPACT_EVENTS = [
  "building permits",
  "housing starts",
  "existing home sales",
  "new home sales",
  "durable goods",
  "industrial production",
  "capacity utilization",
  "consumer confidence",
  "michigan consumer",
  "trade balance",
  "factory orders",
  "wholesale inventories",
  "business inventories",
  "jolts job openings",
  "adp employment",
  "average hourly earnings",
];

// Key events for special highlighting
const KEY_EVENT_PATTERNS = [
  "nonfarm payrolls",
  "non-farm employment",
  "nfp",
  "cpi",
  "consumer price index",
  "interest rate",
  "fed funds",
  "fomc",
  "ecb",
  "boe",
  "gdp",
  "retail sales",
  "pmi",
  "pce",
];

type ImpactLevel = "high" | "medium" | "low";

function getImpactLevel(eventName: string): ImpactLevel {
  const lower = eventName.toLowerCase();
  if (HIGH_IMPACT_EVENTS.some((pattern) => lower.includes(pattern))) {
    return "high";
  }
  if (MEDIUM_IMPACT_EVENTS.some((pattern) => lower.includes(pattern))) {
    return "medium";
  }
  return "low";
}

function isKeyEvent(eventName: string): boolean {
  const lower = eventName.toLowerCase();
  return KEY_EVENT_PATTERNS.some((pattern) => lower.includes(pattern));
}

// Format date as YYYY-MM-DD in LOCAL timezone (not UTC)
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatEventTime(timeStr: string): string {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Get calendar days for a month
function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add days from previous month to fill the first week
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add all days of the current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }

  // Add days from next month to complete the last week
  const endDayOfWeek = lastDay.getDay();
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

interface CalendarResponse {
  events: EconomicEvent[];
  cached?: boolean;
  cacheAge?: number;
  error?: string;
}

interface DayEventsModalProps {
  date: Date;
  events: EconomicEvent[];
  onClose: () => void;
}

function DayEventsModal({ date, events, onClose }: DayEventsModalProps) {
  const dateStr = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div
        className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-lg max-w-lg w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-[#1a1a1a] flex items-center justify-between">
          <h3 className="text-sm font-bold text-amber-500 font-mono">{dateStr}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-300 text-lg"
          >
            &times;
          </button>
        </div>
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {events.length === 0 ? (
            <p className="text-gray-500 font-mono text-sm text-center py-4">No events</p>
          ) : (
            <div className="space-y-2">
              {events.map((event, idx) => {
                const impact = getImpactLevel(event.event);
                const isKey = isKeyEvent(event.event);
                const impactColor = impact === "high" ? "bg-red-500" : impact === "medium" ? "bg-orange-500" : "bg-yellow-500";

                return (
                  <div
                    key={`${event.time}-${event.event}-${idx}`}
                    className={`p-2 rounded ${impact === "high" ? "bg-red-500/5" : "bg-[#1a1a1a]"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-mono w-16">
                        {formatEventTime(event.time)}
                      </span>
                      <span className="text-sm">{currencyToFlag[event.currency] || "🌐"}</span>
                      <div className={`w-2 h-2 rounded-full ${impactColor}`} />
                      <span className={`text-xs font-mono flex-1 ${isKey ? "text-gray-200 font-bold" : "text-gray-400"}`}>
                        {event.event}
                      </span>
                      {isKey && (
                        <span className="px-1 py-0.5 text-[9px] font-mono bg-amber-500/20 text-amber-400 rounded">
                          KEY
                        </span>
                      )}
                    </div>
                    {(event.forecast || event.previous || event.actual) && (
                      <div className="flex items-center gap-3 mt-1 ml-[88px] text-[10px] font-mono">
                        {event.forecast && (
                          <span className="text-gray-500">F: <span className="text-gray-400">{event.forecast}</span></span>
                        )}
                        {event.previous && (
                          <span className="text-gray-500">P: <span className="text-gray-400">{event.previous}</span></span>
                        )}
                        {event.actual && (
                          <span className="text-gray-500">A: <span className="text-green-400">{event.actual}</span></span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EconomicCalendar() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedCurrencies, setSelectedCurrencies] = useState<Set<string>>(new Set(DEFAULT_CURRENCIES));
  const [impactFilters, setImpactFilters] = useState<Set<ImpactLevel>>(new Set(["high"]));

  const fetchEvents = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/calendar");
      const data: CalendarResponse = await response.json();

      console.log("Calendar API response:", {
        eventCount: data.events?.length || 0,
        cached: data.cached,
        error: data.error,
        sampleEvent: data.events?.[0],
      });

      if (data.error && (!data.events || data.events.length === 0)) {
        setError(data.error);
      } else {
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error("Calendar fetch error:", err);
      setError("Unable to load calendar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const refreshInterval = setInterval(fetchEvents, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [fetchEvents]);

  // Get calendar days for current month view
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Group events by date and apply filters
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, EconomicEvent[]> = {};

    events.forEach((event) => {
      // Apply currency filter
      if (!selectedCurrencies.has(event.currency)) return;

      // Apply impact filter
      const impact = getImpactLevel(event.event);
      if (!impactFilters.has(impact)) return;

      // Handle multiple formats: "2026-01-08 13:30:00", "2026-01-08T13:30:00", "2026.01.08 13:30:00"
      // Extract date part and normalize to YYYY-MM-DD format (with dashes)
      const datePart = event.time.split(/[T ]/)[0]; // "2026-01-08" or "2026.01.08"
      const dateKey = datePart.replace(/\./g, "-"); // Convert dots to dashes: "2026-01-08"
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });

    // Sort events within each day by time
    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    });

    // Debug: log grouped event dates
    if (Object.keys(grouped).length > 0) {
      console.log("Events grouped by date:", Object.keys(grouped));
      console.log("Sample calendar dateKey:", formatDateKey(new Date()));
    }

    return grouped;
  }, [events, selectedCurrencies, impactFilters]);

  // Get highest impact level for a day
  const getDayImpact = (dateKey: string): ImpactLevel | null => {
    const dayEvents = eventsByDate[dateKey];
    if (!dayEvents || dayEvents.length === 0) return null;

    let hasHigh = false;
    let hasMedium = false;

    for (const event of dayEvents) {
      const impact = getImpactLevel(event.event);
      if (impact === "high") hasHigh = true;
      if (impact === "medium") hasMedium = true;
    }

    if (hasHigh) return "high";
    if (hasMedium) return "medium";
    return "low";
  };

  const toggleCurrency = (currency: string) => {
    setSelectedCurrencies((prev) => {
      const next = new Set(prev);
      if (next.has(currency)) {
        next.delete(currency);
      } else {
        next.add(currency);
      }
      return next;
    });
  };

  const toggleImpact = (impact: ImpactLevel) => {
    setImpactFilters((prev) => {
      const next = new Set(prev);
      if (next.has(impact)) {
        next.delete(impact);
      } else {
        next.add(impact);
      }
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedCurrencies(new Set(DEFAULT_CURRENCIES));
    setImpactFilters(new Set(["high"]));
  };

  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const today = new Date();
  const todayKey = formatDateKey(today);
  const currentMonth = currentDate.getMonth();

  const monthYear = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Get events for selected day modal
  const selectedDayEvents = selectedDay
    ? eventsByDate[formatDateKey(selectedDay)] || []
    : [];

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold tracking-wide text-amber-500 font-mono">
            ECONOMIC CALENDAR
          </h3>
          <button
            onClick={resetFilters}
            className="text-[10px] text-gray-500 hover:text-gray-400 font-mono"
          >
            Reset
          </button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={goToPrevMonth}
            className="text-gray-500 hover:text-gray-300 px-2 py-1 text-sm"
          >
            &lt;
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-gray-300">{monthYear}</span>
            <button
              onClick={goToToday}
              className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded font-mono hover:bg-amber-500/30"
            >
              Today
            </button>
          </div>
          <button
            onClick={goToNextMonth}
            className="text-gray-500 hover:text-gray-300 px-2 py-1 text-sm"
          >
            &gt;
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Impact Filters */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleImpact("high")}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                impactFilters.has("high")
                  ? "bg-red-500/20 text-red-400"
                  : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              High
            </button>
            <button
              onClick={() => toggleImpact("medium")}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                impactFilters.has("medium")
                  ? "bg-orange-500/20 text-orange-400"
                  : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              Med
            </button>
            <button
              onClick={() => toggleImpact("low")}
              className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                impactFilters.has("low")
                  ? "bg-yellow-500/20 text-yellow-400"
                  : "bg-[#1a1a1a] text-gray-500"
              }`}
            >
              Low
            </button>
          </div>

          <div className="w-px bg-[#2a2a2a]" />

          {/* Currency Filters */}
          <div className="flex items-center gap-1 flex-wrap">
            {ALL_CURRENCIES.map((currency) => (
              <button
                key={currency}
                onClick={() => toggleCurrency(currency)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  selectedCurrencies.has(currency)
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-[#1a1a1a] text-gray-500"
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-y-auto p-2 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse text-gray-500 font-mono text-sm">Loading...</div>
          </div>
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
        ) : (
          <div className="flex flex-col h-full">
            {/* Week Day Headers */}
            <div className="grid grid-cols-7 gap-px mb-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="text-center text-[10px] font-mono text-gray-500 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-px flex-1">
              {calendarDays.map((date, idx) => {
                const dateKey = formatDateKey(date);
                const isCurrentMonth = date.getMonth() === currentMonth;
                const isToday = dateKey === todayKey;
                const holiday = US_HOLIDAYS_2026[dateKey];
                const dayImpact = getDayImpact(dateKey);
                const eventCount = eventsByDate[dateKey]?.length || 0;
                const isPast = date < today && !isToday;
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                let bgClass = "bg-[#141414]";
                let borderClass = "";

                if (!isCurrentMonth) {
                  bgClass = "bg-[#0a0a0a]";
                } else if (holiday) {
                  bgClass = "bg-[#151515]";
                } else if (dayImpact === "high") {
                  bgClass = "bg-[#1a1212]";
                  borderClass = "border-l-2 border-l-red-500";
                } else if (dayImpact === "medium") {
                  borderClass = "border-l-2 border-l-orange-500";
                } else if (isWeekend) {
                  bgClass = "bg-[#121212]";
                }

                if (isToday) {
                  borderClass = "ring-1 ring-amber-500";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => isCurrentMonth && setSelectedDay(date)}
                    disabled={!isCurrentMonth}
                    className={`
                      relative p-1 min-h-[40px] text-left transition-colors
                      ${bgClass} ${borderClass}
                      ${isCurrentMonth ? "hover:bg-[#1a1a1a] cursor-pointer" : "cursor-default"}
                      ${isPast && isCurrentMonth ? "opacity-60" : ""}
                    `}
                  >
                    <div className={`text-[10px] font-mono ${
                      isCurrentMonth ? (isToday ? "text-amber-400 font-bold" : "text-gray-400") : "text-gray-600"
                    }`}>
                      {date.getDate()}
                    </div>

                    {holiday && isCurrentMonth && (
                      <div className="text-[8px] font-mono text-gray-500 italic truncate">
                        {holiday}
                      </div>
                    )}

                    {eventCount > 0 && isCurrentMonth && !holiday && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {dayImpact === "high" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        )}
                        {dayImpact === "medium" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        )}
                        {dayImpact === "low" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        )}
                        <span className="text-[8px] text-gray-500 font-mono">
                          {eventCount}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Day Events Modal */}
      {selectedDay && (
        <DayEventsModal
          date={selectedDay}
          events={selectedDayEvents}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
