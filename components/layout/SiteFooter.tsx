import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin } from "lucide-react";
import { siteConfig } from "@/lib/constants/siteConfig";
import NewsletterForm from "@/components/ui/NewsletterForm";
import type { SanitySiteSettings } from "@/lib/sanity/types";

function IconInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconYoutube({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function IconTiktok({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  );
}

const footerColumns = [
  {
    title: "A Escola",
    links: [
      { label: "Por que existimos", href: "/a-escola/apresentacao" },
      { label: "Nossa história", href: "/a-escola/historia-e-estrutura" },
      { label: "Resultados", href: "/a-escola/resultados" },
      // { label: "Parcerias", href: "/a-escola/parcerias" }, // hidden temporariamente
      { label: "Espetáculos", href: "/a-escola/espetaculos" },
      { label: "Projeto Social", href: "/a-escola/projeto-social" },
      { label: "Equipe", href: "/ensino/equipe" },
    ],
  },
  {
    title: "Ensino",
    links: [
      { label: "Modalidades", href: "/ensino/modalidades" },
      { label: "Metodologia", href: "/ensino/metodologia" },
      { label: "Jornadas Artísticas", href: "/ensino/jornadas-artisticas" },
      { label: "Formação Infantil", href: "/ensino/formacao-infantil" },
      { label: "Horários", href: "/ensino/horarios" },
      { label: "Eventos Extras", href: "/ensino/eventos-extras" },
    ],
  },
  {
    title: "Projetos",
    links: [
      { label: "A Companhia", href: "/companhia-profissional" },
      { label: "A Produtora", href: "/produtora" },
      { label: "Audiovisual", href: "/audiovisual" },
      { label: "O Ateliê", href: "/atelier" },
      { label: "Galerias", href: "/galerias" },
      { label: "Blog", href: "/blog" },
    ],
  },
];

export default function SiteFooter({ settings }: { settings?: SanitySiteSettings | null }) {
  const phone = settings?.phone ?? siteConfig.phone;
  const email = settings?.email ?? siteConfig.email;
  const address = settings?.address ?? siteConfig.address.full;
  const tagline = settings?.footerTagline ?? "Complexo cultural e escola de artes cênicas. Formando artistas e transformando vidas desde 2021.";
  const social = {
    instagram: settings?.instagram ?? siteConfig.social.instagram,
    youtube: settings?.youtube ?? siteConfig.social.youtube,
    tiktok: settings?.tiktok ?? siteConfig.social.tiktok,
    facebook: settings?.facebook ?? siteConfig.social.facebook,
  };

  return (
    <footer className="bg-gradient-dark text-white">
      {/* Main footer */}
      <div className="container-main pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/LogoBranco.png"
                alt="Sede do Movimento"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-[240px] mb-6">
              {tagline}
            </p>

            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: IconInstagram, href: social.instagram, label: "Instagram" },
                { icon: IconYoutube, href: social.youtube, label: "YouTube" },
                { icon: IconTiktok, href: social.tiktok, label: "TikTok" },
                { icon: IconFacebook, href: social.facebook, label: "Facebook" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white hover:bg-brand-purple-600 hover:border-brand-purple-600 transition-all duration-300 hover:scale-110"
                >
                  <Icon size={18} aria-hidden="true" />
                </a>
              ))}
            </div>

            {/* Contact info */}
            <div className="mt-6 space-y-2.5">
              <a href={`tel:${phone}`} className="flex items-center gap-2 text-white/65 hover:text-white text-sm transition-colors">
                <Phone size={14} className="text-white/40" aria-hidden="true" />
                {phone}
              </a>
              <a href={`mailto:${email}`} className="flex items-center gap-2 text-white/65 hover:text-white text-sm transition-colors">
                <Mail size={14} className="text-white/40" aria-hidden="true" />
                {email}
              </a>
              <div className="flex items-center gap-2 text-white/65 text-sm">
                <MapPin size={14} className="text-white/40 shrink-0" aria-hidden="true" />
                {address}
              </div>
            </div>
          </div>

          {/* Nav columns */}
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-bold text-xs uppercase tracking-[0.08em] mb-5">
                {col.title}
              </h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm transition-all duration-200 hover:pl-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h4 className="font-bold text-white text-lg mb-1">Fique por dentro</h4>
              <p className="text-white/55 text-sm">Receba novidades sobre eventos, cursos e espetáculos.</p>
            </div>
            <div className="w-full md:w-auto md:min-w-80">
              <NewsletterForm theme="dark" />
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} Sede do Movimento. Todos os direitos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="/privacidade" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              Política de Privacidade
            </Link>
            <Link href="/termos" className="text-white/40 hover:text-white/70 text-xs transition-colors">
              Termos de Uso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
