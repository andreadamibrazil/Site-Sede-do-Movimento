"use client";

import Link from "next/link";
import { useDraftModeEnvironment } from "next-sanity/hooks";
import { EyeOff } from "lucide-react";

export function DisableDraftMode() {
  const environment = useDraftModeEnvironment();

  if (environment !== "live" && environment !== "unknown") {
    return null;
  }

  return (
    <Link
      href="/api/draft-mode/disable"
      className="fixed bottom-5 right-5 z-[9998] flex items-center gap-2 bg-brand-purple-950 text-white px-4 py-2.5 rounded-xl shadow-lg border border-brand-purple-700 text-sm font-semibold hover:bg-brand-purple-900 transition-colors"
    >
      <EyeOff size={15} className="text-brand-pink" />
      Sair do modo preview
    </Link>
  );
}
