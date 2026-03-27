"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerItem } from "@/lib/animations";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "fadeUp" | "staggerItem";
}

export default function ScrollReveal({ children, className, delay = 0, variant = "fadeUp" }: ScrollRevealProps) {
  const variants = variant === "staggerItem" ? staggerItem : fadeUp;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}
