"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect, useRef, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Funil = "Topo" | "Meio" | "Fundo";
type Negocio = "Sede" | "MoviRio" | "Nova Atmosfera";
type Status = "Referência" | "Para Fazer";
type DraftStatus = "Rascunho" | "Publicado";
type Tab = Status | "Busca Viral" | "Rascunho";

interface Entry {
  id: string;
  timestamp: string;
  user: string;
  platform: string;
  url: string;
  annotation: string;
  dores_desejos: string;
  funil: Funil | "";
  negocio: Negocio | "";
  status: Status;
  assunto: string;
  analise: string;
  favorito: boolean;
}

interface Draft {
  id: string;
  timestamp: string;
  user: string;
  entry_id: string;
  assunto: string;
  negocio: string;
  content: string;
  status: DraftStatus;
}

interface FormState {
  url: string;
  annotation: string;
  dores_desejos: string;
  funil: Funil | "";
  negocio: Negocio | "";
  assunto: string;
}

interface ViralVideo {
  videoId: string;
  title: string;
  channel: string;
  publishedAt: string;
  thumbnail: string;
  url: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  description: string;
}

interface NewsItem {
  title: string;
  url: string;
  description: string;
  source: string;
  publishedAt: string;
  image: string;
}

interface TrendChip {
  term: string;
  trending?: boolean;
}

interface OgPreview {
  title: string;
  description: string;
  image: string;
  siteName: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SHEET_URL = `https://docs.google.com/spreadsheets/d/${process.env.NEXT_PUBLIC_SHEETS_ID ?? "1LHL8J-KjJJZTTREk1LeQw_ZbR7HNDF7WalL6ZpgQyt8"}`;

function getYouTubeThumbnail(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/mqdefault.jpg` : null;
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
  return m ? m[1] : null;
}

function getInstagramEmbedUrl(url: string): string | null {
  const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return m ? `https://www.instagram.com/${m[1]}/${m[2]}/embed/` : null;
}

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "bg-pink-100 text-pink-700",
  YouTube: "bg-red-100 text-red-700",
  TikTok: "bg-slate-100 text-slate-700",
  "Twitter/X": "bg-sky-100 text-sky-700",
  Facebook: "bg-blue-100 text-blue-700",
  LinkedIn: "bg-blue-200 text-blue-800",
  Outro: "bg-gray-100 text-gray-600",
};

const FUNIL_COLORS: Record<string, string> = {
  Topo: "bg-green-100 text-green-700",
  Meio: "bg-yellow-100 text-yellow-700",
  Fundo: "bg-orange-100 text-orange-700",
};

const NEGOCIO_COLORS: Record<string, string> = {
  Sede: "bg-purple-100 text-purple-700",
  MoviRio: "bg-teal-100 text-teal-700",
  "Nova Atmosfera": "bg-indigo-100 text-indigo-700",
};

