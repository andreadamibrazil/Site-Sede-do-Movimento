"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { fadeUp } from "@/lib/animations";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  dark?: boolean;
  className?: string;
  titleClassName?: string;
  gradient?: boolean;
  animate?: boolean;
}

export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "center",
  dark = false,
  className,
  titleClassName,
  gradient = false,
  animate = true,
}: SectionTitleProps) {
  const Wrapper = animate ? motion.div : "div";
  const wrapperProps = animate
    ? { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-80px" }, variants: fadeUp }
    : {};

  return (
    <Wrapper
      {...(wrapperProps as Record<string, unknown>)}
      className={cn(
        "mb-8 md:mb-12",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {eyebrow && (
        <p className={cn("text-eyebrow uppercase tracking-widest mb-3", dark ? "text-brand-pink" : "text-brand-purple-600")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn(
        "text-3xl sm:text-4xl lg:text-h2 font-extrabold leading-tight",
        dark ? "text-white" : "text-gray-900",
        gradient && "text-gradient",
        titleClassName
      )}>
        {title}
      </h2>
      {subtitle && (
        <p className={cn(
          "mt-4 text-body-lg max-w-2xl leading-relaxed",
          align === "center" && "mx-auto",
          dark ? "text-white/70" : "text-gray-500"
        )}>
          {subtitle}
        </p>
      )}
    </Wrapper>
  );
}
