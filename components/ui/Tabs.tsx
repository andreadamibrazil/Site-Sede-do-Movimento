"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  className?: string;
}

export default function Tabs({ tabs, className }: TabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);

  return (
    <div className={className}>
      <div className="border-b border-gray-200 flex gap-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeId === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                "relative px-5 py-3 text-[15px] whitespace-nowrap rounded-t-sm transition-colors duration-200 shrink-0",
                isActive ? "font-semibold text-brand-purple-600" : "font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="tabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple-600 -mb-px"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="pt-8"
        >
          {tabs.find((t) => t.id === activeId)?.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
