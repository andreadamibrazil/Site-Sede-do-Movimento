"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { urlFor } from "@/sanity/lib/image";
import type { SanityGalleryAlbum } from "@/lib/sanity/types";

const ALL_FILTER = "Todos";

const CATEGORY_COLOR: Record<string, string> = {
  "Espetáculos": "bg-brand-purple-600/15 text-brand-purple-700 border-brand-purple-200",
  "Bastidores": "bg-brand-pink-500/10 text-brand-pink-600 border-brand-pink-100",
  "Aulas": "bg-blue-50 text-blue-700 border-blue-200",
  "Eventos": "bg-green-50 text-green-700 border-green-200",
  "Formatura": "bg-amber-50 text-amber-700 border-amber-200",
  "Competições": "bg-orange-50 text-orange-700 border-orange-200",
  "Institucional": "bg-gray-100 text-gray-700 border-gray-200",
};

interface Props {
  albums: SanityGalleryAlbum[];
}

export default function FotosPageClient({ albums }: Props) {
  const categories = [ALL_FILTER, ...Array.from(new Set(albums.map((a) => a.category).filter(Boolean) as string[]))];
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const filtered = activeFilter === ALL_FILTER ? albums : albums.filter((a) => a.category === activeFilter);

  if (albums.length === 0) {
    return (
      <div className="py-24 text-center bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-4xl mb-4">📷</p>
        <p className="text-lg font-bold text-gray-900 mb-2">Nenhum álbum publicado ainda.</p>
        <p className="text-sm text-gray-500 mt-1">Em breve novos registros serão adicionados aqui.</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      {categories.length > 2 && (
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-200",
                activeFilter === tab
                  ? "bg-brand-purple-600 text-white border-brand-purple-600 shadow-brand-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-brand-purple-600 hover:text-brand-purple-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Album grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((album) => (
          <Link
            key={album._id}
            href={`/galerias/fotos/${album.slug}`}
            className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          >
            {/* Cover image — square, matching homepage preview grid style */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
              {album.coverImage ? (
                <Image
                  src={urlFor(album.coverImage).width(600).height(600).fit("crop").crop("focalpoint").auto("format").url()}
                  alt={album.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full bg-gradient-brand flex items-center justify-center">
                  <Camera size={32} className="text-white/40" />
                </div>
              )}

              {/* Year badge — top right */}
              {album.year && (
                <div className="absolute top-3 right-3 bg-black/55 text-white text-sm font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                  {album.year}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-brand-purple-950/0 group-hover:bg-brand-purple-950/50 transition-all duration-300 flex items-center justify-center">
                <span className="flex items-center gap-2 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  Ver álbum <ArrowRight size={14} />
                </span>
              </div>
            </div>

            {/* Info bar */}
            <div className="p-4">
              {album.category && (
                <span
                  className={cn(
                    "inline-block text-sm font-semibold px-4 py-1.5 rounded-full border mb-2",
                    CATEGORY_COLOR[album.category] ?? "bg-gray-100 text-gray-700 border-gray-200"
                  )}
                >
                  {album.category}
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-brand-purple-600 transition-colors">
                {album.title}
              </h3>
              {album.photoCount != null && album.photoCount > 0 && (
                <p className="text-gray-400 text-sm mt-1">
                  {album.photoCount} foto{album.photoCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
