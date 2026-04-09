"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { urlFor } from "@/sanity/lib/image";
import type { SanityGalleryAlbum } from "@/lib/sanity/types";

const ALL_FILTER = "Todos";

interface Props {
  albums: SanityGalleryAlbum[];
}

export default function FotosPageClient({ albums }: Props) {
  const categories = [ALL_FILTER, ...Array.from(new Set(albums.map((a) => a.category).filter(Boolean) as string[]))];
  const [activeFilter, setActiveFilter] = useState(ALL_FILTER);

  const filtered = activeFilter === ALL_FILTER ? albums : albums.filter((a) => a.category === activeFilter);

  if (albums.length === 0) {
    return (
      <div className="py-24 text-center text-gray-400">
        <p className="text-lg font-medium">Nenhum álbum publicado ainda.</p>
        <p className="text-sm mt-2">Em breve novos registros serão adicionados aqui.</p>
      </div>
    );
  }

  return (
    <>
      {/* Filter tabs */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {categories.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 border",
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {filtered.map((album) => (
          <Link
            key={album._id}
            href={`/galerias/fotos/${album.slug}`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 cursor-pointer"
          >
            {album.coverImage ? (
              <Image
                src={urlFor(album.coverImage).width(600).height(600).url()}
                alt={album.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400 text-xs text-center px-2">{album.title}</span>
              </div>
            )}
            {/* Overlay */}
            <div className="absolute inset-0 bg-brand-purple-950/0 group-hover:bg-brand-purple-950/60 transition-all duration-300" />
            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm font-semibold leading-tight">{album.title}</p>
              {album.photoCount != null && (
                <p className="text-white/70 text-xs mt-0.5">{album.photoCount} foto{album.photoCount !== 1 ? "s" : ""}</p>
              )}
            </div>
            {/* Category badge */}
            {album.category && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                {album.category}
              </div>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
