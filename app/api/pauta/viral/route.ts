import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { auth } from "@/lib/auth";

function getYouTube() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_SHEETS_CLIENT_ID ?? process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SHEETS_CLIENT_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return google.youtube({ version: "v3", auth: oauth2Client });
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json({ error: "Missing q param" }, { status: 400 });
  }

  try {
    const youtube = getYouTube();
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

    const items = res.data.items ?? [];
    const videos = items
      .filter((item) => item.id?.videoId)
      .map((item) => ({
        videoId: item.id!.videoId!,
        title: item.snippet?.title ?? "",
        channel: item.snippet?.channelTitle ?? "",
        publishedAt: item.snippet?.publishedAt ?? "",
        thumbnail:
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          "",
        url: `https://www.youtube.com/watch?v=${item.id!.videoId}`,
      }));

    return NextResponse.json(videos);
  } catch (err) {
    console.error("GET /api/pauta/viral error:", err);
    return NextResponse.json({ error: "Failed to search videos" }, { status: 500 });
  }
}
