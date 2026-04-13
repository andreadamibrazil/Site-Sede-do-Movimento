import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import CourseSchema from "@/components/schema/CourseSchema";
import TurmasGrid from "@/components/sections/TurmasGrid";
import { sanityFetch } from "@/sanity/lib/live";
import { activeTurmasQuery } from "@/lib/sanity/queries";
import type { SanityTurma } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/constants/siteConfig";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/horarios", {
    title: "Horários",
    description: "Horários das aulas de ballet, jazz, sapateado, teatro e música no Rio Comprido. Turmas a partir de 2 anos, infantil e adultos. Consulte vagas disponíveis.",
  });
}

export default async function HorariosPage() {
  const { data } = await sanityFetch({ query: activeTurmasQuery });
  const turmas = (data ?? []) as SanityTurma[];

  return (
    <>
      {turmas.length > 0 && <CourseSchema turmas={turmas} />}
      <PageHero
        eyebrow="Horários 2026"
        title="Grade de aulas"
        subtitle="Consulte os horários disponíveis e fale com a gente para garantir sua vaga."
        breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Horários" }]}
      />

      <section className="section-padding bg-gray-50">
        <div className="container-main">

          {turmas.length === 0 ? (
            /* ── Empty state ─────────────────────────────────────────────── */
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm mb-10">
              <p className="text-4xl mb-4">📋</p>
              <h3 className="font-bold text-gray-900 text-xl mb-2">Grade em atualização</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                Os horários de 2026 estão sendo organizados. Entre em contato para saber disponibilidade.
              </p>
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-brand-purple-600 text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-brand-purple-700 transition-colors"
              >
                💬 Falar pelo WhatsApp
              </a>
            </div>
          ) : (
            <TurmasGrid turmas={turmas} />
          )}

          {/* CTA */}
          <div className="mt-14 bg-white rounded-2xl border border-gray-100 p-7 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">Quer garantir sua vaga?</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Fale com a gente pelo WhatsApp ou venha nos visitar.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a
                href={siteConfig.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-brand-purple-600 text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-brand-purple-700 transition-colors whitespace-nowrap"
              >
                💬 Falar pelo WhatsApp
              </a>
              <Link
                href="/ensino/modalidades"
                className="inline-flex items-center justify-center gap-1.5 text-brand-purple-600 font-semibold text-sm hover:gap-3 transition-all duration-200 whitespace-nowrap"
              >
                Ver modalidades <ArrowRight size={14} />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
