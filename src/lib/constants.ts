import { FeedConfig, TickerMapping, SituationStatus } from "@/types";

export const RSS_FEEDS: FeedConfig[] = [
  // World/Geopolitical
  { name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews", category: "world" },
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "world" },
  { name: "AP News", url: "https://rsshub.app/apnews/topics/apf-topnews", category: "world" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "world" },

  // Technology/AI
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "tech" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "tech" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "tech" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", category: "tech" },

  // Financial
  { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", category: "financial" },
  { name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", category: "financial" },
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "financial" },
  { name: "Financial Times", url: "https://www.ft.com/rss/home", category: "financial" },

  // Government/Policy
  { name: "Federal Register", url: "https://www.federalregister.gov/documents/current.rss", category: "government" },
  { name: "White House", url: "https://www.whitehouse.gov/feed/", category: "government" },
  { name: "Congress.gov", url: "https://www.congress.gov/rss/most-viewed-bills.xml", category: "government" },
  { name: "State Dept", url: "https://www.state.gov/rss-feed/press-releases/feed/", category: "government" },
];

export const TICKER_MAPPINGS: TickerMapping[] = [
  {
    keywords: ["greenland", "arctic", "denmark", "nordic", "norway", "sweden"],
    tickers: ["DXY", "USDNOK", "USDSEK", "LMT", "RTX", "NOC"],
  },
  {
    keywords: ["fed", "federal reserve", "interest rate", "monetary policy", "powell", "fomc", "rate cut", "rate hike"],
    tickers: ["SPY", "QQQ", "TLT", "GLD", "BTC", "EUR/USD"],
  },
  {
    keywords: ["venezuela", "maduro", "caracas", "pdvsa"],
    tickers: ["USO", "XLE", "COP", "OXY"],
  },
  {
    keywords: ["china", "taiwan", "tsmc", "semiconductor", "xi jinping", "beijing", "taipei"],
    tickers: ["TSM", "NVDA", "AMD", "SMH", "FXI"],
  },
  {
    keywords: ["iran", "tehran", "middle east", "israel", "gaza", "hamas", "hezbollah", "yemen", "houthi"],
    tickers: ["USO", "XLE", "GLD", "LMT", "RTX"],
  },
  {
    keywords: ["crypto", "bitcoin", "ethereum", "sec crypto", "binance", "coinbase"],
    tickers: ["BTC", "ETH", "COIN"],
  },
  {
    keywords: ["russia", "ukraine", "putin", "kyiv", "kremlin", "nato"],
    tickers: ["RSX", "ERUS", "GLD", "USO", "LMT", "RTX", "NOC"],
  },
  {
    keywords: ["oil", "opec", "crude", "brent", "wti", "petroleum"],
    tickers: ["USO", "XLE", "OXY", "COP", "CVX", "XOM"],
  },
  {
    keywords: ["tech layoff", "meta", "google", "amazon", "microsoft", "apple"],
    tickers: ["META", "GOOGL", "AMZN", "MSFT", "AAPL", "QQQ"],
  },
  {
    keywords: ["ai", "artificial intelligence", "openai", "chatgpt", "claude", "llm"],
    tickers: ["NVDA", "MSFT", "GOOGL", "AMD", "META"],
  },
];

export const SITUATION_TRACKERS: Omit<SituationStatus, "headlines" | "lastUpdated">[] = [
  {
    id: "venezuela",
    name: "Venezuela Crisis",
    status: "elevated",
    keywords: ["venezuela", "maduro", "caracas", "pdvsa", "guaido"],
  },
  {
    id: "greenland",
    name: "Greenland Dispute",
    status: "low",
    keywords: ["greenland", "denmark", "arctic", "thule", "nuuk"],
  },
  {
    id: "taiwan",
    name: "Taiwan Strait",
    status: "elevated",
    keywords: ["taiwan", "china", "tsmc", "taipei", "strait", "pla"],
  },
  {
    id: "iran",
    name: "Iran",
    status: "high",
    keywords: ["iran", "tehran", "nuclear", "irgc", "proxy"],
  },
  {
    id: "us-domestic",
    name: "US Domestic",
    status: "elevated",
    keywords: ["congress", "white house", "supreme court", "election", "capitol"],
  },
  {
    id: "minnesota",
    name: "Minnesota",
    status: "low",
    keywords: ["minnesota", "minneapolis", "twin cities", "walz", "st paul"],
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  world: "WORLD / GEOPOLITICAL",
  tech: "TECHNOLOGY / AI",
  financial: "FINANCIAL",
  government: "GOVERNMENT / POLICY",
};

export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const HACKER_NEWS_API = "https://hacker-news.firebaseio.com/v0";
