"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import type { SanitySiteSettings } from "@/lib/sanity/types";

export default function SiteShell({ children, settings }: { children: React.ReactNode; settings?: SanitySiteSettings | null }) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith("/studio");
  const isLegal = pathname === "/politica-de-privacidade" || pathname === "/termos-de-uso";
  const isPauta = pathname?.startsWith("/pauta");

  if (isStudio || isLegal || isPauta) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader whatsapp={settings?.whatsapp} phone={settings?.phone} />
      <main>{children}</main>
      <SiteFooter settings={settings} />
    </>
  );
}