function Badge({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

// ─── Speech Recognition hook ─────────────────────────────────────────────────

function useSpeechRecognition(onTranscript: (text: string, isFinal: boolean) => void) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const start = useCallback(() => {
    setVoiceError("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;

    if (!SR) {
      setVoiceError("Voz não suportada neste browser. Use Chrome ou Safari.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }

      const recognition = new SR();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }
        if (final) {
          onTranscript(final, true);
        } else if (interim) {
          onTranscript(interim, false);
        }
      };

      recognition.onend = () => setIsListening(false);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === "not-allowed") {
          setVoiceError("Permissão de microfone negada. Verifique as configurações do browser.");
        } else if (event.error === "no-speech") {
          setVoiceError("Nenhuma fala detectada. Tente novamente.");
        } else if (event.error !== "aborted") {
          setVoiceError(`Erro: ${event.error}`);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setVoiceError("Não foi possível iniciar o microfone.");
    }
  }, [onTranscript]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, start, stop, voiceError, clearVoiceError: () => setVoiceError("") };
}

// ─── Entry Card ──────────────────────────────────────────────────────────────

interface EditForm {
  annotation: string;
  dores_desejos: string;
  assunto: string;
  funil: Funil | "";
  negocio: Negocio | "";
}

function EntryCard({ entry, onDelete, onStatusChange, onDraftAdded, onUpdate }: {
  entry: Entry;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, newStatus: Status) => void;
  onDraftAdded?: (draft: Draft) => void;
  onUpdate?: (id: string, changes: Partial<Entry>) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);
  const [movingStatus, setMovingStatus] = useState(false);
  const [movedStatus, setMovedStatus] = useState(false);
  const [favorito, setFavorito] = useState(entry.favorito ?? false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [editing, setEditing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(entry.analise ?? "");
  const [showAnalysis, setShowAnalysis] = useState(!!entry.analise);
  const [editForm, setEditForm] = useState<EditForm>({
    annotation: entry.annotation,
    dores_desejos: entry.dores_desejos,
    assunto: entry.assunto,
    funil: entry.funil,
    negocio: entry.negocio,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  async function handleToggleFavorito() {
    setTogglingFav(true);
    const next = !favorito;
    try {
      await fetch("/api/pauta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, favorito: next }),
      });
      setFavorito(next);
      onUpdate?.(entry.id, { favorito: next });
    } catch {
      // silently ignore
    } finally {
      setTogglingFav(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remover esta entrada?")) return;
    setDeleting(true);
    try {
      await fetch("/api/pauta", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id }),
      });
      onDelete(entry.id);
    } catch {
      alert("Erro ao remover entrada.");
      setDeleting(false);
    }
  }

  async function handleCopy() {
    const text = [
      entry.url && `URL: ${entry.url}`,
      entry.annotation && `Anotação: ${entry.annotation}`,
      entry.dores_desejos && `Dores e Desejos: ${entry.dores_desejos}`,
      entry.assunto && `Assunto: ${entry.assunto}`,
      entry.funil && `Funil: ${entry.funil}`,
      entry.negocio && `Negócio: ${entry.negocio}`,
    ].filter(Boolean).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleMoveToParaFazer() {
    setMovingStatus(true);
    try {
      const res = await fetch("/api/pauta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, status: "Para Fazer" }),
      });
      if (!res.ok) throw new Error("API error");
      setMovedStatus(true);
      onStatusChange?.(entry.id, "Para Fazer");
    } catch {
      alert("Erro ao mover entrada.");
    } finally {
      setMovingStatus(false);
    }
  }

  async function handleSaveDraft() {
    setSavingDraft(true);
    try {
      const res = await fetch("/api/pauta/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_id: entry.id,
          assunto: entry.assunto,
          negocio: entry.negocio,
          content: generated,
        }),
      });
      if (!res.ok) throw new Error("API error");
      const draft = await res.json();
      setDraftSaved(true);
      onDraftAdded?.(draft);
    } catch {
      alert("Erro ao salvar rascunho.");
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleSaveEdit() {
    setSavingEdit(true);
    try {
      const res = await fetch("/api/pauta", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, ...editForm }),
      });
      if (!res.ok) throw new Error("API error");
      onUpdate?.(entry.id, editForm);
      setEditing(false);
    } catch {
      alert("Erro ao salvar edição.");
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/pauta/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entry.id, url: entry.url, annotation: entry.annotation, assunto: entry.assunto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro ao analisar");
      setAnalysis(data.analysis);
      setShowAnalysis(true);
      onUpdate?.(entry.id, { analise: data.analysis });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao analisar vídeo.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    setGenerated("");
    try {
      const res = await fetch("/api/pauta/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: entry.url,
          annotation: entry.annotation,
          dores_desejos: entry.dores_desejos,
          funil: entry.funil,
          negocio: entry.negocio,
          assunto: entry.assunto,
          analise: analysis || entry.analise,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Erro");
      setGenerated(data.result);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao gerar.");
    } finally {
      setGenerating(false);
    }
  }

  const ytThumbnail = entry.url ? getYouTubeThumbnail(entry.url) : null;
  const ytId = entry.url ? getYouTubeId(entry.url) : null;
  const igEmbedUrl = entry.url ? getInstagramEmbedUrl(entry.url) : null;

  // Keep editForm in sync when entry changes externally
  const prevEntryRef = useRef(entry);
  if (prevEntryRef.current !== entry) {
    prevEntryRef.current = entry;
    if (!editing) {
      setEditForm({
        annotation: entry.annotation,
        dores_desejos: entry.dores_desejos,
        assunto: entry.assunto,
        funil: entry.funil,
        negocio: entry.negocio,
      });
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* YouTube thumbnail */}
      {ytThumbnail && (
        <a href={entry.url} target="_blank" rel="noopener noreferrer" className="block w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ytThumbnail} alt={entry.annotation || "thumbnail"} className="w-full aspect-video object-cover" />
        </a>
      )}

      {/* Instagram embed */}
      {igEmbedUrl && !ytThumbnail && (
        <iframe
          src={igEmbedUrl}
          className="w-full"
          style={{ minHeight: 480, border: "none" }}
          scrolling="no"
          allowTransparency
          title="Instagram post"
        />
      )}

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {entry.platform && (
              <Badge label={entry.platform} colorClass={PLATFORM_COLORS[entry.platform] ?? PLATFORM_COLORS.Outro} />
            )}
            {!editing && entry.funil && (
              <Badge label={entry.funil} colorClass={FUNIL_COLORS[entry.funil] ?? ""} />
            )}
            {!editing && entry.negocio && (
              <Badge label={entry.negocio} colorClass={NEGOCIO_COLORS[entry.negocio] ?? ""} />
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={handleToggleFavorito}
              disabled={togglingFav}
              aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              title={favorito ? "Favorito" : "Marcar favorito"}
              className={`p-1 transition-colors ${favorito ? "text-yellow-400" : "text-gray-300 hover:text-yellow-400"}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill={favorito ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button
              onClick={() => {
                setEditing((v) => !v);
                setEditForm({ annotation: entry.annotation, dores_desejos: entry.dores_desejos, assunto: entry.assunto, funil: entry.funil, negocio: entry.negocio });
              }}
              className="text-gray-300 hover:text-[#6A00FF] transition-colors p-1"
              aria-label="Editar entrada"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              aria-label="Remover entrada"
              className="text-gray-300 hover:text-red-400 transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {entry.url && !ytId && !igEmbedUrl && (
          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#6A00FF] underline underline-offset-2 break-all line-clamp-2 hover:opacity-75 transition-opacity">
            {entry.url}
          </a>
        )}
        {entry.url && !ytId && igEmbedUrl && (
          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#6A00FF] transition-colors truncate">
            instagram.com ↗
          </a>
        )}
        {entry.url && ytId && (
          <a href={entry.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-[#6A00FF] transition-colors truncate">
            youtu.be/{ytId}
          </a>
        )}

        {/* Edit mode */}
        {editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editForm.annotation}
              onChange={(e) => setEditForm((f) => ({ ...f, annotation: e.target.value }))}
              placeholder="Anotação"
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30"
            />
            <textarea
              value={editForm.dores_desejos}
              onChange={(e) => setEditForm((f) => ({ ...f, dores_desejos: e.target.value }))}
              placeholder="Dores & Desejos"
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30"
            />
            <input
              value={editForm.assunto}
              onChange={(e) => setEditForm((f) => ({ ...f, assunto: e.target.value }))}
              placeholder="Assunto"
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30"
            />
            <div className="flex gap-2">
              <select
                value={editForm.funil}
                onChange={(e) => setEditForm((f) => ({ ...f, funil: e.target.value as Funil | "" }))}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30"
              >
                <option value="">Funil</option>
                <option>Topo</option>
                <option>Meio</option>
                <option>Fundo</option>
              </select>
              <select
                value={editForm.negocio}
                onChange={(e) => setEditForm((f) => ({ ...f, negocio: e.target.value as Negocio | "" }))}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30"
              >
                <option value="">Negócio</option>
                <option>Sede</option>
                <option>MoviRio</option>
                <option>Nova Atmosfera</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex-1 text-xs py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1 text-xs font-semibold py-2 rounded-xl bg-[#6A00FF] text-white hover:bg-[#5800d4] transition disabled:opacity-50">
                {savingEdit ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {entry.annotation && (
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{entry.annotation}</p>
            )}

            {entry.dores_desejos && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Dores & Desejos</p>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.dores_desejos}</p>
              </div>
            )}
          </>
        )}

        <p className="text-xs text-gray-300">
          {entry.assunto && <span className="text-[#6A00FF]/60 font-medium mr-1">#{entry.assunto}</span>}
          {entry.user} · {new Date(entry.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 pt-1 border-t border-gray-50">
          <button
            onClick={handleCopy}
            className="flex-1 text-xs font-medium py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {copied ? "Copiado!" : "Copiar"}
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex-1 text-xs font-semibold py-2 rounded-xl bg-[#6A00FF] text-white hover:bg-[#5800d4] active:scale-95 transition disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {generating ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
            {generating ? "Gerando…" : "Gerar post"}
          </button>
          {(entry.platform === "YouTube" || entry.platform === "TikTok" || entry.platform === "Instagram" || entry.platform === "Twitter/X") && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              title="Buscar transcrição e extrair hooks virais"
              className={`flex-shrink-0 text-xs font-medium py-2 px-3 rounded-xl border transition disabled:opacity-50 flex items-center gap-1 ${
                analysis ? "border-purple-200 text-[#6A00FF] bg-purple-50" : "border-gray-200 text-gray-500 hover:bg-gray-50"
              }`}
            >
              {analyzing ? (
                <span className="w-3 h-3 border-2 border-[#6A00FF] border-t-transparent rounded-full animate-spin inline-block" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
              {analyzing ? "…" : analysis ? "Analisado ✓" : "Analisar"}
            </button>
          )}
          {entry.status === "Referência" && !movedStatus && (
            <button
              onClick={handleMoveToParaFazer}
              disabled={movingStatus}
              title="Mover para Para Fazer"
              className="flex-shrink-0 text-xs font-medium py-2 px-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition disabled:opacity-50"
            >
              {movingStatus ? "…" : "→ Fazer"}
            </button>
          )}
        </div>

        {/* Analysis result */}
        {analysis && showAnalysis && (
          <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Análise do vídeo</p>
              <div className="flex gap-2">
                <button onClick={() => navigator.clipboard.writeText(analysis)} className="text-xs text-gray-400 hover:text-indigo-600 transition">copiar</button>
                <button onClick={() => setShowAnalysis(false)} className="text-xs text-gray-400 hover:text-gray-600 transition">fechar</button>
              </div>
            </div>
            <p className="text-xs text-indigo-900 whitespace-pre-wrap leading-relaxed">{analysis}</p>
          </div>
        )}
        {analysis && !showAnalysis && (
          <button onClick={() => setShowAnalysis(true)} className="text-xs text-indigo-600 hover:text-indigo-800 transition text-left">
            ▸ Ver análise salva
          </button>
        )}

        {/* Generated result */}
        {generated && (
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-[#6A00FF] uppercase tracking-wide">Ideia gerada</p>
              <div className="flex items-center gap-3">
                <button onClick={() => { navigator.clipboard.writeText(generated); }} className="text-xs text-gray-400 hover:text-[#6A00FF] transition">copiar</button>
                {draftSaved ? (
                  <span className="text-xs text-green-600 font-medium">rascunho salvo ✓</span>
                ) : (
                  <button
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="text-xs text-[#6A00FF] hover:text-[#5800d4] transition font-medium disabled:opacity-50"
                  >
                    {savingDraft ? "salvando…" : "salvar rascunho"}
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{generated}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New Entry Form ───────────────────────────────────────────────────────────

function NewEntryForm({ activeTab, onAdd }: { activeTab: Status; onAdd: (entry: Entry) => void }) {
  const defaultForm: FormState = { url: "", annotation: "", dores_desejos: "", funil: "", negocio: "", assunto: "" };
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [ogPreview, setOgPreview] = useState<OgPreview | null>(null);
  const [loadingOg, setLoadingOg] = useState(false);

  async function fetchOgPreview(url: string) {
    if (!url) { setOgPreview(null); return; }
    setLoadingOg(true);
    try {
      const res = await fetch(`/api/pauta/preview?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data: OgPreview = await res.json();
        setOgPreview(data.title || data.image ? data : null);
      }
    } catch { /* ignore */ } finally {
      setLoadingOg(false);
    }
  }

  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      setForm((prev) => ({ ...prev, annotation: (prev.annotation + " " + text).trim() }));
      setInterimText("");
    } else {
      setInterimText(text);
    }
  }, []);

  const { isListening, start, stop, voiceError } = useSpeechRecognition(handleTranscript);

  function field<K extends keyof FormState>(key: K) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.url && !form.annotation) return;
    setSaving(true);
    try {
      const res = await fetch("/api/pauta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: activeTab }),
      });
      if (!res.ok) throw new Error("API error");
      const entry = await res.json() as Entry;
      onAdd(entry);
      setForm(defaultForm);
      setInterimText("");
    } catch {
      alert("Erro ao salvar entrada.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30 focus:border-[#6A00FF] transition";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4">
      <p className="text-xs font-semibold text-[#6A00FF] uppercase tracking-wider">Nova entrada · {activeTab}</p>

      <div>
        <label className={labelClass}>URL</label>
        <input
          type="url"
          placeholder="Cole o link aqui"
          value={form.url}
          onChange={(e) => { field("url")(e); setOgPreview(null); }}
          onBlur={(e) => fetchOgPreview(e.target.value)}
          className={inputClass}
        />
        {loadingOg && <p className="text-xs text-gray-400 mt-1">Carregando prévia…</p>}
        {ogPreview && (
          <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden flex gap-3 bg-gray-50 p-3">
            {ogPreview.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ogPreview.image} alt="" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
            )}
            <div className="flex flex-col gap-0.5 min-w-0">
              {ogPreview.siteName && <p className="text-xs text-gray-400 truncate">{ogPreview.siteName}</p>}
              {ogPreview.title && <p className="text-xs font-semibold text-gray-700 line-clamp-2">{ogPreview.title}</p>}
              {ogPreview.description && <p className="text-xs text-gray-500 line-clamp-2">{ogPreview.description}</p>}
            </div>
          </div>
        )}
      </div>

      <div>
        <label className={labelClass}>Anotação</label>
        <div className="relative">
          <textarea
            rows={3}
            placeholder="O que chama atenção neste conteúdo?"
            value={isListening ? form.annotation + (interimText ? " " + interimText : "") : form.annotation}
            onChange={field("annotation")}
            className={`${inputClass} resize-none pr-12`}
          />
          <button
            type="button"
            onClick={isListening ? stop : start}
            className={`absolute bottom-2 right-2 p-2 rounded-lg transition-colors ${isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-gray-100 text-gray-500 hover:bg-[#6A00FF]/10 hover:text-[#6A00FF]"}`}
            aria-label={isListening ? "Parar gravação" : "Gravar áudio"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
        {isListening && (
          <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block animate-pulse" />
            Ouvindo…
          </p>
        )}
        {voiceError && (
          <p className="text-xs text-orange-500 mt-1">{voiceError}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Dores e Desejos</label>
        <textarea rows={2} placeholder="Que dores ou desejos esse conteúdo reflete?" value={form.dores_desejos} onChange={field("dores_desejos")} className={`${inputClass} resize-none`} />
      </div>

      <div>
        <label className={labelClass}>Assunto</label>
        <input type="text" placeholder="Ex: dança contemporânea, captação de alunos…" value={form.assunto} onChange={field("assunto")} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Funil</label>
          <select value={form.funil} onChange={field("funil")} className={inputClass}>
            <option value="">— Funil —</option>
            <option value="Topo">Topo</option>
            <option value="Meio">Meio</option>
            <option value="Fundo">Fundo</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Negócio</label>
          <select value={form.negocio} onChange={field("negocio")} className={inputClass}>
            <option value="">— Negócio —</option>
            <option value="Sede">Sede</option>
            <option value="MoviRio">MoviRio</option>
            <option value="Nova Atmosfera">Nova Atmosfera</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving || (!form.url && !form.annotation)}
        className="w-full rounded-xl bg-[#6A00FF] text-white font-semibold py-3 text-sm hover:bg-[#5800d4] active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saving ? "Salvando…" : "Salvar"}
      </button>
    </form>
  );
}

