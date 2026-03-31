import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("galerias-fotos", {
    title: "Galeria de Fotos",
    description: "Registros fotográficos de espetáculos, ensaios e eventos da Sede do Movimento — escola de artes cênicas no Rio Comprido, Rio de Janeiro.",
  });
}

export default function FotosLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
