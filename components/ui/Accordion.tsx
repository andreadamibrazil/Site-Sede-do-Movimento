"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AccordionItem {
  id: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

export default function Accordion({ items, className }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className={cn(
              "border rounded-md overflow-hidden transition-all duration-200",
              isOpen
                ? "border-brand-secondary bg-white border-l-[3px] border-l-brand-purple-600"
                : "border-gray-200 bg-white"
            )}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className={cn(
                "w-full flex items-center justify-between px-6 py-5 text-left transition-colors duration-150",
                isOpen ? "bg-brand-light text-brand-purple-600" : "hover:bg-gray-50"
              )}
            >
              <span className="font-semibold text-base">{item.question}</span>
              <ChevronDown
                size={20}
                className={cn("shrink-0 ml-4 transition-transform duration-300", isOpen && "rotate-180", isOpen ? "text-brand-purple-600" : "text-gray-400")}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 pt-1 text-gray-500 text-[15px] leading-relaxed">
                    {item.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
