"use client";

import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { Stat } from "@/types";
import { cn } from "@/lib/utils/cn";

interface StatsSectionProps {
  stats: Stat[];
  dark?: boolean;
  className?: string;
}

export default function StatsSection({ stats, dark = false, className }: StatsSectionProps) {
  return (
    <section className={cn(dark ? "bg-gradient-dark" : "bg-white border-y border-gray-100", className)}>
      <div className="container-main py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              variants={staggerItem}
              className={cn(
                "flex flex-col items-center justify-center text-center px-4 py-8 md:p-10",
                dark ? "bg-transparent" : "bg-white"
              )}
            >
              <p className={cn(
                "text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-none",
                dark ? "text-white" : "text-gradient"
              )}>
                {stat.value}
                {stat.suffix && (
                  <span className="text-3xl">{stat.suffix}</span>
                )}
              </p>
              <p className={cn("mt-3 text-sm font-medium", dark ? "text-white/65" : "text-gray-500")}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
