"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { FAQItem } from "@/components/schema/FAQSchema";

interface Props {
  items: FAQItem[];
}

export default function FAQSection({ items }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto divide-y divide-gray-100">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between gap-4 py-5 text-left"
            aria-expanded={open === i}
          >
            <span className="font-semibold text-gray-900 text-base leading-snug">{item.question}</span>
            <ChevronDown
              size={18}
              className={cn("shrink-0 text-brand-purple-600 transition-transform duration-200", open === i && "rotate-180")}
            />
          </button>
          {open === i && (
            <p className="pb-5 text-gray-500 text-sm leading-relaxed">{item.answer}</p>
          )}
        </div>
      ))}
    </div>
  );
}
