"use client";

import { Panel } from "@/components/ui/Panel";
import { StatusIndicator, StatusBadge } from "@/components/ui/StatusIndicator";
import { SituationStatus, NewsItem, ThreatLevel } from "@/types";
import { formatTimestamp, filterNewsForSituation } from "@/lib/rss";
import { SITUATION_TRACKERS } from "@/lib/constants";

interface SituationTrackerPanelProps {
  situation: Omit<SituationStatus, "headlines" | "lastUpdated">;
  allNews: NewsItem[];
}

export function SituationTrackerPanel({ situation, allNews }: SituationTrackerPanelProps) {
  const relevantNews = filterNewsForSituation(allNews, situation.keywords).slice(0, 5);
  const lastUpdated = relevantNews[0]?.pubDate || new Date().toISOString();

  return (
    <Panel
      title={situation.name.toUpperCase()}
      headerRight={<StatusBadge status={situation.status} />}
      compact
    >
      <div className="space-y-3">
        {/* Headlines */}
        <div className="space-y-2">
          {relevantNews.length === 0 ? (
            <div className="text-gray-500 text-sm font-mono py-2">
              No recent headlines
            </div>
          ) : (
            relevantNews.map((item) => (
              <a
                key={item.id}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-gray-300 hover:text-amber-400 transition-colors line-clamp-2 leading-relaxed"
              >
                {item.title}
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
          <StatusIndicator status={situation.status} size="sm" />
          <span className="text-[13px] text-gray-500 font-mono">
            {formatTimestamp(lastUpdated)}
          </span>
        </div>
      </div>
    </Panel>
  );
}

interface SituationTrackerGridProps {
  allNews: NewsItem[];
}

export function SituationTrackerGrid({ allNews }: SituationTrackerGridProps) {
  return (
    <div className="situation-grid">
      {SITUATION_TRACKERS.map((situation) => (
        <SituationTrackerPanel
          key={situation.id}
          situation={situation}
          allNews={allNews}
        />
      ))}
    </div>
  );
}

// Static version for initial render / demo
export function SituationTrackerStatic() {
  const staticSituations: Array<{
    id: string;
    name: string;
    status: ThreatLevel;
    headlines: string[];
    lastUpdated: string;
  }> = [
    {
      id: "venezuela",
      name: "Venezuela Crisis",
      status: "elevated",
      headlines: [
        "Opposition leaders call for international support",
        "Economic sanctions impact humanitarian aid delivery",
        "Regional neighbors coordinate response strategy",
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "greenland",
      name: "Greenland Dispute",
      status: "low",
      headlines: [
        "Denmark reaffirms territorial commitment",
        "Arctic Council discusses regional cooperation",
        "Rare earth mining interests draw attention",
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "taiwan",
      name: "Taiwan Strait",
      status: "elevated",
      headlines: [
        "Naval exercises monitored in disputed waters",
        "Semiconductor supply chain concerns persist",
        "Diplomatic channels remain active",
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "iran",
      name: "Iran",
      status: "high",
      headlines: [
        "Nuclear talks reach critical juncture",
        "Regional proxy conflicts continue",
        "Oil exports affected by ongoing sanctions",
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "us-domestic",
      name: "US Domestic",
      status: "elevated",
      headlines: [
        "Congress debates key legislation",
        "Federal agencies announce policy changes",
        "Economic indicators mixed amid uncertainty",
      ],
      lastUpdated: new Date().toISOString(),
    },
    {
      id: "minnesota",
      name: "Minnesota",
      status: "low",
      headlines: [
        "Local government initiatives underway",
        "Economic development projects announced",
        "Weather impacts regional activities",
      ],
      lastUpdated: new Date().toISOString(),
    },
  ];

  return (
    <div className="situation-grid">
      {staticSituations.map((situation) => (
        <Panel
          key={situation.id}
          title={situation.name.toUpperCase()}
          headerRight={<StatusBadge status={situation.status} />}
          compact
        >
          <div className="space-y-3">
            <div className="space-y-2">
              {situation.headlines.map((headline, idx) => (
                <div
                  key={idx}
                  className="text-sm text-gray-300 line-clamp-2 leading-relaxed"
                >
                  {headline}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#1a1a1a]">
              <StatusIndicator status={situation.status} size="sm" />
              <span className="text-[13px] text-gray-500 font-mono">
                {formatTimestamp(situation.lastUpdated)}
              </span>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}
