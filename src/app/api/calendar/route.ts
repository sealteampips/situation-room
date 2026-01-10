import { NextResponse } from "next/server";

// JBlanked API response format
interface JBlankedEvent {
  Name: string;
  Currency: string;
  Event_ID: number;
  Category: string;
  Date: string;
  Actual: string | null;
  Forecast: string | null;
  Previous: string | null;
  Outcome: string | null;
  Strength: string;
  Quality: string | null;
  Projection: string | null;
}

// Normalized format for our component
export interface EconomicEvent {
  currency: string;
  event: string;
  impact: string;
  time: string;
  actual: string | null;
  forecast: string | null;
  previous: string | null;
  category: string;
}

const RELEVANT_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD", "CHF", "NZD"];

// Cache for API responses (5 minute TTL to respect rate limits)
let cachedData: { events: EconomicEvent[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function normalizeEvent(event: JBlankedEvent): EconomicEvent {
  return {
    currency: event.Currency,
    event: event.Name,
    impact: event.Strength?.toLowerCase() || "low",
    time: event.Date,
    actual: event.Actual,
    forecast: event.Forecast,
    previous: event.Previous,
    category: event.Category,
  };
}

// Format date as YYYY-MM-DD
function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get date range for calendar (current month through end of next month)
function getDateRange(): { from: string; to: string } {
  const now = new Date();
  // Start from first day of current month
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  // End at last day of next month (JBlanked may have limits on range)
  const to = new Date(now.getFullYear(), now.getMonth() + 2, 0);

  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

export async function GET() {
  const apiKey = process.env.JBLANKED_API_KEY;

  if (!apiKey || apiKey === "placeholder") {
    console.log("JBlanked API key not configured");
    return NextResponse.json(
      { error: "API key not configured", events: [] },
      { status: 200 }
    );
  }

  // Check cache (important: rate limit is 1 req per 5 minutes on free tier)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    const cacheAge = Math.floor((Date.now() - cachedData.timestamp) / 1000 / 60);
    console.log(`Returning cached calendar data (${cacheAge}m old, ${cachedData.events.length} events)`);
    return NextResponse.json({
      events: cachedData.events,
      cached: true,
      cacheAge: cacheAge,
    });
  }

  try {
    // Fetch full month range
    const { from, to } = getDateRange();
    const url = `https://www.jblanked.com/news/api/mql5/calendar/range/?from=${from}&to=${to}`;

    console.log(`[Calendar API] Fetching: ${url}`);
    console.log(`[Calendar API] Date range: ${from} to ${to}`);

    const response = await fetch(url, {
      headers: {
        "Authorization": `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    });

    console.log(`[Calendar API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Calendar API] Error ${response.status}: ${errorText}`);
      throw new Error(`JBlanked API error: ${response.status} - ${errorText}`);
    }

    const data: JBlankedEvent[] = await response.json();
    console.log(`[Calendar API] JBlanked returned ${data?.length || 0} raw events`);

    // Log date range of returned events
    if (data && data.length > 0) {
      const dates = data.map(e => e.Date).sort();
      console.log(`[Calendar API] Event date range: ${dates[0]} to ${dates[dates.length - 1]}`);
    }

    // Log a sample event to see the date format
    if (data && data.length > 0) {
      console.log("Sample event:", JSON.stringify(data[0]));
    }

    // Filter to relevant currencies and normalize
    const filteredEvents = (data || [])
      .filter((event) => RELEVANT_CURRENCIES.includes(event.Currency))
      .map(normalizeEvent)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    console.log(`After filtering: ${filteredEvents.length} events`);

    // Update cache
    cachedData = {
      events: filteredEvents,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      events: filteredEvents,
      cached: false,
      cacheAge: 0,
    });
  } catch (error) {
    console.error("[Calendar API] Fetch error:", error instanceof Error ? error.message : error);

    // Return cached data if available, even if stale
    if (cachedData) {
      const cacheAge = Math.floor((Date.now() - cachedData.timestamp) / 1000 / 60);
      return NextResponse.json({
        events: cachedData.events,
        cached: true,
        stale: true,
        cacheAge: cacheAge,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch economic calendar", events: [] },
      { status: 200 }
    );
  }
}
