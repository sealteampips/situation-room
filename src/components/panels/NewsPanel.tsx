"use client";

import type { NewsItem, NewsCategory } from "@/types";
import { Panel } from "@/components/ui/Panel";
import { formatTimestamp } from "@/lib/rss";
import { CATEGORY_LABELS } from "@/lib/constants";

// Source category types for color coding
type SourceCategory = "wire" | "legacy" | "financial" | "tech" | "government";

// Map source names to categories
const SOURCE_CATEGORIES: Record<string, SourceCategory> = {
  // Wire Services (Amber)
  "Reuters World": "wire",
  "Reuters Business": "wire",
  "AP News": "wire",
  "Al Jazeera": "wire",

  // Legacy Media (Blue)
  "BBC World": "legacy",
  "BBC Middle East": "legacy",
  "BBC Asia": "legacy",
  "NPR World": "legacy",
  "Fox News World": "legacy",
  "Fox News Politics": "legacy",
  "CNN World": "legacy",
  "CNN Politics": "legacy",
  "CBS News World": "legacy",
  "Politico": "legacy",
  "Star Tribune": "legacy",
  "MPR News": "legacy",

  // Financial (Green)
  "MarketWatch": "financial",
  "CNBC": "financial",
  "Yahoo Finance": "financial",

  // Tech (Purple)
  "Ars Technica": "tech",
  "The Verge": "tech",
  "TechCrunch": "tech",
  "Wired": "tech",

  // Government (Gray)
  "Federal Register": "government",
  "White House": "government",
  "Congress.gov": "government",
  "State Dept": "government",
  "Defense.gov": "government",
  "DOJ News": "government",
  "Treasury": "government",
  "GAO Reports": "government",
};

// Color classes by category
const SOURCE_COLORS: Record<SourceCategory, string> = {
  wire: "text-amber-500",
  legacy: "text-blue-400",
  financial: "text-green-400",
  tech: "text-purple-400",
  government: "text-gray-400",
};

// Get source color class
function getSourceColor(source: string): string {
  const category = SOURCE_CATEGORIES[source];
  return category ? SOURCE_COLORS[category] : "text-amber-500";
}

// High impact keywords for breaking/critical news - narrowed to avoid false positives
const HIGH_IMPACT_KEYWORDS = [
  // Military actions (specific phrases)
  "invaded", "invade", "invasion",
  "airstrike", "airstrikes", "air strike",
  "missile strike", "missiles launched", "missile attack",
  "troops deployed", "military action",
  "declaration of war", "declares war", "declared war",
  "drone strike", "artillery barrage",
  // Nuclear/WMD
  "nuclear strike", "nuclear war", "nuclear attack",
  "warhead", "icbm",
  // Political crisis
  "coup", "martial law", "regime change",
  "civil war", "state of emergency",
  // Economic crisis (specific)
  "sovereign default", "market crash", "bank collapse",
  "bank run", "bailout", "emergency rate",
  // Geopolitical
  "sanctions imposed", "blockade",
  "ceasefire", "annexed", "annexation",
  // Breaking news (only all-caps)
  "BREAKING:",
];

// Check if headline is high impact
function isHighImpact(title: string): boolean {
  // Check for case-sensitive keywords first (like "BREAKING:")
  if (title.includes("BREAKING:")) return true;

  const lowerTitle = title.toLowerCase();
  return HIGH_IMPACT_KEYWORDS.some(keyword => {
    // Skip the case-sensitive ones we already checked
    if (keyword === "BREAKING:") return false;
    return lowerTitle.includes(keyword.toLowerCase());
  });
}

interface NewsPanelProps {
  category: NewsCategory;
  items: NewsItem[];
  loading?: boolean;
  error?: string;
}

export function NewsPanel({ category, items, loading, error }: NewsPanelProps) {
  const title = CATEGORY_LABELS[category] || category.toUpperCase();

  // Sort items: high impact first, then by date
  const sortedItems = [...items].sort((a, b) => {
    const aHighImpact = isHighImpact(a.title);
    const bHighImpact = isHighImpact(b.title);
    if (aHighImpact && !bHighImpact) return -1;
    if (!aHighImpact && bHighImpact) return 1;
    return 0; // Keep original order (already sorted by date)
  });

  const highImpactCount = items.filter(item => isHighImpact(item.title)).length;

  return (
    <Panel
      title={title}
      loading={loading}
      error={error}
      headerRight={
        <div className="flex items-center gap-2">
          {highImpactCount > 0 && (
            <span className="text-[10px] text-red-500 font-mono font-bold animate-pulse">
              {highImpactCount} ALERT{highImpactCount > 1 ? "S" : ""}
            </span>
          )}
          <span className="text-xs text-gray-400 font-mono">
            {items.length} items
          </span>
        </div>
      }
    >
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {items.length === 0 && !loading ? (
          <div className="text-gray-400 text-sm font-mono text-center py-4">
            No items available
          </div>
        ) : (
          sortedItems.slice(0, 15).map((item) => (
            <NewsItemCard key={item.id} item={item} highImpact={isHighImpact(item.title)} />
          ))
        )}
      </div>
    </Panel>
  );
}

function NewsItemCard({ item, highImpact }: { item: NewsItem; highImpact: boolean }) {
  const sourceColor = getSourceColor(item.source);

  return (
    <article
      className={`group border-b pb-3 last:border-0 last:pb-0 ${
        highImpact
          ? "border-red-500/30 bg-red-500/5 -mx-2 px-2 py-1 rounded border"
          : "border-[#1f1f1f]"
      }`}
    >
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-[#1a1a1a] -mx-2 px-2 py-1.5 rounded transition-colors"
      >
        {highImpact && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-mono font-bold text-red-500 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              HIGH IMPACT
            </span>
          </div>
        )}
        <h3
          className={`text-[15px] leading-relaxed transition-colors line-clamp-2 ${
            highImpact
              ? "text-red-200 group-hover:text-red-400 font-medium"
              : "text-gray-200 group-hover:text-amber-400"
          }`}
        >
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={`text-xs font-mono ${sourceColor}`}>{item.source}</span>
          <span className="text-gray-500">|</span>
          <span className="text-xs text-gray-400 font-mono">
            {formatTimestamp(item.pubDate)}
          </span>
        </div>
      </a>
    </article>
  );
}

interface NewsFeedGridProps {
  news: Record<NewsCategory, NewsItem[]>;
  loading?: boolean;
}

export function NewsFeedGrid({ news, loading }: NewsFeedGridProps) {
  // Order: World, Government, Financial, Tech
  const categories: NewsCategory[] = ["world", "government", "financial", "tech"];

  return (
    <div className="news-grid">
      {categories.map((category) => (
        <NewsPanel
          key={category}
          category={category}
          items={news[category] || []}
          loading={loading}
        />
      ))}
    </div>
  );
}
