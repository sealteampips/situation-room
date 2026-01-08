import { NextResponse } from "next/server";

export interface EconomicEvent {
  country: string;
  event: string;
  impact: string;
  time: string;
  actual: number | null;
  estimate: number | null;
  prev: number | null;
  unit: string;
}

interface FinnhubResponse {
  economicCalendar: EconomicEvent[];
}

const RELEVANT_COUNTRIES = ["US", "EU", "GB", "JP", "CN", "AU", "CA", "CH", "NZ"];

// Cache for API responses (30 minute TTL)
let cachedData: { events: EconomicEvent[]; timestamp: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  // Check cache
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json({ events: cachedData.events, cached: true });
  }

  try {
    // Calculate date range (today to today + 7 days)
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const fromDate = today.toISOString().split("T")[0];
    const toDate = nextWeek.toISOString().split("T")[0];

    const url = `https://finnhub.io/api/v1/calendar/economic?from=${fromDate}&to=${toDate}&token=${apiKey}`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.status}`);
    }

    const data: FinnhubResponse = await response.json();

    // Filter to relevant countries and sort by time
    const filteredEvents = (data.economicCalendar || [])
      .filter((event) => RELEVANT_COUNTRIES.includes(event.country))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Update cache
    cachedData = {
      events: filteredEvents,
      timestamp: Date.now(),
    };

    return NextResponse.json({ events: filteredEvents, cached: false });
  } catch (error) {
    console.error("Economic calendar fetch error:", error);

    // Return cached data if available, even if stale
    if (cachedData) {
      return NextResponse.json({
        events: cachedData.events,
        cached: true,
        stale: true
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch economic calendar" },
      { status: 500 }
    );
  }
}
