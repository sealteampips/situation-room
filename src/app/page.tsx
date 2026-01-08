"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/ui/Header";
import { NewsFeedGrid } from "@/components/panels/NewsPanel";
import { AffectedAssets, AffectedAssetsStatic } from "@/components/panels/AffectedAssets";
import { SituationTrackerGrid, SituationTrackerStatic } from "@/components/panels/SituationTracker";
import { GlobalActivityMap, GlobalActivityMapStatic } from "@/components/panels/GlobalActivityMap";
import {
  FedBalanceSheet,
  EconomicCalendar,
  SectorHeatmap,
  COTData,
  LayoffsTracker,
  GovContracts,
  AIArmsRace,
  CentralBankWatch,
} from "@/components/panels/PlaceholderPanel";
import type { NewsItem, NewsCategory } from "@/types";
import { REFRESH_INTERVAL } from "@/lib/constants";

type NewsData = Record<NewsCategory, NewsItem[]>;

export default function Dashboard() {
  const [news, setNews] = useState<NewsData>({
    world: [],
    tech: [],
    financial: [],
    government: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNews = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }

    try {
      const response = await fetch("/api/news");
      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const result = await response.json();
      setNews(result.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Unable to fetch latest news. Will retry automatically.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();

    // Set up auto-refresh
    const interval = setInterval(() => {
      fetchNews();
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchNews]);

  const handleRefresh = () => {
    fetchNews(true);
  };

  // Get all news items as a flat array for affected assets and situation trackers
  const allNews = Object.values(news).flat();

  return (
    <div className="min-h-screen bg-background grid-bg scanlines">
      <Header
        onRefresh={handleRefresh}
        lastUpdated={lastUpdated || undefined}
        isRefreshing={isRefreshing}
      />

      <main className="max-w-[1920px] mx-auto px-4 py-6 space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm font-mono">{error}</span>
            </div>
          </div>
        )}

        {/* Section: Global Activity Map - TOP OF PAGE */}
        <section>
          {loading ? <GlobalActivityMapStatic /> : <GlobalActivityMap allNews={allNews} />}
        </section>

        {/* Section: Situation Trackers - ABOVE Intelligence Feeds */}
        <section>
          <SectionHeader title="SITUATION TRACKERS" subtitle="Monitoring key global situations" />
          {loading ? <SituationTrackerStatic /> : <SituationTrackerGrid allNews={allNews} />}
        </section>

        {/* Section: News Feeds */}
        <section>
          <SectionHeader title="INTELLIGENCE FEEDS" subtitle="Real-time news aggregation" />
          <NewsFeedGrid news={news} loading={loading} />
        </section>

        {/* Section: Analysis Tools */}
        <section>
          <SectionHeader title="ANALYSIS TOOLS" subtitle="Market correlation data" />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {loading ? <AffectedAssetsStatic /> : <AffectedAssets recentNews={allNews} />}
          </div>
        </section>

        {/* Section: Phase 2 Modules */}
        <section>
          <SectionHeader
            title="UPCOMING MODULES"
            subtitle="Additional features in development"
            badge="PHASE 2"
          />
          <div className="panel-grid">
            <FedBalanceSheet />
            <EconomicCalendar />
            <SectorHeatmap />
            <COTData />
            <LayoffsTracker />
            <GovContracts />
            <AIArmsRace />
            <CentralBankWatch />
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[#262626] pt-6 mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span>SYSTEM OPERATIONAL</span>
            </div>
            <div className="text-center sm:text-right">
              <div>SITUATION ROOM v1.1.0</div>
              <div className="text-gray-500">
                Data refreshes every 5 minutes | For informational purposes only
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

function SectionHeader({ title, subtitle, badge }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold tracking-widest text-amber-500 font-mono">
            {title}
          </h2>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400 font-mono mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-[#262626] to-transparent" />
    </div>
  );
}
