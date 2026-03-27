"use client";

import { ShieldCheck, Lock, Clock } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import ContactForm from "@/components/sections/ContactForm";
import ScrollReveal from "@/components/ui/ScrollReveal";

const commitments = [
  {
    icon: ShieldCheck,
    title: "Sigilo garantido",
    description:
      "Todas as manifestações são tratadas com total confidencialidade. Suas informações nunca serão compartilhadas sem seu consentimento.",
  },
  {
    icon: Lock,
    title: "Conformidade com a LGPD",
    description:
      "Seguimos rigorosamente a Lei Geral de Proteção de Dados (Lei 13.709/2018). Seus dados são usados exclusivamente para responder sua manifestação.",
  },
  {
    icon: Clock,
    title: "Resposta em até 5 dias úteis",
    description:
      "Nos comprometemos a analisar e responder todas as manifestações em até 5 dias úteis a partir do recebimento.",
  },
];

export default function OuvidoriaPage() {
  return (
    <>
      <PageHero
        eyebrow="Canal de Escuta"
        title="Ouvidoria"
        subtitle="Um espaço seguro para sugestões, críticas e elogios"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Contato", href: "/contato" },
          { label: "Ouvidoria" },
        ]}
      />

      {/* Info section */}
      <section className="section-padding bg-white">
        <div className="container-main">
          {/* Intro */}
          <ScrollReveal>
            <div className="max-w-2xl mb-12">
              <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">
                Canal de Escuta
              </p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight mb-4">
                O que é a Ouvidoria?
              </h2>
              <div className="space-y-4 text-gray-500 leading-relaxed">
                <p>
                  A Ouvidoria da Sede do Movimento é o canal oficial para que alunos, responsáveis,
                  colaboradores e comunidade possam registrar sugestões, críticas, elogios e
                  quaisquer manifestações sobre nossas atividades, serviços e conduta institucional.
                </p>
                <p>
                  Acreditamos que a escuta ativa é fundamental para o crescimento e para a
                  construção de uma instituição mais justa, transparente e comprometida com
                  quem faz parte da nossa comunidade.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Commitments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {commitments.map(({ icon: Icon, title, description }, i) => (
              <ScrollReveal key={title} delay={i * 0.1}>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 h-full">
                  <div className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center mb-4">
                    <Icon size={20} className="text-brand-purple-600" />
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Form + guarantee */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <h3 className="text-xl font-extrabold text-gray-900 mb-6">
                  Registre sua manifestação
                </h3>
                <ContactForm formType="ouvidoria" />
              </ScrollReveal>
            </div>

            {/* Guarantee card */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.15}>
                <div className="sticky top-28 bg-gradient-to-br from-brand-purple-700 to-brand-secondary rounded-2xl p-8 text-white">
                  <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-5">
                    <ShieldCheck size={24} className="text-white" />
                  </div>
                  <h3 className="font-extrabold text-white text-xl mb-3 leading-snug">
                    Nosso compromisso com você
                  </h3>
                  <p className="text-white/80 leading-relaxed text-sm mb-6">
                    Sua mensagem é tratada com sigilo e respeito. Respondemos em até{" "}
                    <strong className="text-white">5 dias úteis</strong>.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Anonimato garantido se solicitado",
                      "Análise imparcial e responsável",
                      "Retorno formal por e-mail",
                      "Conformidade total com a LGPD",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-white/80">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-pink shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
