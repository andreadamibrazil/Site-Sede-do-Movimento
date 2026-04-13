"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import type { SanitySiteSettings } from "@/lib/sanity/types";

export default function SiteShell({ children, settings }: { children: React.ReactNode; settings?: SanitySiteSettings | null }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
