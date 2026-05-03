import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export interface OgPreview {
  title: string;
  description: string;
  image: string;
  siteName: string;
}

function extractMeta(html: string, property: string): string {
  const m =
    html.match(new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i")) ??
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i")) ??
    html.match(new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"));
  return m?.[1]?.trim() ?? "";
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = req.nextUrl.searchParams.get("url");
  if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; bot/1.0)",
        "Accept": "text/html",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return NextResponse.json({} as OgPreview);

    const html = await res.text();
    const preview: OgPreview = {
      title: extractMeta(html, "og:title") || (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? ""),
      description: extractMeta(html, "og:description") || extractMeta(html, "description"),
      image: extractMeta(html, "og:image"),
      siteName: extractMeta(html, "og:site_name"),
    };

    return NextResponse.json(preview);
  } catch {
    return NextResponse.json({} as OgPreview);
  }
}
