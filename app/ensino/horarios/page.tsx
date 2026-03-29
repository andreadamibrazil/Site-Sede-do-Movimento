import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import CourseSchema from "@/components/schema/CourseSchema";
import { sanityFetch } from "@/sanity/lib/live";
import { activeTurmasQuery } from "@/lib/sanity/queries";
import type { SanityTurma, TurmaStatus } from "@/lib/sanity/types";
import { siteConfig } from "@/lib/constants/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/horarios", {
    title: "Horários",
    description: "Horários das aulas de ballet, jazz, sapateado, teatro e música no Rio Comprido. Turmas a partir de 2 anos, infantil e adultos. Consulte vagas disponíveis.",
  });
}

function vagasBadge(status: TurmaStatus, availableSpots?: number) {
  if (status === "full") return { label: "Lotado", className: "bg-red-100 text-red-700" };
  if (status === "few") return { label: availableSpots ? `${availableSpots} vagas` : "Últimas vagas", className: "bg-amber-100 text-amber-700" };
  return { label: "Disponível", className: "bg-emerald-100 text-emerald-700" };
}

export default async function HorariosPage() {
  const { data } = await sanityFetch({ query: activeTurmasQuery });
  const turmas = (data ?? []) as SanityTurma[];

  return (
    <>
      {turmas.length > 0 && <CourseSchema turmas={turmas} />}
      <PageHero eyebrow="Horários" title="Grade de aulas 2026" subtitle="Consulte a disponibilidade e faça sua matrícula. Vagas limitadas por turma." breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Horários" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Grade horária" title="Turmas disponíveis" subtitle="Os horários podem sofrer alterações. Entre em contato para confirmar disponibilidade." />
          {turmas.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-12">
              <table className="w-full">
                <thead>
                  <tr className="bg-brand-purple-600 text-white">
                    <th className="text-left px-5 py-4 text-sm font-semibold">Modalidade</th>
                    <th className="text-left px-5 py-4 text-sm font-semibold">Horário</th>
                    <th className="text-left px-5 py-4 text-sm font-semibold hidden md:table-cell">Nível / Faixa</th>
                    <th className="text-left px-5 py-4 text-sm font-semibold">Vagas</th>
                  </tr>
                </thead>
                <tbody>
                  {turmas.map((t, i) => {
                    const badge = vagasBadge(t.status, t.availableSpots);
                    return (
                      <tr key={t._id} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-brand-light transition-colors`}>
                        <td className="px-5 py-4 font-semibold text-gray-900 text-sm">{t.title}</td>
                        <td className="px-5 py-4 text-gray-700 text-sm font-medium">{t.schedule ?? "—"}</td>
                        <td className="px-5 py-4 text-gray-500 text-sm hidden md:table-cell">{t.ageGroup ?? "—"}</td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 mb-12 bg-gray-50 rounded-2xl border border-gray-100">
              <p className="text-gray-500">Grade em atualização. Entre em contato para saber os horários disponíveis.</p>
            </div>
          )}
          <div className="bg-brand-light rounded-2xl p-8 text-center">
            <h3 className="font-bold text-gray-900 text-xl mb-2">Quer fazer sua matrícula?</h3>
            <p className="text-gray-500 mb-6">Entre em contato pelo WhatsApp ou visite-nos pessoalmente. Teremos prazer em ajudá-lo a encontrar a turma ideal.</p>
            <a href={siteConfig.social.whatsapp} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" size="lg">💬 Falar pelo WhatsApp</Button>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
