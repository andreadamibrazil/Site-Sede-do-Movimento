"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Status = "idle" | "loading" | "success" | "error";

interface NewsletterFormProps {
  /** "dark" = white text, for dark backgrounds (footer, blog). Default. */
  theme?: "dark" | "light";
  className?: string;
}

export default function NewsletterForm({ theme = "dark", className }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Erro ao processar inscrição.");
        setStatus("error");
      } else {
        setStatus("success");
        setEmail("");
      }
    } catch {
      setErrorMsg("Erro de conexão. Tente novamente.");
      setStatus("error");
    }
  }

  const isDark = theme === "dark";

  if (status === "success") {
    return (
      <div className={cn("flex items-center gap-2", isDark ? "text-white" : "text-gray-900", className)}>
        <CheckCircle size={18} className="text-green-400 shrink-0" />
        <p className={cn("text-sm font-medium", isDark ? "text-white/80" : "text-gray-700")}>
          Inscrito com sucesso! Verifique seu e-mail.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Seu melhor e-mail"
          required
          disabled={status === "loading"}
          className={cn(
            "flex-1 h-11 px-4 rounded-full text-sm focus:outline-none transition-all disabled:opacity-60",
            isDark
              ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:border-white/50"
              : "bg-gray-100 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-brand-purple-400"
          )}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-11 px-5 bg-brand-purple-600 hover:bg-brand-purple-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-full transition-colors flex items-center gap-1.5 shrink-0"
        >
          {status === "loading" ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <>Assinar <ArrowRight size={14} /></>
          )}
        </button>
      </div>
      {status === "error" && (
        <p className={cn("flex items-center gap-1.5 text-xs mt-2", isDark ? "text-red-300" : "text-red-500")}>
          <AlertCircle size={13} />
          {errorMsg}
        </p>
      )}
    </form>
  );
}
