"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { TimelineEntry } from "@/types";
import { cn } from "@/lib/utils/cn";

interface TimelineSectionProps {
  entries: TimelineEntry[];
  className?: string;
}

export default function TimelineSection({ entries, className }: TimelineSectionProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Vertical line */}
      <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-brand-purple-600 to-brand-secondary -translate-x-1/2 hidden sm:block" />

      <div className="space-y-12">
        {entries.map((entry, i) => {
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={fadeUp}
              className={cn("relative flex items-start gap-6 sm:gap-0", isLeft ? "sm:flex-row" : "sm:flex-row-reverse")}
            >
              {/* Card */}
              <div className={cn("w-full sm:w-[calc(50%-32px)] bg-white rounded-xl border border-gray-100 shadow-md p-6 hover:shadow-lg transition-shadow", isLeft ? "sm:mr-8 sm:text-right" : "sm:ml-8")}>
                <span className="inline-block text-brand-purple-600 font-bold text-xs uppercase tracking-wider mb-2">{entry.year}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{entry.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{entry.description}</p>
              </div>

              {/* Node */}
              <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-6 w-4 h-4 rounded-full bg-white border-[3px] border-brand-purple-600 shadow-[0_0_0_4px_rgba(106,0,255,0.15)] z-10" />

              {/* Year badge (mobile) */}
              <div className="sm:hidden absolute left-0 top-4 w-8 h-8 rounded-full bg-brand-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                {entry.year.slice(2)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
