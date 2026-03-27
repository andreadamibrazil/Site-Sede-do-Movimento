"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageCircle,
  Briefcase,
  Megaphone,
} from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import ContactForm from "@/components/sections/ContactForm";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/lib/constants/siteConfig";

const contactInfo = [
  {
    icon: Phone,
    label: "Telefone",
    value: siteConfig.phone,
    href: `tel:${siteConfig.phone.replace(/\D/g, "")}`,
  },
  {
    icon: Mail,
    label: "E-mail",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
  },
  {
    icon: MapPin,
    label: "Endereço",
    value: siteConfig.address.full,
    href: "https://maps.google.com/?q=Rio+Comprido+Rio+de+Janeiro+RJ",
  },
  {
    icon: ExternalLink,
    label: "Instagram",
    value: "@sededomovimento",
    href: siteConfig.social.instagram,
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: "Clique para conversar",
    href: siteConfig.social.whatsapp,
  },
];

const subPages = [
  {
    icon: Briefcase,
    title: "Trabalhe Conosco",
    description: "Faça parte do nosso time",
    href: "/contato/trabalhe-conosco",
  },
  {
    icon: Megaphone,
    title: "Ouvidoria",
    description: "Canal de escuta e transparência",
    href: "/contato/ouvidoria",
  },
];

export default function ContatoPage() {
  return (
    <>
      <PageHero
        eyebrow="Fale Conosco"
        title="Contato"
        subtitle="Estamos aqui para responder suas dúvidas e receber seu contato"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Contato" },
        ]}
      />

      {/* Main contact section */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact form — 3 cols */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                  Envie uma mensagem
                </h2>
                <ContactForm formType="general" />
              </ScrollReveal>
            </div>

            {/* Contact info — 2 cols */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.1}>
                <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                  Informações de contato
                </h2>
                <div className="space-y-4">
                  {contactInfo.map(({ icon: Icon, label, value, href }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-brand-purple-200 hover:bg-brand-light transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 group-hover:border-brand-purple-300 flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-brand-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">
                          {label}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">{value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-pages */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-4 text-center">
            Outros canais
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 text-center mb-10">
            Canais específicos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {subPages.map(({ icon: Icon, title, description, href }, i) => (
              <ScrollReveal key={href} delay={i * 0.1}>
                <Link
                  href={href}
                  className="card-hover flex flex-col items-start gap-4 bg-white border border-gray-100 rounded-2xl p-8 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-light group-hover:bg-brand-purple-600 flex items-center justify-center transition-colors">
                    <Icon
                      size={22}
                      className="text-brand-purple-600 group-hover:text-white transition-colors"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1">{title}</h3>
                    <p className="text-gray-500 text-sm">{description}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
