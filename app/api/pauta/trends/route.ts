import { NextResponse } from "next/server";

export interface TrendChip {
  term: string;
  trending?: boolean;
}

// Curated topics for dance/arts/culture content in Brazil
const CURATED: TrendChip[] = [
  { term: "dança contemporânea" },
  { term: "ballet infantil" },
  { term: "artes cênicas" },
  { term: "jazz dance" },
  { term: "hip hop dança" },
  { term: "escola de dança Rio de Janeiro" },
  { term: "festival de dança" },
  { term: "teatro infantil" },
  { term: "espetáculo de dança" },
  { term: "dança brasileira" },
  { term: "ballet adulto" },
  { term: "dança para iniciantes" },
  { term: "música e movimento" },
  { term: "educação artística" },
  { term: "cultura Rio de Janeiro" },
];

export async function GET() {
  // Try Google Trends daily for BR — unofficial but public
  try {
    const res = await fetch(
      "https://trends.google.com/trends/api/dailytrends?hl=pt-BR&tz=180&geo=BR&ns=15",
      { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const raw = await res.text();
      // Response starts with ")]}'" — strip it
      const json = JSON.parse(raw.replace(/^\)\]\}\'/, ""));
      const trendingStories = json?.default?.trendingSearchesDays?.[0]?.trendingSearches ?? [];
      const trendingTerms: TrendChip[] = trendingStories
        .slice(0, 5)
        .map((s: { title?: { query?: string } }) => ({
          term: s.title?.query ?? "",
          trending: true,
        }))
        .filter((t: TrendChip) => t.term);

      return NextResponse.json([...trendingTerms, ...CURATED]);
    }
  } catch {
    // Fallback to curated list
  }

  return NextResponse.json(CURATED);
}
