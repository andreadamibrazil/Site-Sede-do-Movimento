import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import Button from "@/components/ui/Button";
import { siteConfig } from "@/lib/constants/siteConfig";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/horarios", {
    title: "Horários",
    description: "Grade de horários das aulas da Sede do Movimento.",
  });
}

const horarios = [
  { modalidade: "Ballet Infantil", dia: "Seg e Qua", hora: "09h00 – 10h00", nivel: "Infantil I (4-6 anos)", vagas: "5 vagas" },
  { modalidade: "Ballet Infantil", dia: "Ter e Qui", hora: "10h00 – 11h00", nivel: "Infantil II (7-9 anos)", vagas: "3 vagas" },
  { modalidade: "Jazz", dia: "Seg e Qua", hora: "18h00 – 19h00", nivel: "Juvenil / Adulto", vagas: "4 vagas" },
  { modalidade: "Sapateado", dia: "Ter e Qui", hora: "17h00 – 18h00", nivel: "Iniciante", vagas: "Disponível" },
  { modalidade: "Danças Urbanas", dia: "Sáb", hora: "10h00 – 12h00", nivel: "Todos os níveis", vagas: "2 vagas" },
  { modalidade: "Contemporâneo", dia: "Sex", hora: "19h00 – 20h30", nivel: "Avançado", vagas: "Disponível" },
  { modalidade: "Teatro", dia: "Sáb", hora: "14h00 – 16h00", nivel: "Infantil (5-10)", vagas: "Disponível" },
  { modalidade: "Canto", dia: "Ter e Qui", hora: "16h00 – 17h00", nivel: "Iniciante / Intermediário", vagas: "3 vagas" },
];

export default function HorariosPage() {
  return (
    <>
      <PageHero eyebrow="Horários" title="Grade de aulas 2026" subtitle="Consulte a disponibilidade e faça sua matrícula. Vagas limitadas por turma." breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Horários" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Grade horária" title="Turmas disponíveis" subtitle="Os horários podem sofrer alterações. Entre em contato para confirmar disponibilidade." />
          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm mb-12">
            <table className="w-full">
              <thead>
                <tr className="bg-brand-purple-600 text-white">
                  <th className="text-left px-5 py-4 text-sm font-semibold">Modalidade</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold hidden sm:table-cell">Dia</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold">Horário</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold hidden md:table-cell">Nível / Faixa</th>
                  <th className="text-left px-5 py-4 text-sm font-semibold">Vagas</th>
                </tr>
              </thead>
              <tbody>
                {horarios.map((h, i) => (
                  <tr key={i} className={`border-t border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-brand-light transition-colors`}>
                    <td className="px-5 py-4 font-semibold text-gray-900 text-sm">{h.modalidade}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm hidden sm:table-cell">{h.dia}</td>
                    <td className="px-5 py-4 text-gray-700 text-sm font-medium">{h.hora}</td>
                    <td className="px-5 py-4 text-gray-500 text-sm hidden md:table-cell">{h.nivel}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${h.vagas === "Disponível" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {h.vagas}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
