import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("contato", {
    title: "Contato",
    description: "Entre em contato com a Sede do Movimento. Tire dúvidas, solicite informações ou venha nos visitar.",
  });
}

export default function ContatoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
