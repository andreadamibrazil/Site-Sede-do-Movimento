import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface TagProps {
  label: string;
  href?: string;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Tag({ label, href, selected, className, onClick }: TagProps) {
  const base = cn(
    "inline-flex items-center h-8 px-3.5 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none",
    selected
      ? "bg-brand-purple-600 text-white shadow-brand-sm"
      : "bg-gray-50 border border-gray-200 text-gray-500 hover:bg-brand-light hover:border-brand-purple-200 hover:text-brand-purple-600",
    className
  );
  if (href) return <Link href={href} className={base}>{label}</Link>;
  return <button onClick={onClick} className={base}>{label}</button>;
}
