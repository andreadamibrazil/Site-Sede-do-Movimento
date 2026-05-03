import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export interface NewsItem {
  title: string;
  url: string;
  description: string;
  source: string;
  publishedAt: string;
  image: string;
}

const RSS_FEEDS = [
  { url: "https://g1.globo.com/rss/g1/cultura/", source: "G1 Cultura" },
  { url: "https://g1.globo.com/rss/g1/rio-de-janeiro/", source: "G1 Rio" },
  { url: "https://feeds.folha.uol.com.br/ilustrada/rss091.xml", source: "Folha Ilustrada" },
  { url: "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml", source: "Folha" },
  { url: "https://rss.uol.com.br/feed/entretenimento.xml", source: "UOL Entretenimento" },
];

function extractCdata(tag: string, xml: string): string {
  const cdataMatch = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`));
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return plainMatch ? plainMatch[1].replace(/<[^>]+>/g, "").trim() : "";
}

function parseRss(xml: string, source: string): NewsItem[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];
  return items.map((item) => {
    const imageMatch =
      item.match(/url="([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i) ??
      item.match(/<media:thumbnail[^>]+url="([^"]+)"/i) ??
      item.match(/<enclosure[^>]+url="([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i);
    return {
      title: extractCdata("title", item),
      url: extractCdata("link", item) || ((item.match(/<link>([^<]+)<\/link>/) ?? [])[1] ?? ""),
      description: extractCdata("description", item).slice(0, 220),
      source,
      publishedAt: extractCdata("pubDate", item),
      image: imageMatch?.[1] ?? "",
    };
  }).filter((i) => i.title && i.url);
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim();
  if (!q) return NextResponse.json({ error: "Missing q" }, { status: 400 });

  const keywords = q.split(/\s+/).filter((k) => k.length > 2);

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source }) => {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 1800 }, // cache 30min
      });
      if (!res.ok) return [];
      const xml = await res.text();
      return parseRss(xml, source);
    })
  );

  const allItems: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") allItems.push(...r.value);
  }

  const filtered = allItems.filter((item) =>
    keywords.some(
      (kw) =>
        item.title.toLowerCase().includes(kw) ||
        item.description.toLowerCase().includes(kw)
    )
  );

  // Sort by date descending, cap at 10
  filtered.sort((a, b) => {
    const da = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const db = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return db - da;
  });

  return NextResponse.json(filtered.slice(0, 10));
}
