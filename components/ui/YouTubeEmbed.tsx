"use client";
import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

interface YouTubeEmbedProps {
  url: string;         // full YouTube URL
  title: string;
  thumbnail?: string;  // custom thumbnail path (optional)
  className?: string;
}

// Extract video ID from various YouTube URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?]+)/,
    /youtu\.be\/([^?]+)/,
    /youtube\.com\/shorts\/([^?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function YouTubeEmbed({ url, title, thumbnail, className }: YouTubeEmbedProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = extractVideoId(url);

  if (!videoId) return null;

  const ytThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-black ${className ?? ""}`}>
      {!playing ? (
        // Thumbnail + play button
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 w-full h-full group cursor-pointer"
          aria-label={`Assistir: ${title}`}
        >
          {thumbnail ? (
            <Image src={thumbnail} alt={title} fill className="object-cover" />
          ) : (
            <img
              src={ytThumbnail}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 transition-all duration-200 flex items-center justify-center shadow-xl">
              <Play size={28} className="text-brand-purple-600 translate-x-0.5" fill="currentColor" />
            </div>
          </div>
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm font-medium line-clamp-2">{title}</p>
          </div>
        </button>
      ) : (
        // Lazy-loaded iframe
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}
