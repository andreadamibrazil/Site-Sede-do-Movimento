"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type HeroSlide } from "@/lib/constants/slides";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { BLUR_DATA_URL } from "@/lib/utils/blurDataUrl";
import { trackHeroClick } from "@/lib/analytics";

const AUTOPLAY_INTERVAL = 6000; // ms

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent((index + slides.length) % slides.length);
  }, [slides.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Autoplay
  useEffect(() => {
    if (!isPlaying || slides.length <= 1) return;
    timerRef.current = setInterval(goNext, AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, goNext, slides.length]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only register horizontal swipe if dx is dominant
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) { goNext(); } else { goPrev(); }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (slides.length === 0) return null;

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-gray-900 min-h-[360px] h-[58vh] sm:h-[72vh] lg:h-[85vh] lg:max-h-[880px]"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => setIsPlaying(true)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Galeria de destaques"
    >
      {/* ── Slides ── */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: "easeInOut" }}
        >
          <SlideContent slide={slide} priority={current === 0} />
        </motion.div>
      </AnimatePresence>

      {/* ── Prev / Next arrows ── */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); goPrev(); }}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); goNext(); }}
            aria-label="Próximo slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/55 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* ── Dot indicators ── */}
      {slides.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              className="group relative h-2 overflow-hidden rounded-full transition-all duration-300 focus-visible:outline-none"
              style={{ width: i === current ? "28px" : "8px" }}
            >
              {/* Background track */}
              <span className="absolute inset-0 bg-white/30 rounded-full" />
              {/* Active fill */}
              {i === current && isPlaying && (
                <motion.span
                  className="absolute inset-y-0 left-0 bg-white rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                  key={`fill-${slide.id}`}
                />
              )}
              {i === current && !isPlaying && (
                <span className="absolute inset-0 bg-white rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Autoplay pause indicator ── */}
      <AnimatePresence>
        {!isPlaying && slides.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 text-white/80 text-xs"
          >
            <span className="w-1 h-3 bg-current rounded-sm inline-block" />
            <span className="w-1 h-3 bg-current rounded-sm inline-block" />
            <span className="ml-1">Pausado</span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── Individual slide (image + optional link) ──────────────────────────────
function SlideContent({ slide, priority }: { slide: HeroSlide; priority: boolean }) {
  const hasLink = !!slide.link;

  const inner = (
    <div className={`relative w-full h-full group ${hasLink ? "cursor-pointer" : "cursor-default"}`}>
      {/* Image */}
      {slide.image ? (
        <Image
          src={slide.image}
          alt={slide.alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`object-cover object-center ${hasLink ? "transition-transform duration-[8000ms] ease-linear group-hover:scale-[1.03]" : ""}`}
          quality={85}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      ) : (
        <PlaceholderImage label={slide.alt} className="absolute inset-0 w-full h-full" />
      )}
      {/* Overlay: stronger at top (logo legibility) and bottom (dots/arrows) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/40 pointer-events-none" />
    </div>
  );

  // No link — just render image
  if (!hasLink) return <div className="absolute inset-0">{inner}</div>;

  // Section anchor (starts with #) — use plain <a> for same-page scroll
  if (slide.link!.startsWith("#")) {
    return (
      <a href={slide.link} className="absolute inset-0 block" onClick={() => trackHeroClick(slide.alt)}>
        {inner}
      </a>
    );
  }

  // External link
  if (slide.link!.startsWith("http")) {
    return (
      <a href={slide.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 block" onClick={() => trackHeroClick(slide.alt)}>
        {inner}
      </a>
    );
  }

  // Internal page
  return (
    <Link href={slide.link!} className="absolute inset-0 block" onClick={() => trackHeroClick(slide.alt)}>
      {inner}
    </Link>
  );
}
