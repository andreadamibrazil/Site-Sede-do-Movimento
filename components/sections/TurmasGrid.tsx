"use client";

import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { SanityTurma, TurmaStatus } from "@/lib/sanity/types";

const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const DIA_LABEL: Record<string, string> = {
  Todos: "Todos",
  Segunda: "Seg",
  Terça: "Ter",
  Quarta: "Qua",
  Quinta: "Qui",
  Sexta: "Sex",
  Sábado: "Sáb",
};

function statusConfig(status: TurmaStatus, availableSpots?: number) {
  switch (status) {
    case "full":
      return { label: "Lotado",        dot: "bg-red-400",     text: "text-red-500"     };
    case "few":
      return { label: availableSpots ? `${availableSpots} vagas` : "Últimas vagas",
                                        dot: "bg-amber-400",   text: "text-amber-600"   };
    case "inactive":
      return { label: "Inativa",       dot: "bg-gray-300",    text: "text-gray-400"    };
    default:
      return { label: "Disponível",    dot: "bg-emerald-400", text: "text-emerald-600" };
  }
}

interface Props {
  turmas: SanityTurma[];
}

export default function TurmasGrid({ turmas }: Props) {
  const [diaAtivo, setDiaAtivo] = useState("Todos");
  const [modalidadeAtiva, setModalidadeAtiva] = useState("Todas");

  const modalidades = useMemo(() => {
    const set = new Set<string>();
    turmas.forEach((t) => { if (t.modality) set.add(t.modality); });
    return ["Todas", ...Array.from(set).sort()];
  }, [turmas]);

  const diasAtivos = useMemo(() => {
    const set = new Set<string>();
    turmas.forEach((t) => t.dayOfWeek?.forEach((d) => set.add(d)));
    return ["Todos", ...DIAS.filter((d) => set.has(d))];
  }, [turmas]);

  const filtered = useMemo(() => {
    return turmas.filter((t) => {
      const matchDia = diaAtivo === "Todos" || t.dayOfWeek?.includes(diaAtivo);
      const matchMod = modalidadeAtiva === "Todas" || t.modality === modalidadeAtiva;
      return matchDia && matchMod;
    });
  }, [turmas, diaAtivo, modalidadeAtiva]);

  const grouped = useMemo(() => {
    if (diaAtivo !== "Todos") return [{ dia: diaAtivo, turmas: filtered }];
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
        <div className="space-y-10">
          {grouped.map(({ dia, turmas: turmasDia }) => (
            <div key={dia}>
              {diaAtivo === "Todos" && (
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-extrabold text-gray-900 text-lg">{dia}-feira</h2>
                  <span className="text-xs font-semibold text-gray-400">
                    {turmasDia.length} {turmasDia.length === 1 ? "aula" : "aulas"}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {turmasDia.map((t) => <TurmaCard key={t._id} turma={t} />)}
              </div>
            </div>
          ))}

          {semDia.length > 0 && (
            <div>
              {diaAtivo === "Todos" && (
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="font-extrabold text-gray-900 text-lg">Outras turmas</h2>
                  <span className="text-xs font-semibold text-gray-400">
                    {semDia.length} {semDia.length === 1 ? "aula" : "aulas"}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {semDia.map((t) => <TurmaCard key={t._id} turma={t} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Individual card ───────────────────────────────────────────────────────────

function TurmaCard({ turma: t }: { turma: SanityTurma }) {
  const status = statusConfig(t.status, t.availableSpots);
  const days = t.dayOfWeek?.map((d) => DIA_LABEL[d] ?? d).join(" · ");
  const hasFooter = !!(days || t.ageGroup);

  return (
    <article
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm",
        "flex flex-col gap-3 transition-all duration-200",
        t.status !== "full" && "hover:shadow-md hover:-translate-y-0.5",
        t.status === "full" && "opacity-60"
      )}
    >
      {/* ── Schedule (dominant) + availability ────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Clock
            size={16}
            className="text-brand-purple-400 shrink-0 mt-[3px]"
            aria-hidden="true"
          />
          {t.schedule ? (
            <span className="text-[26px] font-black leading-none tracking-tight text-gray-900">
              {t.schedule}
            </span>
          ) : (
            <span className="text-base font-semibold text-gray-300 leading-none">
              Horário a confirmar
            </span>
          )}
        </div>

        {/* Status: dot + label */}
        <div className={cn("shrink-0 flex items-center gap-1.5 pt-1", status.text)}>
          <span className={cn("w-2 h-2 rounded-full shrink-0", status.dot)} aria-hidden="true" />
          <span className="text-[11px] font-bold whitespace-nowrap">{status.label}</span>
        </div>
      </div>

      {/* ── Modality label + class name ────────────────────────────────── */}
      <div className="flex flex-col gap-0.5">
        {t.modality && (
          <p className="text-[10px] font-black text-brand-purple-500 uppercase tracking-widest leading-none">
            {t.modality}
          </p>
        )}
        <h3 className="font-bold text-gray-800 text-sm leading-snug">{t.title}</h3>
      </div>

      {/* ── Footer: days · age group ───────────────────────────────────── */}
      {hasFooter && (
        <div className="mt-auto pt-2.5 border-t border-gray-50 flex items-center justify-between gap-2 flex-wrap">
          {days && (
            <span className="text-[11px] font-medium text-gray-400">{days}</span>
          )}
          {t.ageGroup && (
            <span className="text-[11px] font-medium text-gray-400">{t.ageGroup}</span>
          )}
        </div>
      )}
    </article>
  );
}
