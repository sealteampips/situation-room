"use client";

import { Panel } from "@/components/ui/Panel";

interface PlaceholderPanelProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  phase?: string;
}

export function PlaceholderPanel({
  title,
  description,
  icon,
  phase = "Phase 2",
}: PlaceholderPanelProps) {
  return (
    <Panel title={title}>
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {icon ? (
          <div className="text-4xl mb-3 opacity-30">{icon}</div>
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] mb-3 flex items-center justify-center">
            <span className="text-2xl opacity-30">?</span>
          </div>
        )}
        <div className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1">
          {phase}
        </div>
        {description && (
          <div className="text-xs text-gray-600 max-w-[200px]">
            {description}
          </div>
        )}
      </div>
    </Panel>
  );
}

// Pre-configured placeholder panels for Phase 2 features
export function GlobalActivityMap() {
  return (
    <PlaceholderPanel
      title="GLOBAL ACTIVITY MONITOR"
      description="Interactive world map showing real-time geopolitical events and hotspots"
      icon={<span>🌍</span>}
    />
  );
}

export function FedBalanceSheet() {
  return (
    <PlaceholderPanel
      title="FED BALANCE SHEET"
      description="Federal Reserve balance sheet tracking and 'Money Printer' status"
      icon={<span>💵</span>}
    />
  );
}

export function EconomicCalendar() {
  return (
    <PlaceholderPanel
      title="ECONOMIC CALENDAR"
      description="High-impact economic events and announcements"
      icon={<span>📅</span>}
    />
  );
}

export function SectorHeatmap() {
  return (
    <PlaceholderPanel
      title="SECTOR HEATMAP"
      description="Market sector performance visualization"
      icon={<span>📊</span>}
    />
  );
}

export function COTData() {
  return (
    <PlaceholderPanel
      title="COT DATA"
      description="Commitment of Traders report analysis"
      icon={<span>📈</span>}
    />
  );
}

export function LayoffsTracker() {
  return (
    <PlaceholderPanel
      title="LAYOFFS TRACKER"
      description="Tech industry and corporate layoff monitoring"
      icon={<span>👥</span>}
    />
  );
}

export function GovContracts() {
  return (
    <PlaceholderPanel
      title="GOV CONTRACTS"
      description="Government contract awards and procurement data"
      icon={<span>📋</span>}
    />
  );
}

export function AIArmsRace() {
  return (
    <PlaceholderPanel
      title="AI ARMS RACE"
      description="AI development milestones and competitive landscape"
      icon={<span>🤖</span>}
    />
  );
}

export function CentralBankWatch() {
  return (
    <PlaceholderPanel
      title="CENTRAL BANK WATCH"
      description="Global central bank policy decisions and rate changes"
      icon={<span>🏦</span>}
    />
  );
}

// Grid component for all Phase 2 placeholders
export function Phase2PlaceholdersGrid() {
  return (
    <div className="panel-grid">
      <GlobalActivityMap />
      <FedBalanceSheet />
      <EconomicCalendar />
      <SectorHeatmap />
      <COTData />
      <LayoffsTracker />
      <GovContracts />
      <AIArmsRace />
      <CentralBankWatch />
    </div>
  );
}
