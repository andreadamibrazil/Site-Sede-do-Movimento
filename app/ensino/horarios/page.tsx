import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import CourseSchema from "@/components/schema/CourseSchema";
import { sanityFetch } from "@/sanity/lib/live";
import { activeTurmasQuery } from "@/lib/sanity/queries";
import type { SanityTurma, TurmaStatus } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/constants/siteConfig";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/horarios", {
    title: "Horários",
    description: "Horários das aulas de ballet, jazz, sapateado, teatro e música no Rio Comprido. Turmas a partir de 2 anos, infantil e adultos. Consulte vagas disponíveis.",
  });
}

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function vagasBadge(status: TurmaStatus, availableSpots?: number) {
  if (status === "full") return { label: "Lotado", className: "bg-red-50 text-red-600 border border-red-100" };
  if (status === "few") return { label: availableSpots ? `${availableSpots} vagas` : "Últimas vagas", className: "bg-amber-50 text-amber-600 border border-amber-100" };
  return { label: "Disponível", className: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
}

export default async function HorariosPage() {
  const { data } = await sanityFetch({ query: activeTurmasQuery });
  const turmas = (data ?? []) as SanityTurma[];

  // Agrupar por dia da semana
  const grouped = DIAS.map((dia) => ({
    dia,
    turmas: turmas.filter((t) => t.dayOfWeek?.includes(dia)),
  })).filter((g) => g.turmas.length > 0);

  // Turmas sem dia definido
  const semDia = turmas.filter((t) => !t.dayOfWeek || t.dayOfWeek.length === 0);

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
            /* ── Cards por dia ────────────────────────────────────────────── */
            <div className="space-y-12">
              {grouped.map(({ dia, turmas: turmasDia }) => (
                <div key={dia}>
                  {/* Day header */}
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-extrabold text-gray-900 text-xl">{dia}-feira</h2>
                    <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full">
                      {turmasDia.length} {turmasDia.length === 1 ? "aula" : "aulas"}
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {turmasDia.map((t) => {
                      const badge = vagasBadge(t.status, t.availableSpots);
                      return (
                        <div
                          key={t._id}
                          className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          {/* Title + badge */}
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 text-base leading-snug">{t.title}</h3>
                            <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>

                          {/* Schedule */}
                          {t.schedule && (
                            <p className="text-brand-purple-600 font-semibold text-sm mb-2">
                              🕐 {t.schedule}
                            </p>
                          )}

                          {/* Age group */}
                          {t.ageGroup && (
                            <p className="text-gray-400 text-sm">{t.ageGroup}</p>
                          )}

                          {/* Teacher */}
                          {t.teacher && (
                            <p className="text-gray-400 text-xs mt-1">Prof. {t.teacher}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Turmas sem dia definido */}
              {semDia.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-extrabold text-gray-900 text-xl">Outras turmas</h2>
                    <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-200 px-3 py-1 rounded-full">
                      {semDia.length} {semDia.length === 1 ? "aula" : "aulas"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {semDia.map((t) => {
                      const badge = vagasBadge(t.status, t.availableSpots);
                      return (
                        <div key={t._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-bold text-gray-900 text-base leading-snug">{t.title}</h3>
                            <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${badge.className}`}>
                              {badge.label}
                            </span>
                          </div>
                          {t.schedule && <p className="text-brand-purple-600 font-semibold text-sm mb-2">🕐 {t.schedule}</p>}
                          {t.ageGroup && <p className="text-gray-400 text-sm">{t.ageGroup}</p>}
                          {t.teacher && <p className="text-gray-400 text-xs mt-1">Prof. {t.teacher}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
