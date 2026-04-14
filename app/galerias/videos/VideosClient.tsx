"use client";

import { useState, useMemo } from "react";
import type { SanityVideoEmbed } from "@/lib/sanity/types";
import YouTubeEmbed from "@/components/ui/YouTubeEmbed";
import Badge from "@/components/ui/Badge";

const CATEGORY_BADGE: Record<string, "accent" | "secondary" | "primary" | "success" | "neutral"> = {
  "Espetáculos": "accent",
  "Bastidores": "secondary",
  "Aulas": "primary",
  "Institucional": "neutral",
  "Eventos": "success",
};

interface Props {
  videos: SanityVideoEmbed[];
}

export default function VideosClient({ videos }: Props) {
  const [activeCategory, setActiveCategory] = useState("Todos");

  const categories = useMemo(() => {
    const set = new Set<string>();
    videos.forEach((v) => { if (v.category) set.add(v.category); });
    return ["Todos", ...Array.from(set)];
  }, [videos]);

  const filtered = useMemo(() => {
    if (activeCategory === "Todos") return videos;
    return videos.filter((v) => v.category === activeCategory);
  }, [videos, activeCategory]);

  return (
    <div>
      {/* Category filter */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-colors duration-150 ${
                activeCategory === cat
                  ? "bg-brand-purple-600 text-white border-brand-purple-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-purple-300 hover:text-brand-purple-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((video, index) => (
          <div
            key={video._id}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <YouTubeEmbed url={video.youtubeUrl} title={video.title} className="rounded-none" />
            <div className="p-4">
              {video.category && (
                <Badge
                  color={CATEGORY_BADGE[video.category] ?? "neutral"}
                  variant="subtle"
                  size="xs"
                  className="mb-2"
                >
                  {video.category}
                </Badge>
              )}
              <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-brand-purple-600 transition-colors">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-gray-400 text-xs mt-1 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
