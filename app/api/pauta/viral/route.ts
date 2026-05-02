import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing q param" }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "YouTube API key not configured" }, { status: 500 });
  }

  try {
    const youtube = google.youtube({ version: "v3", auth: apiKey });
    const publishedAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const res = await youtube.search.list({
      part: ["snippet"],
      q,
      type: ["video"],
      order: "viewCount",
      publishedAfter,
      maxResults: 15,
      regionCode: "BR",
      relevanceLanguage: "pt",
    });

    function decodeHtml(str: string): string {
      return str
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)));
    }

    const items = (res.data.items ?? []).filter((item) => item.id?.videoId);
    const videoIds = items.map((item) => item.id!.videoId!);

    // Fetch statistics + full description in one batch call
    const statsRes = await youtube.videos.list({
      part: ["statistics", "snippet"],
      id: videoIds,
    });
    const statsMap = new Map(
      (statsRes.data.items ?? []).map((v) => [v.id!, v])
    );

    const videos = items.map((item) => {
      const v = statsMap.get(item.id!.videoId!);
      const stats = v?.statistics;
      const desc = decodeHtml(v?.snippet?.description ?? "");
      return {
        videoId: item.id!.videoId!,
        title: decodeHtml(item.snippet?.title ?? ""),
        channel: item.snippet?.channelTitle ?? "",
        publishedAt: item.snippet?.publishedAt ?? "",
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          "",
        url: `https://www.youtube.com/watch?v=${item.id!.videoId}`,
        viewCount: Number(stats?.viewCount ?? 0),
        likeCount: Number(stats?.likeCount ?? 0),
        commentCount: Number(stats?.commentCount ?? 0),
        description: desc.slice(0, 300),
      };
    });

    return NextResponse.json(videos);
  } catch (err) {
    console.error("GET /api/pauta/viral error:", err);
    return NextResponse.json({ error: "Failed to search videos" }, { status: 500 });
  }
}
