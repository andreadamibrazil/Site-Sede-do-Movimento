"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { BLUR_DATA_URL } from "@/lib/utils/blurDataUrl";
import { trackGalleryOpen } from "@/lib/analytics";

export interface GalleryPhoto {
  src: string;      // image URL (can be empty for placeholder)
  alt: string;
  caption?: string;
}

interface GalleryViewerProps {
  photos: GalleryPhoto[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

export default function GalleryViewer({ photos, columns = 4, className }: GalleryViewerProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isOpen = lightboxIndex !== null;
  const current = isOpen ? photos[lightboxIndex!] : null;

  const prev = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  }, [photos.length]);

  const next = useCallback(() => {
    setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null));
  }, [photos.length]);

  const close = useCallback(() => setLightboxIndex(null), []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, prev, next, close]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { next(); } else { prev(); }
    }
    setTouchStart(null);
  };

  const colClass = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
  }[columns];

  return (
    <>
      {/* Grid */}
      <div className={`grid ${colClass} gap-2 sm:gap-3 ${className ?? ""}`}>
        {photos.map((photo, i) => (
          <button
            key={i}
            onClick={() => { setLightboxIndex(i); trackGalleryOpen(photo.alt); }}
            onContextMenu={(e) => e.preventDefault()}
            className="group relative overflow-hidden rounded-lg aspect-square cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-600"
            aria-label={`Abrir foto: ${photo.alt}`}
          >
            {photo.src ? (
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading={i < 4 ? "eager" : "lazy"}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            ) : (
              <PlaceholderImage
                label={photo.alt}
                className="absolute inset-0 w-full h-full rounded-none border-none"
              />
            )}
            <div className="absolute inset-0 bg-brand-purple-950/0 group-hover:bg-brand-purple-950/40 transition-all duration-300 flex items-center justify-center">
              <ZoomIn
                size={28}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
              />
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {isOpen && current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center"
            onClick={close}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Fechar"
            >
              <X size={22} />
            </button>

            {/* Counter */}
            <p className="absolute top-5 left-5 text-white/60 text-sm">
              {(lightboxIndex ?? 0) + 1} / {photos.length}
            </p>

            {/* Prev */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-5xl max-h-[85vh] w-full mx-16"
              onClick={(e) => e.stopPropagation()}
              onContextMenu={(e) => e.preventDefault()}
            >
              {current.src ? (
                <div className="img-protected">
                  <Image
                    src={current.src}
                    alt={current.alt}
                    width={1200}
                    height={800}
                    className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg"
                    priority
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    draggable={false}
                  />
                </div>
              ) : (
                <div className="aspect-[4/3] w-full max-w-xl mx-auto">
                  <PlaceholderImage label={current.alt} className="w-full h-full rounded-lg" />
                </div>
              )}
              {current.caption && (
                <p className="text-white/70 text-sm text-center mt-3 px-4">{current.caption}</p>
              )}
            </motion.div>

            {/* Next */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Próxima"
            >
              <ChevronRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
