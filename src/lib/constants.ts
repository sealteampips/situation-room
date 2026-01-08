import { FeedConfig, TickerMapping, SituationStatus } from "@/types";

export const RSS_FEEDS: FeedConfig[] = [
  // World/Geopolitical
  { name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews", category: "world" },
  { name: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml", category: "world" },
  { name: "AP News", url: "https://rsshub.app/apnews/topics/apf-topnews", category: "world" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml", category: "world" },
  { name: "Reuters Middle East", url: "https://feeds.reuters.com/Reuters/worldNews", category: "world" },

  // Technology/AI
  { name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "tech" },
  { name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "tech" },
  { name: "TechCrunch", url: "https://techcrunch.com/feed/", category: "tech" },
  { name: "Wired", url: "https://www.wired.com/feed/rss", category: "tech" },

  // Financial
  { name: "MarketWatch", url: "https://feeds.marketwatch.com/marketwatch/topstories/", category: "financial" },
  { name: "CNBC", url: "https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114", category: "financial" },
  { name: "Yahoo Finance", url: "https://finance.yahoo.com/news/rssindex", category: "financial" },
  { name: "Reuters Business", url: "https://feeds.reuters.com/reuters/businessNews", category: "financial" },

  // Government/Policy - expanded sources
  { name: "Federal Register", url: "https://www.federalregister.gov/documents/current.rss", category: "government" },
  { name: "White House", url: "https://www.whitehouse.gov/feed/", category: "government" },
  { name: "Congress.gov", url: "https://www.congress.gov/rss/most-viewed-bills.xml", category: "government" },
  { name: "State Dept", url: "https://www.state.gov/rss-feed/press-releases/feed/", category: "government" },
  { name: "Defense.gov", url: "https://www.defense.gov/DesktopModules/ArticleCS/RSS.ashx?max=10&ContentType=1&Site=945", category: "government" },
  { name: "DOJ News", url: "https://www.justice.gov/feeds/opa/justice-news.xml", category: "government" },
  { name: "Treasury", url: "https://home.treasury.gov/system/files/126/treasury_rss.xml", category: "government" },
  { name: "GAO Reports", url: "https://www.gao.gov/rss/reports.xml", category: "government" },
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
    keywords: ["taiwan", "taipei", "tsmc", "taiwan strait", "cross-strait", "chinese military", "pla navy"],
    tickers: ["TSM", "NVDA", "AMD", "SMH", "FXI"],
  },
  {
    keywords: ["iran", "tehran", "irgc", "iranian", "khamenei", "persian gulf", "hormuz", "sanctions iran"],
    tickers: ["USO", "XLE", "GLD", "LMT", "RTX"],
  },
  {
    keywords: ["israel", "gaza", "hamas", "hezbollah", "netanyahu", "idf"],
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
    keywords: ["tech layoff", "layoffs"],
    tickers: ["META", "GOOGL", "AMZN", "MSFT", "AAPL", "QQQ"],
  },
  {
    keywords: ["artificial intelligence", "openai", "chatgpt", "claude", "llm", "generative ai"],
    tickers: ["NVDA", "MSFT", "GOOGL", "AMD", "META"],
  },
];

export const SITUATION_TRACKERS: Omit<SituationStatus, "headlines" | "lastUpdated">[] = [
  {
    id: "venezuela",
    name: "Venezuela Crisis",
    status: "elevated",
    keywords: ["venezuela", "maduro", "caracas", "pdvsa", "guaido", "venezuelan"],
  },
  {
    id: "greenland",
    name: "Greenland Dispute",
    status: "low",
    keywords: ["greenland", "nuuk", "thule", "danish arctic", "greenlandic"],
  },
  {
    id: "taiwan",
    name: "Taiwan Strait",
    status: "elevated",
    keywords: ["taiwan", "taipei", "taiwan strait", "tsmc", "taiwanese", "cross-strait", "pla taiwan", "chinese military taiwan"],
  },
  {
    id: "iran",
    name: "Iran",
    status: "high",
    keywords: ["iran", "tehran", "iranian", "irgc", "khamenei", "raisi", "persian gulf", "strait of hormuz", "sanctions iran", "nuclear iran", "iranian proxy", "quds force"],
  },
  {
    id: "us-domestic",
    name: "US Domestic",
    status: "elevated",
    keywords: ["congress", "white house", "supreme court", "election", "capitol", "senate", "house of representatives", "biden", "trump", "doj", "fbi"],
  },
  {
    id: "minnesota",
    name: "Minnesota",
    status: "low",
    keywords: ["minnesota", "minneapolis", "twin cities", "walz", "st paul", "hennepin"],
  },
];

// Map hotspot locations for the world map - expanded to match reference
export const MAP_HOTSPOTS = [
  // North America
  { id: "nuuk", name: "NUUK", label: "Arctic Dispute", lat: 64.18, lng: -51.72, situationId: "greenland" },
  { id: "dc", name: "DC", label: "Pentagon Pizza Index", lat: 38.91, lng: -77.04, situationId: "us-domestic" },
  { id: "panama", name: "PANAMA", label: "Canal Watch", lat: 9.0, lng: -79.5, situationId: null },

  // South America
  { id: "caracas", name: "CARACAS", label: "Venezuela Crisis", lat: 10.48, lng: -66.90, situationId: "venezuela" },

  // Europe
  { id: "london", name: "LONDON", label: "UK/Finance", lat: 51.51, lng: -0.13, situationId: null },
  { id: "brussels", name: "BRUSSELS", label: "EU/NATO HQ", lat: 50.85, lng: 4.35, situationId: null },
  { id: "moscow", name: "MOSCOW", label: "Kremlin Activity", lat: 55.75, lng: 37.62, situationId: null },
  { id: "kyiv", name: "KYIV", label: "Conflict Zone", lat: 50.45, lng: 30.52, situationId: null },
  { id: "bosphorus", name: "BOSPHORUS", label: "Strait Watch", lat: 41.1, lng: 29.0, situationId: null },
  { id: "altai", name: "ALTAI/FO", label: "Remote Monitor", lat: 50.0, lng: 87.0, situationId: null },

  // Middle East
  { id: "telaviv", name: "TEL AVIV", label: "Mossad/IDF", lat: 32.08, lng: 34.78, situationId: null },
  { id: "tehran", name: "TEHRAN", label: "IRGC Activity", lat: 35.69, lng: 51.39, situationId: "iran" },
  { id: "hormuz", name: "HORMUZ", label: "Strait Watch", lat: 26.5, lng: 56.5, situationId: null },

  // Asia
  { id: "beijing", name: "BEIJING", label: "PLA/MSS Activity", lat: 39.90, lng: 116.41, situationId: null },
  { id: "pyongyang", name: "PYONGYANG", label: "DPRK Watch", lat: 39.04, lng: 125.76, situationId: null },
  { id: "taipei", name: "TAIPEI", label: "Strait Watch", lat: 25.03, lng: 121.57, situationId: "taiwan" },
  { id: "malacca", name: "MALACCA", label: "Shipping Lane", lat: 2.2, lng: 102.2, situationId: null },

  // Local
  { id: "minneapolis", name: "MPLS", label: "Minnesota Local", lat: 44.98, lng: -93.27, situationId: "minnesota" },
];

export const CATEGORY_LABELS: Record<string, string> = {
  world: "WORLD / GEOPOLITICAL",
  tech: "TECHNOLOGY / AI",
  financial: "FINANCIAL",
  government: "GOVERNMENT / POLICY",
};

export const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export const HACKER_NEWS_API = "https://hacker-news.firebaseio.com/v0";
