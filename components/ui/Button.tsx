"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import { ButtonVariant, ButtonSize } from "@/types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  asChild?: boolean;
  href?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   "bg-brand-purple-600 text-white shadow-[0_2px_12px_rgba(106,0,255,0.25)] hover:bg-brand-purple-700 hover:shadow-[0_6px_20px_rgba(106,0,255,0.35)] hover:scale-[1.02] hover:-translate-y-px active:scale-[0.99] active:translate-y-0 active:bg-brand-purple-800 disabled:bg-brand-purple-200 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed",
  secondary: "bg-brand-secondary text-white shadow-[0_4px_14px_rgba(155,92,255,0.3)] hover:bg-brand-secondary-600 hover:shadow-[0_8px_20px_rgba(155,92,255,0.4)] hover:scale-[1.02] hover:-translate-y-px disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed",
  ghost:     "bg-transparent border-2 border-brand-purple-600 text-brand-purple-600 hover:bg-brand-light hover:text-brand-purple-700 hover:scale-[1.02] active:bg-brand-purple-100 active:scale-[0.99] disabled:border-brand-purple-200 disabled:text-brand-purple-200 disabled:scale-100 disabled:cursor-not-allowed",
  outline:   "bg-transparent border-2 border-white/60 text-white hover:bg-white/10 hover:border-white hover:scale-[1.02] active:bg-white/20 active:scale-[0.99] disabled:border-white/25 disabled:text-white/35 disabled:scale-100 disabled:cursor-not-allowed",
  cta:       "text-white shadow-brand-md hover:shadow-brand-lg hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed",
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: "min-h-[36px] px-4 py-2 text-xs  font-semibold tracking-[0.2px] rounded-xl gap-1.5",
  sm: "min-h-[44px] px-5 py-3 text-sm  font-semibold tracking-[0.2px] rounded-xl gap-2",
  md: "min-h-[48px] px-7 py-[13px] text-[15px] font-semibold tracking-[0.2px] rounded-2xl gap-2",
  lg: "min-h-[52px] px-8 py-[14px] text-base font-bold   tracking-[0.2px] rounded-2xl gap-2.5",
  xl: "min-h-[56px] px-10 py-4 text-lg  font-bold   tracking-[0.2px] rounded-2xl gap-3",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, fullWidth, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    const baseClass = cn(
      "inline-flex items-center justify-center transition-all duration-200 ease-out select-none whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple-600 focus-visible:ring-offset-2",
      variant === "cta" && "bg-gradient-cta bg-[length:200%_100%] bg-left",
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && "w-full",
      className
    );

    return (
      <button ref={ref} disabled={isDisabled} className={baseClass} {...props}>
        {loading ? (
          <Loader2 className="animate-spin" size={16} />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children && <span className={loading ? "opacity-0" : ""}>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
