import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("contato/trabalhe-conosco", {
    title: "Trabalhe Conosco",
    description: "Faça parte da equipe da Sede do Movimento. Envie seu currículo e venha crescer com a gente.",
  });
}

export default function TrabalheConoscoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
