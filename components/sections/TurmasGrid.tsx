"use client";

import { useState, useMemo } from "react";
import type { SanityTurma, TurmaStatus } from "@/lib/sanity/types";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

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
      // Single day — no grouping headers needed
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

  return (
    <div>
      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="mb-8 space-y-4">
        {/* Day filter — horizontal scroll on mobile */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Dia da semana</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {diasAtivos.map((dia) => (
              <button
                key={dia}
                onClick={() => setDiaAtivo(dia)}
                className={`shrink-0 text-sm font-semibold px-4 py-1.5 rounded-full border transition-colors duration-150 ${
                  diaAtivo === dia
                    ? "bg-brand-purple-600 text-white border-brand-purple-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-purple-300 hover:text-brand-purple-600"
                }`}
              >
                {dia === "Todos" ? "Todos os dias" : `${dia}-feira`}
              </button>
            ))}
          </div>
        </div>

        {/* Modality filter — wraps */}
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Modalidade</p>
          <div className="flex flex-wrap gap-2">
            {modalidades.map((mod) => (
              <button
                key={mod}
                onClick={() => setModalidadeAtiva(mod)}
                className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-colors duration-150 ${
                  modalidadeAtiva === mod
                    ? "bg-brand-purple-600 text-white border-brand-purple-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-brand-purple-300 hover:text-brand-purple-600"
                }`}
              >
                {mod}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        {(diaAtivo !== "Todos" || modalidadeAtiva !== "Todas") && (
          <p className="text-sm text-gray-400">
            {totalVisible === 0
              ? "Nenhuma turma encontrada."
              : `${totalVisible} ${totalVisible === 1 ? "turma encontrada" : "turmas encontradas"}`}
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
              {/* Day header — hidden when filtered to a single day */}
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
                      {/* Title + status badge */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="font-bold text-gray-900 text-base leading-snug">{t.title}</h3>
                        <span className={`shrink-0 text-sm font-semibold px-3 py-1.5 rounded-full ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Schedule */}
                      {t.schedule && (
                        <p className="text-brand-purple-600 font-semibold text-sm mb-2">
                          🕐 {t.schedule}
                        </p>
                      )}

                      {/* Tags row */}
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

                      {/* Teacher */}
                      {t.teacher && (
                        <p className="text-gray-400 text-xs mt-2">Prof. {t.teacher}</p>
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
