import { cn } from "@/lib/utils/cn";

type BadgeVariant = "solid" | "outline" | "subtle";
type BadgeColor = "primary" | "secondary" | "accent" | "success" | "warning" | "error" | "neutral";
type BadgeSize = "xs" | "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  color?: BadgeColor;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<BadgeColor, Record<BadgeVariant, string>> = {
  primary: {
    solid: "bg-brand-purple-600 text-white",
    outline: "border border-brand-purple-600 text-brand-purple-600",
    subtle: "bg-brand-light text-brand-purple-600",
  },
  secondary: {
    solid: "bg-brand-secondary text-white",
    outline: "border border-brand-secondary text-brand-secondary",
    subtle: "bg-[rgba(155,92,255,0.1)] text-brand-secondary",
  },
  accent: {
    solid: "bg-brand-pink text-white",
    outline: "border border-brand-pink text-brand-pink-600",
    subtle: "bg-brand-pink-50 text-brand-pink-600",
  },
  success: {
    solid: "bg-emerald-600 text-white",
    outline: "border border-emerald-500 text-emerald-700",
    subtle: "bg-emerald-50 text-emerald-700",
  },
  warning: {
    solid: "bg-amber-600 text-white",
    outline: "border border-amber-500 text-amber-700",
    subtle: "bg-amber-50 text-amber-700",
  },
  error: {
    solid: "bg-red-600 text-white",
    outline: "border border-red-500 text-red-700",
    subtle: "bg-red-50 text-red-700",
  },
  neutral: {
    solid: "bg-gray-600 text-white",
    outline: "border border-gray-300 text-gray-600",
    subtle: "bg-gray-100 text-gray-600",
  },
};

const sizeMap: Record<BadgeSize, string> = {
  xs: "h-[18px] px-1.5 text-[10px] tracking-wide",
  sm: "h-[22px] px-2 text-[11px] tracking-wide",
  md: "h-[26px] px-3 text-xs tracking-wider",
};

export default function Badge({ variant = "subtle", color = "primary", size = "sm", children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center justify-center font-semibold rounded-xs uppercase leading-none", colorMap[color][variant], sizeMap[size], className)}>
      {children}
    </span>
  );
}
