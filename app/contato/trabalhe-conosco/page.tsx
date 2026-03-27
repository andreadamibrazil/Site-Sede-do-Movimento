"use client";

import { Check } from "lucide-react";
import PageHero from "@/components/sections/PageHero";
import ContactForm from "@/components/sections/ContactForm";
import ScrollReveal from "@/components/ui/ScrollReveal";

const values = [
  "Ambiente criativo e acolhedor",
  "Formação continuada",
  "Trabalho com propósito",
  "Comunidade artística vibrante",
];

export default function TrabalheConoscoPage() {
  return (
    <>
      <PageHero
        eyebrow="Venha para o Time"
        title="Trabalhe Conosco"
        subtitle="Junte-se à nossa equipe de educadores e artistas"
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Contato", href: "/contato" },
          { label: "Trabalhe Conosco" },
        ]}
      />

      {/* Intro section */}
      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Form — 3 cols */}
            <div className="lg:col-span-3">
              <ScrollReveal>
                <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-3">
                  Faça parte
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 leading-tight">
                  Faça parte da Sede do Movimento
                </h2>
                <div className="space-y-4 text-gray-500 leading-relaxed mb-8">
                  <p>
                    A Sede do Movimento é construída por pessoas que acreditam no poder
                    transformador da arte. Nossa equipe é formada por educadores comprometidos,
                    artistas apaixonados e profissionais que entendem que cada aula, cada ensaio
                    e cada espetáculo têm impacto real na vida de quem os vivencia.
                  </p>
                  <p>
                    Se você tem experiência em artes cênicas, educação artística, produção
                    cultural, comunicação ou áreas correlatas — e quer fazer parte de um projeto
                    que une excelência técnica e responsabilidade social — queremos te conhecer.
                    Envie seu currículo e portfólio pelo formulário abaixo.
                  </p>
                </div>
                <ContactForm formType="trabalhe-conosco" />
              </ScrollReveal>
            </div>

            {/* Values — 2 cols */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.15}>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 sticky top-28">
                  <p className="text-brand-purple-600 font-bold text-xs uppercase tracking-widest mb-4">
                    Por que trabalhar aqui
                  </p>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-6 leading-snug">
                    O que você encontra na Sede
                  </h3>
                  <ul className="space-y-4">
                    {values.map((value) => (
                      <li key={value} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-brand-light flex items-center justify-center shrink-0 mt-0.5">
                          <Check size={14} className="text-brand-purple-600" />
                        </div>
                        <span className="text-gray-700 font-medium text-sm leading-relaxed">
                          {value}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Todas as candidaturas são analisadas com atenção. Guardamos currículos em
                      banco de talentos para oportunidades futuras.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
