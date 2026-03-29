import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("contato", {
    title: "Contato",
    description: "Entre em contato com a Sede do Movimento. Av. Paulo de Frontin, 698, Rio Comprido, RJ. Informações sobre matrículas, horários e Prática de Montagem.",
  });
}

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
