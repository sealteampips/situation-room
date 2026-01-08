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

export async function GET() {
  const apiKey = process.env.JBLANKED_API_KEY;

  if (!apiKey || apiKey === "placeholder") {
    return NextResponse.json(
      { error: "API key not configured", events: [] },
      { status: 200 } // Return 200 with empty events so UI can show message
    );
  }

  // Check cache (important: rate limit is 1 req per 5 minutes on free tier)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    const cacheAge = Math.floor((Date.now() - cachedData.timestamp) / 1000 / 60);
    return NextResponse.json({
      events: cachedData.events,
      cached: true,
      cacheAge: cacheAge,
    });
  }

  try {
    const url = "https://www.jblanked.com/news/api/mql5/calendar/week/";

    const response = await fetch(url, {
      headers: {
        "Authorization": `Api-Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("JBlanked API error:", response.status, errorText);
      throw new Error(`JBlanked API error: ${response.status}`);
    }

    const data: JBlankedEvent[] = await response.json();

    // Filter to relevant currencies and normalize
    const filteredEvents = (data || [])
      .filter((event) => RELEVANT_CURRENCIES.includes(event.Currency))
      .map(normalizeEvent)
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

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
    console.error("Economic calendar fetch error:", error);

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
      { status: 200 } // Return 200 so UI can handle gracefully
    );
  }
}
