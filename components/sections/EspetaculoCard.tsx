"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MapPin, Images, ArrowRight } from "lucide-react";
import Image from "next/image";
import type { SanityEspetaculoAlbum } from "@/lib/sanity/types";
import { urlFor } from "@/sanity/lib/image";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import { cn } from "@/lib/utils/cn";

interface EspetaculoCardProps {
  espetaculo: SanityEspetaculoAlbum;
  featured?: boolean;
}

export default function EspetaculoCard({ espetaculo, featured = false }: EspetaculoCardProps) {
  const href = `/galerias/fotos/${espetaculo.slug}`;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-shadow duration-300",
        featured && "ring-2 ring-brand-purple-600"
      )}
    >
      <Link href={href} className="flex h-full flex-col" aria-label={`Ver galeria de fotos: ${espetaculo.title}`}>
        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
          {espetaculo.coverImage ? (
            <Image
              src={urlFor(espetaculo.coverImage).width(800).height(450).fit("crop").crop("focalpoint").auto("format").quality(82).url()}
              alt={espetaculo.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Banner: ${espetaculo.title}`} />
          )}

          {espetaculo.year != null && (
            <div className="absolute top-3 right-3 bg-brand-purple-600/90 text-white text-sm font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              {espetaculo.year}
            </div>
          )}

          {espetaculo.photoCount != null && espetaculo.photoCount > 0 && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/55 text-white text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
              <Images size={13} />
              {espetaculo.photoCount} foto{espetaculo.photoCount !== 1 ? "s" : ""}
            </div>
          )}

          {/* Hover overlay — consistente com a listagem de álbuns */}
          <div className="absolute inset-0 bg-brand-purple-950/0 group-hover:bg-brand-purple-950/45 transition-all duration-300 flex items-center justify-center">
            <span className="flex items-center gap-2 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              Ver galeria <ArrowRight size={14} />
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-brand-purple-600 transition-colors">
            {espetaculo.title}
          </h3>

          {espetaculo.venue && (
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
              <MapPin size={13} />
              <span>{espetaculo.venue}</span>
            </div>
          )}

          {espetaculo.description && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{espetaculo.description}</p>
          )}

          {/* CTA — span estilizado (link único envolve o card; HTML válido) */}
          <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-brand-purple-600 font-semibold text-sm group-hover:gap-3 transition-all">
            Ver galeria de fotos <ArrowRight size={15} />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
