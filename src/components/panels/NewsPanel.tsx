"use client";

import type { NewsItem, NewsCategory } from "@/types";
import { Panel } from "@/components/ui/Panel";
import { formatTimestamp } from "@/lib/rss";
import { CATEGORY_LABELS } from "@/lib/constants";

interface NewsPanelProps {
  category: NewsCategory;
  items: NewsItem[];
  loading?: boolean;
  error?: string;
}

export function NewsPanel({ category, items, loading, error }: NewsPanelProps) {
  const title = CATEGORY_LABELS[category] || category.toUpperCase();

  return (
    <Panel
      title={title}
      loading={loading}
      error={error}
      headerRight={
        <span className="text-xs text-gray-500 font-mono">
          {items.length} items
        </span>
      }
    >
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {items.length === 0 && !loading ? (
          <div className="text-gray-500 text-xs font-mono text-center py-4">
            No items available
          </div>
        ) : (
          items.slice(0, 15).map((item) => (
            <NewsItemCard key={item.id} item={item} />
          ))
        )}
      </div>
    </Panel>
  );
}

function NewsItemCard({ item }: { item: NewsItem }) {
  return (
    <article className="group border-b border-[#1a1a1a] pb-2 last:border-0 last:pb-0">
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:bg-[#1a1a1a] -mx-2 px-2 py-1 rounded transition-colors"
      >
        <h3 className="text-sm text-gray-200 leading-snug group-hover:text-amber-400 transition-colors line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-amber-600 font-mono">{item.source}</span>
          <span className="text-gray-600">|</span>
          <span className="text-xs text-gray-500 font-mono">
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
  const categories: NewsCategory[] = ["world", "tech", "financial", "government"];

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
