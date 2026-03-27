"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { trackCTAClick } from "@/lib/analytics";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

interface HeroSectionProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageSrc?: string;
  videoId?: string;
  showScrollIndicator?: boolean;
  minHeight?: string;
}

export default function HeroSection({
  eyebrow = "Bem-vindo à",
  title = "Arte que Transforma Vidas",
  titleAccent,
  subtitle,
  primaryCta = { label: "Conheça as turmas", href: "/ensino" },
  secondaryCta = { label: "Saiba mais", href: "/a-escola" },
  showScrollIndicator = true,
  minHeight = "min-h-screen",
}: HeroSectionProps) {
  return (
    <section className={`relative ${minHeight} flex items-center overflow-hidden bg-brand-purple-950`}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <PlaceholderImage className="w-full h-full rounded-none border-none opacity-30" label="Foto Hero" />
        <div className="absolute inset-0 bg-gradient-hero" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-brand-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-pink/10 blur-[100px] pointer-events-none" />

      {/* Content */}
      <div className="container-main relative z-10 py-32 pt-40">
        <div className="max-w-3xl">
          {eyebrow && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 mb-5"
            >
              <span className="w-0.5 h-5 bg-brand-pink rounded-full" />
              <p className="text-brand-pink font-bold text-xs uppercase tracking-[0.14em]">{eyebrow}</p>
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6"
          >
            {title}
            {titleAccent && (
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-brand-pink">
                {titleAccent}
              </span>
            )}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.65 }}
              className="text-lg text-white/75 leading-relaxed max-w-xl mb-10"
            >
              {subtitle}
            </motion.p>
          )}

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.85 }}
            className="flex flex-wrap gap-3"
          >
            <Link href={primaryCta.href} onClick={() => trackCTAClick(primaryCta.label, 'hero-section', 'section')}>
              <Button variant="cta" size="xl" rightIcon={<ArrowRight size={18} />}>
                {primaryCta.label}
              </Button>
            </Link>
            <Link href={secondaryCta.href} onClick={() => trackCTAClick(secondaryCta.label, 'hero-section', 'section')}>
              <Button variant="outline" size="xl">
                {secondaryCta.label}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      {showScrollIndicator && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-7 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-scroll-bounce" />
          </div>
          <span className="text-white/40 text-xs">Role para baixo</span>
        </motion.div>
      )}
    </section>
  );
}
