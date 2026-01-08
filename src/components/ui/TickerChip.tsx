"use client";

interface TickerChipProps {
  symbol: string;
  className?: string;
}

export function TickerChip({ symbol, className = "" }: TickerChipProps) {
  const tradingViewUrl = getTradingViewUrl(symbol);

  return (
    <a
      href={tradingViewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`ticker-chip hover:scale-105 transition-transform ${className}`}
    >
      {symbol}
    </a>
  );
}

function getTradingViewUrl(symbol: string): string {
  // Map common symbols to TradingView format
  const symbolMap: Record<string, string> = {
    "BTC": "BINANCE:BTCUSDT",
    "ETH": "BINANCE:ETHUSDT",
    "EUR/USD": "FX:EURUSD",
    "USDNOK": "FX:USDNOK",
    "USDSEK": "FX:USDSEK",
    "DXY": "TVC:DXY",
    "GLD": "AMEX:GLD",
    "USO": "AMEX:USO",
    "TLT": "NASDAQ:TLT",
  };

  const mappedSymbol = symbolMap[symbol] || symbol;

  // Check if it's already a full symbol or needs exchange prefix
  if (mappedSymbol.includes(":")) {
    return `https://www.tradingview.com/chart/?symbol=${encodeURIComponent(mappedSymbol)}`;
  }

  // Default to NASDAQ for stocks
  return `https://www.tradingview.com/chart/?symbol=NASDAQ:${encodeURIComponent(mappedSymbol)}`;
}

interface TickerGroupProps {
  tickers: string[];
  label?: string;
}

export function TickerGroup({ tickers, label }: TickerGroupProps) {
  return (
    <div className="space-y-1">
      {label && (
        <span className="text-xs text-gray-500 font-mono uppercase">{label}</span>
      )}
      <div className="flex flex-wrap gap-1">
        {tickers.map((ticker) => (
          <TickerChip key={ticker} symbol={ticker} />
        ))}
      </div>
    </div>
  );
}
