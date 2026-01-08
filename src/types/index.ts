export type ThreatLevel = "low" | "elevated" | "high" | "critical";

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  pubDate: string;
  category: NewsCategory;
}

export type NewsCategory = "world" | "tech" | "financial" | "government";

export interface SituationStatus {
  id: string;
  name: string;
  status: ThreatLevel;
  headlines: NewsItem[];
  lastUpdated: string;
  keywords: string[];
}

export interface MoonPhaseData {
  phase: MoonPhaseName;
  illumination: number;
  age: number;
  nextPhases: {
    newMoon: Date;
    firstQuarter: Date;
    fullMoon: Date;
    lastQuarter: Date;
  };
}

export type MoonPhaseName =
  | "New Moon"
  | "Waxing Crescent"
  | "First Quarter"
  | "Waxing Gibbous"
  | "Full Moon"
  | "Waning Gibbous"
  | "Last Quarter"
  | "Waning Crescent";

export interface TickerMapping {
  keywords: string[];
  tickers: string[];
}

export interface FeedConfig {
  name: string;
  url: string;
  category: NewsCategory;
}

export interface ApiResponse<T> {
  data: T;
  timestamp: string;
  error?: string;
}
