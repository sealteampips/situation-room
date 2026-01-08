import { NextResponse } from "next/server";
import { NewsItem, NewsCategory, FeedConfig } from "@/types";
import { RSS_FEEDS, HACKER_NEWS_API } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 300; // 5 minutes

export async function GET() {
  try {
    const allNews: NewsItem[] = [];

    // Fetch from all RSS feeds in parallel
    const feedPromises = RSS_FEEDS.map((feed) => fetchRSSFeed(feed));

    // Also fetch from Hacker News API
    const hnPromise = fetchHackerNews();

    const results = await Promise.allSettled([...feedPromises, hnPromise]);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        allNews.push(...result.value);
      }
    }

    // Sort by date and group by category
    const sortedNews = allNews.sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    const groupedNews: Record<NewsCategory, NewsItem[]> = {
      world: [],
      tech: [],
      financial: [],
      government: [],
    };

    for (const item of sortedNews) {
      if (groupedNews[item.category]) {
        groupedNews[item.category].push(item);
      }
    }

    // Limit each category to top 20 items
    for (const category of Object.keys(groupedNews) as NewsCategory[]) {
      groupedNews[category] = groupedNews[category].slice(0, 20);
    }

    return NextResponse.json({
      data: groupedNews,
      timestamp: new Date().toISOString(),
      totalItems: sortedNews.length,
    });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news", timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}

async function fetchRSSFeed(feed: FeedConfig): Promise<NewsItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(feed.url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SituationMonitor/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch ${feed.name}: ${response.status}`);
      return [];
    }

    const xml = await response.text();
    return parseRSSXML(xml, feed);
  } catch (error) {
    console.error(`Error fetching ${feed.name}:`, error);
    return [];
  }
}

function parseRSSXML(xml: string, feed: FeedConfig): NewsItem[] {
  const items: NewsItem[] = [];

  // Parse RSS format (item tags)
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
        title: cleanText(title),
        link: cleanText(link),
        source: feed.name,
        pubDate: pubDate || new Date().toISOString(),
        category: feed.category,
      });
    }
  }

  // Parse Atom format (entry tags) if no RSS items found
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
          title: cleanText(title),
          link: cleanText(link),
          source: feed.name,
          pubDate: pubDate || new Date().toISOString(),
          category: feed.category,
        });
      }
    }
  }

  return items.slice(0, 10);
}

function extractTag(xml: string, tagName: string): string | null {
  // Handle CDATA
  const cdataRegex = new RegExp(
    `<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tagName}>`,
    "i"
  );
  const cdataMatch = xml.match(cdataRegex);
  if (cdataMatch) {
    return cdataMatch[1].trim();
  }

  // Handle regular tags
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)</${tagName}>`, "i");
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function cleanText(text: string): string {
  return text
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .trim();
}

async function fetchHackerNews(): Promise<NewsItem[]> {
  try {
    // Fetch top story IDs
    const topStoriesRes = await fetch(`${HACKER_NEWS_API}/topstories.json`, {
      next: { revalidate: 300 },
    });

    if (!topStoriesRes.ok) return [];

    const storyIds: number[] = await topStoriesRes.json();
    const topIds = storyIds.slice(0, 10);

    // Fetch story details in parallel
    const storyPromises = topIds.map(async (id) => {
      const res = await fetch(`${HACKER_NEWS_API}/item/${id}.json`);
      if (!res.ok) return null;
      return res.json();
    });

    const stories = await Promise.all(storyPromises);

    return stories
      .filter((story): story is NonNullable<typeof story> => story !== null && story.title)
      .map((story) => ({
        id: `hn-${story.id}`,
        title: story.title,
        link: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
        source: "Hacker News",
        pubDate: new Date(story.time * 1000).toISOString(),
        category: "tech" as NewsCategory,
      }));
  } catch (error) {
    console.error("Error fetching Hacker News:", error);
    return [];
  }
}
