import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("contato/ouvidoria", {
    title: "Ouvidoria",
    description: "Canal direto e confidencial para sugestões, elogios e reclamações sobre a Sede do Movimento.",
  });
}

export default function OuvidoriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
