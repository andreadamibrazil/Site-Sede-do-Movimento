"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Espetaculo } from "@/types";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils/cn";

interface EspetaculoCardProps {
  espetaculo: Espetaculo;
  featured?: boolean;
}

export default function EspetaculoCard({ espetaculo, featured = false }: EspetaculoCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-shadow duration-300",
        featured && "ring-2 ring-brand-purple-600"
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Banner: ${espetaculo.title}`} />
        {featured && (
          <div className="absolute top-3 left-3">
            <Badge color="primary" variant="solid" size="sm">Em cartaz</Badge>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-brand-purple-600/90 text-white text-sm font-bold px-3 py-1 rounded-full">
          {espetaculo.year}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-brand-purple-600 transition-colors">
          {espetaculo.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-3">
          <MapPin size={13} />
          <span>{espetaculo.venue}</span>
        </div>
        {espetaculo.description && (
          <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">{espetaculo.description}</p>
        )}
        <Link
          href={`/a-escola/espetaculos#${espetaculo.slug}`}
          className="inline-flex items-center gap-1.5 text-brand-purple-600 text-sm font-semibold hover:gap-2.5 transition-all"
        >
          Saiba mais <ArrowRight size={14} />
        </Link>
      </div>
    </motion.div>
  );
}
