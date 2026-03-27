import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/layout/SiteShell";
import { SanityLive } from "@/sanity/lib/live";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sede do Movimento — Arte, Movimento e Transformação",
    template: "%s | Sede do Movimento",
  },
  description: "Complexo cultural e escola de artes cênicas no Rio de Janeiro. Dança, teatro, música e formação artística completa para crianças, jovens e adultos.",
  keywords: ["escola de dança", "teatro", "música", "artes cênicas", "Rio de Janeiro", "formação artística"],
  openGraph: {
    title: "Sede do Movimento",
    description: "Arte, Movimento e Transformação",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={jakarta.variable}>
      <body className="font-sans antialiased">
        <SiteShell>{children}</SiteShell>
        <SanityLive />
      </body>
    </html>
  );
}
