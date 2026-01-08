import { NewsItem, NewsCategory, FeedConfig } from "@/types";
import he from "he";

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  guid?: string;
  contentSnippet?: string;
}

interface ParsedFeed {
  items: RSSItem[];
}

export async function fetchRSSFeed(feed: FeedConfig): Promise<NewsItem[]> {
  try {
    // Use a CORS proxy or server-side fetch
    const response = await fetch(feed.url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${feed.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    const items = parseRSSXML(xml, feed);
    return items;
  } catch (error) {
    console.error(`Error fetching ${feed.name}:`, error);
    return [];
  }
}

function parseRSSXML(xml: string, feed: FeedConfig): NewsItem[] {
  const items: NewsItem[] = [];

  // Simple XML parsing for RSS items
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  const matches = xml.matchAll(itemRegex);

  for (const match of matches) {
    const itemXml = match[1];

    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link") || extractTag(itemXml, "guid");
    const pubDate = extractTag(itemXml, "pubDate") || extractTag(itemXml, "dc:date");
    const guid = extractTag(itemXml, "guid") || link;

    if (title && link) {
      items.push({
        id: guid || `${feed.name}-${Date.now()}-${Math.random()}`,
        title: cleanTitle(title),
        link: cleanLink(link),
        source: feed.name,
        pubDate: pubDate || new Date().toISOString(),
        category: feed.category,
      });
    }
  }

  // Also check for Atom feed format (entry instead of item)
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
    const entryMatches = xml.matchAll(entryRegex);

    for (const match of entryMatches) {
      const entryXml = match[1];

      const title = extractTag(entryXml, "title");
      const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/);
      const link = linkMatch ? linkMatch[1] : extractTag(entryXml, "link");
      const pubDate = extractTag(entryXml, "published") || extractTag(entryXml, "updated");
      const id = extractTag(entryXml, "id") || link;

      if (title && link) {
        items.push({
          id: id || `${feed.name}-${Date.now()}-${Math.random()}`,
          title: cleanTitle(title),
          link: cleanLink(link),
          source: feed.name,
          pubDate: pubDate || new Date().toISOString(),
          category: feed.category,
        });
      }
    }
  }

  return items.slice(0, 10); // Limit to 10 items per feed
}

function extractTag(xml: string, tagName: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tagName}>`, "i");
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // Handle regular tags
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function cleanTitle(title: string): string {
  // Remove CDATA wrappers, HTML tags, then decode all HTML entities using 'he' library
  const cleaned = title
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .trim();

  // Use 'he' library for robust HTML entity decoding (handles &#x2019;, &#8217;, &rsquo;, etc.)
  return he.decode(cleaned);
}

function cleanLink(link: string): string {
  return link
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .trim();
}

export function formatTimestamp(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

export function groupNewsByCategory(items: NewsItem[]): Record<NewsCategory, NewsItem[]> {
  const grouped: Record<NewsCategory, NewsItem[]> = {
    world: [],
    tech: [],
    financial: [],
    government: [],
  };

  for (const item of items) {
    if (grouped[item.category]) {
      grouped[item.category].push(item);
    }
  }

  // Sort each category by date
  for (const category of Object.keys(grouped) as NewsCategory[]) {
    grouped[category].sort((a, b) =>
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  }

  return grouped;
}

export function filterNewsForSituation(items: NewsItem[], keywords: string[]): NewsItem[] {
  const lowerKeywords = keywords.map(k => k.toLowerCase());

  return items.filter(item => {
    const titleLower = item.title.toLowerCase();
    return lowerKeywords.some(keyword => titleLower.includes(keyword));
  });
}
