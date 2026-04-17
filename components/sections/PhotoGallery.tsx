"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Photo } from "@/types";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { cn } from "@/lib/utils/cn";

interface PhotoGalleryProps {
  photos: Photo[];
  columns?: 2 | 3 | 4 | 5;
  aspect?: "square" | "video";
  className?: string;
  watermark?: boolean;
}

function WatermarkOverlay() {
  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 overflow-hidden">
      {/* 3×3 grid of logos covering all areas including light backgrounds */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
        {Array.from({ length: 9 }).map((_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src="/images/LogoBranco.png"
            alt=""
            aria-hidden="true"
            className="w-16 opacity-35 rotate-[-20deg] m-auto"
            draggable={false}
          />
        ))}
      </div>
    </div>
  );
}

export default function PhotoGallery({ photos, columns = 4, aspect = "square", className, watermark = false }: PhotoGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const colClass = { 2: "grid-cols-2", 3: "grid-cols-2 sm:grid-cols-3", 4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", 5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" }[columns];
  const aspectClass = aspect === "video" ? "aspect-video" : "aspect-square";

  const prev = () => setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : 0));
  const next = () => setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : 0));

  return (
    <>
      <div className={cn(`grid gap-2 sm:gap-3`, colClass, className)}>
        {photos.map((photo, i) => (
          <motion.div
            key={i}
            whileHover="hover"
            className={cn("group relative overflow-hidden rounded-lg cursor-pointer", aspectClass)}
            onClick={() => setLightboxIndex(i)}
            onContextMenu={(e) => e.preventDefault()}
          >
            {photo.thumbnailSrc ?? photo.src ? (
              <Image src={photo.thumbnailSrc ?? photo.src} alt={photo.alt} fill className="object-cover" sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" />
            ) : (
              <PlaceholderImage className="w-full h-full rounded-none border-none" label={photo.alt} />
            )}
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-brand-purple-950/0 group-hover:bg-brand-purple-950/60 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100" size={28} />
            </div>
            {watermark && <WatermarkOverlay />}
            {/* Caption */}
            {photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/70 to-transparent px-3 py-3">
                <p className="text-white text-xs">{photo.caption}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[500] flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
              className="absolute top-5 right-5 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors z-10"
              aria-label="Fechar"
            >
              <X size={28} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors z-10"
              aria-label="Anterior"
            >
              <ChevronLeft size={36} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors z-10"
              aria-label="Próxima"
            >
              <ChevronRight size={36} />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
              className="relative rounded-xl overflow-hidden flex items-center justify-center img-protected"
            >
              {photos[lightboxIndex]?.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photos[lightboxIndex].src}
                  alt={photos[lightboxIndex].alt}
                  className="max-w-[85vw] max-h-[82vh] w-auto h-auto rounded-xl object-contain"
                  draggable={false}
                />
              ) : (
                <PlaceholderImage className="min-w-[320px] min-h-[240px] rounded-none border-none" label={photos[lightboxIndex]?.alt} />
              )}
              {watermark && <WatermarkOverlay />}
            </motion.div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
