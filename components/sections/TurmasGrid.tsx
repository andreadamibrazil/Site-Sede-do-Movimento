"use client";

import { useState, useMemo } from "react";
import type { SanityTurma, TurmaStatus } from "@/lib/sanity/types";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

// Short labels for day pills
const DIA_LABEL: Record<string, string> = {
  Todos: "Todos",
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
};

function vagasBadge(status: TurmaStatus, availableSpots?: number) {
  if (status === "full") return { label: "Lotado", className: "bg-red-50 text-red-600 border border-red-100" };
  if (status === "few") return { label: availableSpots ? `${availableSpots} vagas` : "Últimas vagas", className: "bg-amber-50 text-amber-600 border border-amber-100" };
  return { label: "Disponível", className: "bg-emerald-50 text-emerald-600 border border-emerald-100" };
}

interface Props {
  turmas: SanityTurma[];
}

export default function TurmasGrid({ turmas }: Props) {
  const [diaAtivo, setDiaAtivo] = useState("Todos");
  const [modalidadeAtiva, setModalidadeAtiva] = useState("Todas");

  // Derive unique modalities from data
  const modalidades = useMemo(() => {
    const set = new Set<string>();
    turmas.forEach((t) => { if (t.modality) set.add(t.modality); });
    return ["Todas", ...Array.from(set).sort()];
  }, [turmas]);

  // Which days actually have classes
  const diasAtivos = useMemo(() => {
    const set = new Set<string>();
    turmas.forEach((t) => t.dayOfWeek?.forEach((d) => set.add(d)));
    return ["Todos", ...DIAS.filter((d) => set.has(d))];
  }, [turmas]);

  // Filter then group
  const filtered = useMemo(() => {
    return turmas.filter((t) => {
      const matchDia = diaAtivo === "Todos" || t.dayOfWeek?.includes(diaAtivo);
      const matchMod = modalidadeAtiva === "Todas" || t.modality === modalidadeAtiva;
      return matchDia && matchMod;
    });
  }, [turmas, diaAtivo, modalidadeAtiva]);

  const grouped = useMemo(() => {
    if (diaAtivo !== "Todos") {
      return [{ dia: diaAtivo, turmas: filtered }];
    }
    return DIAS.map((dia) => ({
      dia,
      turmas: filtered.filter((t) => t.dayOfWeek?.includes(dia)),
    })).filter((g) => g.turmas.length > 0);
  }, [filtered, diaAtivo]);

  const semDia = useMemo(
    () => filtered.filter((t) => !t.dayOfWeek || t.dayOfWeek.length === 0),
    [filtered]
  );

  const totalVisible = filtered.length;
  const isFiltered = diaAtivo !== "Todos" || modalidadeAtiva !== "Todas";

  return (
    <div>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="mb-8 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-end">

          {/* Day pills */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
              Dia da semana
            </p>
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
              {diasAtivos.map((dia) => (
                <button
                  key={dia}
                  onClick={() => setDiaAtivo(dia)}
                  className={`shrink-0 text-sm font-semibold px-3.5 py-1.5 rounded-full border transition-colors duration-150 ${
                    diaAtivo === dia
                      ? "bg-brand-purple-600 text-white border-brand-purple-600"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-purple-300 hover:text-brand-purple-600"
                  }`}
                >
                  {DIA_LABEL[dia] ?? dia}
                </button>
              ))}
            </div>
          </div>

          {/* Modality select */}
          <div className="sm:w-52 shrink-0">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
              Modalidade
            </p>
            <select
              value={modalidadeAtiva}
              onChange={(e) => setModalidadeAtiva(e.target.value)}
              className={`w-full text-sm font-semibold px-4 py-2 rounded-xl border transition-colors duration-150 cursor-pointer focus:outline-none ${
                modalidadeAtiva !== "Todas"
                  ? "bg-brand-purple-600 text-white border-brand-purple-600"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:border-brand-purple-300"
              }`}
            >
              {modalidades.map((mod) => (
                <option key={mod} value={mod}>
                  {mod === "Todas" ? "Todas as modalidades" : mod}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Result count — only when filtering */}
        {isFiltered && (
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
            {totalVisible === 0
              ? "Nenhuma turma encontrada."
              : `${totalVisible} ${totalVisible === 1 ? "turma encontrada" : "turmas encontradas"}`}
            {" "}
            <button
              onClick={() => { setDiaAtivo("Todos"); setModalidadeAtiva("Todas"); }}
              className="text-brand-purple-600 font-semibold hover:underline"
            >
              Limpar filtros
            </button>
          </p>
        )}
      </div>

      {/* ── Cards ───────────────────────────────────────────────────────── */}
      {totalVisible === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-semibold text-gray-700 mb-1">Nenhuma turma nesse filtro</p>
          <p className="text-sm text-gray-400">Tente outro dia ou modalidade.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {grouped.map(({ dia, turmas: turmasDia }) => (
            <div key={dia}>
              {diaAtivo === "Todos" && (
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-extrabold text-gray-900 text-xl">{dia}-feira</h2>
                  <span className="text-sm font-semibold px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-400">
                    {turmasDia.length} {turmasDia.length === 1 ? "aula" : "aulas"}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {turmasDia.map((t) => {
                  const badge = vagasBadge(t.status, t.availableSpots);
                  return (
                    <div
                      key={t._id}
                      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{t.title}</h3>
                        <span className={`shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      {t.schedule && (
                        <p className="text-brand-purple-600 font-semibold text-sm mb-2">
                          🕐 {t.schedule}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.ageGroup && (
                          <span className="text-sm font-semibold px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                            {t.ageGroup}
                          </span>
                        )}
                        {t.modality && (
                          <span className="text-sm font-semibold px-4 py-1.5 rounded-full border border-brand-purple-100 bg-brand-purple-50 text-brand-purple-600">
                            {t.modality}
                          </span>
                        )}
                      </div>

                      {t.teacher && (
                        <p className="text-gray-400 text-xs mt-2">Prof. {t.teacher}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {semDia.length > 0 && (
            <div>
              {diaAtivo === "Todos" && (
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-extrabold text-gray-900 text-xl">Outras turmas</h2>
                  <span className="text-sm font-semibold px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-400">
                    {semDia.length} {semDia.length === 1 ? "aula" : "aulas"}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {semDia.map((t) => {
                  const badge = vagasBadge(t.status, t.availableSpots);
                  return (
                    <div key={t._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm h-full flex flex-col">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{t.title}</h3>
                        <span className={`shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      {t.schedule && (
                        <p className="text-brand-purple-600 font-semibold text-sm mb-2">🕐 {t.schedule}</p>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {t.ageGroup && (
                          <span className="text-sm font-semibold px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                            {t.ageGroup}
                          </span>
                        )}
                        {t.modality && (
                          <span className="text-sm font-semibold px-4 py-1.5 rounded-full border border-brand-purple-100 bg-brand-purple-50 text-brand-purple-600">
                            {t.modality}
                          </span>
                        )}
                      </div>
                      {t.teacher && (
                        <p className="text-gray-400 text-xs mt-2">Prof. {t.teacher}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
