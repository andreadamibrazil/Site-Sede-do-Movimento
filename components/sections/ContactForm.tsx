"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ContactFormProps {
  formType?: "general" | "trabalhe-conosco" | "ouvidoria";
}

export default function ContactForm({ formType = "general" }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSubmitted(true);
  };

  const inputClass = "w-full h-12 px-4 bg-white border border-gray-200 rounded-sm text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-purple-600 focus:ring-2 focus:ring-brand-purple-600/15 transition-all";
  const labelClass = "block text-sm font-semibold text-gray-800 mb-1.5";

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Mensagem enviada!</h3>
        <p className="text-gray-500 text-sm max-w-sm">Obrigado pelo seu contato. Retornaremos em breve.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome completo <span className="text-red-500">*</span></label>
          <input type="text" required placeholder="Seu nome" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail <span className="text-red-500">*</span></label>
          <input type="email" required placeholder="seu@email.com" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Telefone</label>
          <input type="tel" placeholder="(21) 9 9999-9999" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Assunto <span className="text-red-500">*</span></label>
          <select required className={cn(inputClass, "cursor-pointer")}>
            <option value="">Selecione...</option>
            {formType === "general" && <>
              <option>Informações sobre cursos</option>
              <option>Matrículas</option>
              <option>Parcerias</option>
              <option>Espetáculos</option>
              <option>Outros</option>
            </>}
            {formType === "trabalhe-conosco" && <>
              <option>Professor(a)</option>
              <option>Produção</option>
              <option>Administração</option>
              <option>Estágio</option>
            </>}
            {formType === "ouvidoria" && <>
              <option>Sugestão</option>
              <option>Reclamação</option>
              <option>Elogio</option>
              <option>Denúncia</option>
            </>}
          </select>
        </div>
      </div>

      {formType === "trabalhe-conosco" && (
        <div>
          <label className={labelClass}>Currículo / Portfólio (link ou arquivo)</label>
          <input type="url" placeholder="https://..." className={inputClass} />
        </div>
      )}

      <div>
        <label className={labelClass}>Mensagem <span className="text-red-500">*</span></label>
        <textarea
          required
          rows={5}
          placeholder={formType === "ouvidoria" ? "Descreva sua manifestação..." : "Como podemos ajudar?"}
          className={cn(inputClass, "h-auto py-3 resize-y")}
        />
      </div>

      <div className="flex items-start gap-3">
        <input type="checkbox" required id="lgpd" className="mt-1 w-4 h-4 accent-brand-purple-600 cursor-pointer" />
        <label htmlFor="lgpd" className="text-sm text-gray-500 cursor-pointer">
          Concordo com a{" "}
          <a href="/privacidade" className="text-brand-purple-600 hover:underline">Política de Privacidade</a>{" "}
          e autorizo o uso dos meus dados para contato.
        </label>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        rightIcon={<Send size={16} />}
      >
        {loading ? "Enviando..." : "Enviar mensagem"}
      </Button>
    </form>
  );
}