// ─── Busca Viral ─────────────────────────────────────────────────────────────

function BuscaViral({ onSave }: { onSave: (entry: Entry) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ViralVideo[]>([]);
  const [newsResults, setNewsResults] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [trends, setTrends] = useState<TrendChip[]>([]);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch("/api/pauta/trends")
      .then((r) => r.json())
      .then((data) => setTrends(data))
      .catch(() => {});
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResults([]);
    setNewsResults([]);
    setSearched(false);
    try {
      const [viralRes, newsRes] = await Promise.allSettled([
        fetch(`/api/pauta/viral?q=${encodeURIComponent(query)}`),
        fetch(`/api/pauta/news?q=${encodeURIComponent(query)}`),
      ]);
      if (viralRes.status === "fulfilled") {
        const data = await viralRes.value.json();
        if (!viralRes.value.ok) throw new Error(data.error ?? "Erro na busca");
        setResults(data);
      }
      if (newsRes.status === "fulfilled" && newsRes.value.ok) {
        const data = await newsRes.value.json();
        setNewsResults(data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro na busca");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  async function handleSave(video: ViralVideo) {
    setSaving(video.videoId);
    try {
      const res = await fetch("/api/pauta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: video.url,
          annotation: video.title,
          dores_desejos: "",
          funil: "",
          negocio: "",
          status: "Referência",
          assunto: query,
        }),
      });
      if (!res.ok) throw new Error("Erro ao salvar");
      const entry = await res.json() as Entry;
      onSave(entry);
      setResults((prev: ViralVideo[]) => prev.filter((v: ViralVideo) => v.videoId !== video.videoId));
    } catch {
      alert("Erro ao salvar referência.");
    } finally {
      setSaving(null);
    }
  }

  const inputClass = "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30 focus:border-[#6A00FF] transition";

  return (
    <div className="flex flex-col gap-4">
      {trends.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trends.map((chip) => (
            <button
              key={chip.term}
              type="button"
              onClick={() => setQuery(chip.term)}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                chip.trending
                  ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {chip.trending && <span className="mr-1">🔥</span>}
              {chip.term}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Ex: dança contemporânea, ballet infantil…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-xl bg-[#6A00FF] text-white font-semibold px-4 py-2.5 text-sm hover:bg-[#5800d4] active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          {loading ? "…" : "Buscar"}
        </button>
      </form>
      <p className="text-xs text-gray-400">Vídeos do YouTube dos últimos 30 dias + notícias de portais brasileiros.</p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-[#6A00FF] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {results.map((video) => (
        <div key={video.videoId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={video.thumbnail} alt={video.title} className="w-full aspect-video object-cover" />
          <div className="p-4 flex flex-col gap-2">
            <p className="text-sm font-semibold text-gray-800 line-clamp-2">{video.title}</p>
            <p className="text-xs text-gray-400">
              {video.channel} · {new Date(video.publishedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
            {/* Stats */}
            {(video.viewCount > 0 || video.likeCount > 0) && (
              <div className="flex gap-3 text-xs text-gray-400">
                {video.viewCount > 0 && (
                  <span>👁 {video.viewCount >= 1_000_000
                    ? `${(video.viewCount / 1_000_000).toFixed(1)}M`
                    : video.viewCount >= 1_000
                    ? `${(video.viewCount / 1_000).toFixed(0)}K`
                    : video.viewCount} views</span>
                )}
                {video.likeCount > 0 && (
                  <span>👍 {video.likeCount >= 1_000 ? `${(video.likeCount / 1_000).toFixed(0)}K` : video.likeCount}</span>
                )}
                {video.commentCount > 0 && (
                  <span>💬 {video.commentCount >= 1_000 ? `${(video.commentCount / 1_000).toFixed(0)}K` : video.commentCount}</span>
                )}
              </div>
            )}
            {/* Description snippet */}
            {video.description && (
              <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{video.description}</p>
            )}
            <div className="flex gap-2 mt-1">
              <a href={video.url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center rounded-xl border border-gray-200 text-xs font-medium text-gray-600 py-2 hover:bg-gray-50 transition">
                Ver vídeo
              </a>
              <button
                onClick={() => handleSave(video)}
                disabled={saving === video.videoId}
                className="flex-1 rounded-xl bg-[#6A00FF] text-white text-xs font-semibold py-2 hover:bg-[#5800d4] active:scale-95 transition disabled:opacity-40"
              >
                {saving === video.videoId ? "Salvando…" : "→ Referência"}
              </button>
            </div>
          </div>
        </div>
      ))}

      {!loading && searched && results.length === 0 && newsResults.length === 0 && !error && (
        <p className="text-center text-sm text-gray-400 py-4">Nenhum vídeo encontrado no YouTube. Tente outro assunto.</p>
      )}

      {searched && !loading && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notícias</p>
          {newsResults.length === 0 && (
            <p className="text-xs text-gray-400">Nenhuma notícia encontrada para este assunto nos portais (G1, Folha, UOL).</p>
          )}
          {newsResults.map((item) => (
            <div key={item.url} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex gap-3 p-3">
              {item.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
              )}
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <p className="text-xs text-gray-400">{item.source}</p>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{item.title}</p>
                {item.description && <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#6A00FF] hover:underline mt-auto"
                >
                  Ler notícia ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Draft Card ──────────────────────────────────────────────────────────────

const DRAFT_STATUS_COLORS: Record<DraftStatus, string> = {
  Rascunho: "bg-yellow-100 text-yellow-700",
  Publicado: "bg-green-100 text-green-700",
};

function DraftCard({ draft, onDelete, onUpdate }: {
  draft: Draft;
  onDelete: (id: string) => void;
  onUpdate: (id: string, changes: Partial<Pick<Draft, "content" | "status">>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(draft.content);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  async function handleSaveEdit() {
    if (editContent === draft.content) { setEditing(false); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/pauta/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, content: editContent }),
      });
      if (!res.ok) throw new Error("API error");
      onUpdate(draft.id, { content: editContent });
      setEditing(false);
    } catch {
      alert("Erro ao salvar edição.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus() {
    const newStatus: DraftStatus = draft.status === "Rascunho" ? "Publicado" : "Rascunho";
    setTogglingStatus(true);
    try {
      const res = await fetch("/api/pauta/drafts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id, status: newStatus }),
      });
      if (!res.ok) throw new Error("API error");
      onUpdate(draft.id, { status: newStatus });
    } catch {
      alert("Erro ao atualizar status.");
    } finally {
      setTogglingStatus(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Remover este rascunho?")) return;
    setDeleting(true);
    try {
      await fetch("/api/pauta/drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: draft.id }),
      });
      onDelete(draft.id);
    } catch {
      alert("Erro ao remover rascunho.");
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium transition hover:opacity-80 ${DRAFT_STATUS_COLORS[draft.status]}`}
              title="Clique para alternar status"
            >
              {draft.status}
            </button>
            {draft.negocio && (
              <Badge label={draft.negocio} colorClass={NEGOCIO_COLORS[draft.negocio] ?? "bg-gray-100 text-gray-600"} />
            )}
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            aria-label="Remover rascunho"
            className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {editing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={6}
            className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#6A00FF]/30"
          />
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{draft.content}</p>
        )}

        <p className="text-xs text-gray-300">
          {draft.assunto && <span className="text-[#6A00FF]/60 font-medium mr-1">#{draft.assunto}</span>}
          {draft.user} · {new Date(draft.timestamp).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
        </p>

        <div className="flex gap-2 pt-1 border-t border-gray-50">
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setEditContent(draft.content); }}
                className="flex-1 text-xs font-medium py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex-1 text-xs font-semibold py-2 rounded-xl bg-[#6A00FF] text-white hover:bg-[#5800d4] transition disabled:opacity-50"
              >
                {saving ? "Salvando…" : "Salvar"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex-1 text-xs font-medium py-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition flex items-center justify-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#6A00FF] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pauta Digital</h1>
          <p className="text-sm text-gray-500 mt-1">Sede do Movimento</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-600 text-center mb-6">
            Acesso restrito ao time<br />
            <span className="text-[#6A00FF] font-medium">@sededomovimento.art</span>
          </p>
          <button
            onClick={() => { setLoading(true); signIn("google", { callbackUrl: "/pauta/sede" }); }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? "Redirecionando…" : "Entrar com Google"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PautaPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("Referência");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDrafts, setLoadingDrafts] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [last30, setLast30] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/pauta")
      .then((r) => r.json())
      .then((data: Entry[] | { error: string }) => Array.isArray(data) && setEntries(data))
      .catch(console.error)
      .finally(() => setLoading(false));
    fetch("/api/pauta/drafts")
      .then((r) => r.json())
      .then((data: Draft[] | { error: string }) => Array.isArray(data) && setDrafts(data))
      .catch(console.error)
      .finally(() => setLoadingDrafts(false));
  }, [status]);

  const cutoff = last30 ? Date.now() - 30 * 24 * 60 * 60 * 1000 : 0;
  const filtered = activeTab !== "Busca Viral" && activeTab !== "Rascunho"
    ? entries.filter((e: Entry) =>
        e.status === activeTab &&
        (!last30 || new Date(e.timestamp).getTime() >= cutoff)
      )
    : [];

  function handleAdd(entry: Entry) {
    setEntries((prev) => [entry, ...prev]);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleStatusChange(id: string, newStatus: Status) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, status: newStatus } : e));
  }

  function handleDraftAdded(draft: Draft) {
    setDrafts((prev) => [draft, ...prev]);
  }

  function handleDraftDelete(id: string) {
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  function handleDraftUpdate(id: string, changes: Partial<Pick<Draft, "content" | "status">>) {
    setDrafts((prev) => prev.map((d) => d.id === id ? { ...d, ...changes } : d));
  }

  function handleEntryUpdate(id: string, changes: Partial<Entry>) {
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, ...changes } : e));
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-2 border-[#6A00FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <LoginScreen />;

  const tabs: Tab[] = ["Referência", "Para Fazer", "Busca Viral", "Rascunho"];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#6A00FF] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-sm">Pauta Digital</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-[#6A00FF] transition flex items-center gap-1"
            title="Abrir planilha no Google Sheets"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M14 3v18M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
            Planilha
          </a>
          <button onClick={() => signOut({ callbackUrl: "/pauta/login" })} className="text-xs text-gray-400 hover:text-gray-600 transition">
            Sair
          </button>
        </div>
      </header>

      <div className="sticky top-[57px] z-20 bg-white border-b border-gray-100 px-4">
        <div className="flex items-center justify-between">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setShowForm(false); }}
                className={`flex-shrink-0 px-3 py-3 text-sm font-semibold transition border-b-2 ${
                  activeTab === tab
                    ? "border-[#6A00FF] text-[#6A00FF]"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab}
                {tab !== "Busca Viral" && (
                  <span className="ml-1.5 text-xs font-normal opacity-60">
                    ({tab === "Rascunho"
                      ? drafts.length
                      : entries.filter((e: Entry) => e.status === tab).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          {activeTab !== "Busca Viral" && activeTab !== "Rascunho" && (
            <button
              onClick={() => setLast30((v: boolean) => !v)}
              className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full transition ml-2 ${
                last30
                  ? "bg-[#6A00FF] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              30d
            </button>
          )}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-28 flex flex-col gap-4">
        {activeTab === "Busca Viral" ? (
          <BuscaViral onSave={handleAdd} />
        ) : activeTab === "Rascunho" ? (
          <>
            {loadingDrafts ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-[#6A00FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">✏️</p>
                <p className="text-sm">Nenhum rascunho ainda.</p>
                <p className="text-xs mt-1">Gere um post em qualquer referência e clique em <strong>salvar rascunho</strong>.</p>
              </div>
            ) : (
              drafts.map((draft) => (
                <DraftCard
                  key={draft.id}
                  draft={draft}
                  onDelete={handleDraftDelete}
                  onUpdate={handleDraftUpdate}
                />
              ))
            )}
          </>
        ) : (
          <>
            {showForm && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Nova entrada</span>
                  <button onClick={() => setShowForm(false)} className="text-xs text-gray-400 hover:text-gray-600">cancelar</button>
                </div>
                <NewEntryForm activeTab={activeTab as Status} onAdd={handleAdd} />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="w-6 h-6 border-2 border-[#6A00FF] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm">Nenhuma entrada em <strong>{activeTab}</strong> ainda.</p>
                <p className="text-xs mt-1">Toque no <strong>+</strong> para adicionar.</p>
              </div>
            ) : (
              filtered.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                  onDraftAdded={handleDraftAdded}
                  onUpdate={handleEntryUpdate}
                />
              ))
            )}
          </>
        )}
      </main>

      {activeTab !== "Busca Viral" && activeTab !== "Rascunho" && (
        <button
          onClick={() => setShowForm((v) => !v)}
          aria-label="Adicionar entrada"
          className={`fixed bottom-6 right-5 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-2xl font-light transition-all active:scale-90 ${
            showForm ? "bg-gray-400 rotate-45" : "bg-[#6A00FF] hover:bg-[#5800d4] shadow-purple-300"
          }`}
        >
          +
        </button>
      )}
    </div>
  );
}
