"use client";

import { useMemo } from "react";
import { Panel } from "@/components/ui/Panel";
import { TickerChip } from "@/components/ui/TickerChip";
import { NewsItem } from "@/types";
import { TICKER_MAPPINGS } from "@/lib/constants";

interface AffectedAssetsProps {
  recentNews: NewsItem[];
}

export function AffectedAssets({ recentNews }: AffectedAssetsProps) {
  const affectedTickers = useMemo(() => {
    return getAffectedTickers(recentNews);
  }, [recentNews]);

  return (
    <Panel
      title="AFFECTED ASSETS"
      headerRight={
        <span className="text-xs text-gray-500 font-mono">
          {affectedTickers.length} detected
        </span>
      }
    >
      <div className="space-y-4">
        {affectedTickers.length === 0 ? (
          <div className="text-gray-500 text-xs font-mono text-center py-4">
            Analyzing news for market correlations...
          </div>
        ) : (
          affectedTickers.map((group, index) => (
            <AssetGroup key={index} {...group} />
          ))
        )}
      </div>
    </Panel>
  );
}

interface AssetGroupProps {
  trigger: string;
  tickers: string[];
  matchedHeadline: string;
}

function AssetGroup({ trigger, tickers, matchedHeadline }: AssetGroupProps) {
  return (
    <div className="border-b border-[#1a1a1a] pb-3 last:border-0 last:pb-0">
      <div className="text-[13px] text-amber-600 font-mono mb-1 uppercase font-semibold">
        {trigger}
      </div>
      <div className="text-sm text-gray-400 mb-2.5 line-clamp-1 leading-relaxed">
        {matchedHeadline}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tickers.map((ticker) => (
          <TickerChip key={ticker} symbol={ticker} />
        ))}
      </div>
    </div>
  );
}

interface TickerMatch {
  trigger: string;
  tickers: string[];
  matchedHeadline: string;
}

function getAffectedTickers(news: NewsItem[]): TickerMatch[] {
  const matches: TickerMatch[] = [];
  const usedHeadlines = new Set<string>();
  const usedMappingIndices = new Set<number>();

  for (const item of news.slice(0, 50)) {
    // Skip if this headline was already used
    if (usedHeadlines.has(item.title)) continue;

    const titleLower = item.title.toLowerCase();

    for (let mappingIdx = 0; mappingIdx < TICKER_MAPPINGS.length; mappingIdx++) {
      // Skip if this mapping category was already matched
      if (usedMappingIndices.has(mappingIdx)) continue;

      const mapping = TICKER_MAPPINGS[mappingIdx];
      const matchedKeyword = mapping.keywords.find(keyword =>
        titleLower.includes(keyword.toLowerCase())
      );

      if (matchedKeyword) {
        usedHeadlines.add(item.title);
        usedMappingIndices.add(mappingIdx);
        matches.push({
          trigger: matchedKeyword.toUpperCase(),
          tickers: mapping.tickers,
          matchedHeadline: item.title,
        });
        break; // Move to next headline
      }
    }

    if (matches.length >= 5) break;
  }

  return matches;
}

// Static preview for when there's no news data
export function AffectedAssetsStatic() {
  const staticMatches: TickerMatch[] = [
    {
      trigger: "FED / MONETARY POLICY",
      tickers: ["SPY", "QQQ", "TLT", "GLD", "BTC", "EUR/USD"],
      matchedHeadline: "Federal Reserve signals continued focus on inflation targets",
    },
    {
      trigger: "CHINA / TAIWAN",
      tickers: ["TSM", "NVDA", "AMD", "SMH", "FXI"],
      matchedHeadline: "Taiwan semiconductor exports reach new highs",
    },
    {
      trigger: "MIDDLE EAST",
      tickers: ["USO", "XLE", "GLD", "LMT", "RTX"],
      matchedHeadline: "Regional tensions continue to affect oil markets",
    },
  ];

  return (
    <Panel
      title="AFFECTED ASSETS"
      headerRight={
        <span className="text-xs text-green-500 font-mono">LIVE</span>
      }
    >
      <div className="space-y-4">
        {staticMatches.map((group, index) => (
          <AssetGroup key={index} {...group} />
        ))}
      </div>
    </Panel>
  );
}
