"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { Send, CheckCircle, AlertCircle, Upload } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

const inputClass =
  "w-full h-12 px-4 bg-white border border-gray-200 rounded-sm text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:border-brand-purple-600 focus:ring-2 focus:ring-brand-purple-600/15 transition-all";
const labelClass = "block text-sm font-semibold text-gray-800 mb-1.5";
const textareaClass = cn(inputClass, "h-auto py-3 resize-y");

export default function SeletivaForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [temExperiencia, setTemExperiencia] = useState(false);
  const [temMaterial, setTemMaterial] = useState(false);
  const [fotoNome, setFotoNome] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = e.currentTarget;
      const data = new FormData(form);

      // Comprime a foto no navegador (evita o limite de upload do Vercel)
      const fotoInput = form.elements.namedItem("foto") as HTMLInputElement | null;
      const file = fotoInput?.files?.[0];
      if (file) {
        const comprimida = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        data.set("foto", comprimida, file.name);
      }

      const res = await fetch("/api/seletiva", { method: "POST", body: data });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Erro ao enviar.");
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <CheckCircle size={32} className="text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Inscrição enviada!</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          Recebemos os dados. Enviamos uma confirmação por e-mail e, havendo próximo passo, entramos em contato pelo
          WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* --- A criança --- */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-purple-600 mb-3">A candidata</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Nome completo da criança <span className="text-red-500">*</span>
              </label>
              <input name="crianca_nome" type="text" required placeholder="Nome da criança" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                Data de nascimento <span className="text-red-500">*</span>
              </label>
              <input name="crianca_nascimento" type="date" required className={cn(inputClass, "cursor-pointer")} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Cidade / bairro</label>
            <input name="crianca_cidade" type="text" placeholder="Onde mora" className={inputClass} />
          </div>
          <p className="text-xs text-gray-400">Esta seletiva é para meninas de 10 a 14 anos.</p>
        </div>
      </div>

      {/* --- Responsável --- */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-purple-600 mb-3">Responsável legal</h3>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Nome do responsável <span className="text-red-500">*</span>
              </label>
              <input name="responsavel_nome" type="text" required placeholder="Seu nome" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Parentesco</label>
              <input name="responsavel_parentesco" type="text" placeholder="Mãe, pai, avó..." className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input name="responsavel_whatsapp" type="tel" required placeholder="(21) 9 9999-9999" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                E-mail <span className="text-red-500">*</span>
              </label>
              <input name="responsavel_email" type="email" required placeholder="seu@email.com" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* --- Perfil e material --- */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-brand-purple-600 mb-3">Perfil e material</h3>
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Sobre a criança</label>
            <textarea
              name="sobre"
              rows={4}
              placeholder="Personalidade, o que gosta de fazer, por que quer participar..."
              className={textareaClass}
            />
          </div>

          <div>
            <label className={labelClass}>Já participou de TV, cinema ou teatro?</label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="experiencia_tvcinema"
                  value="true"
                  onChange={() => setTemExperiencia(true)}
                  className="w-4 h-4 accent-brand-purple-600"
                />
                Sim
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="experiencia_tvcinema"
                  value="false"
                  defaultChecked
                  onChange={() => setTemExperiencia(false)}
                  className="w-4 h-4 accent-brand-purple-600"
                />
                Não
              </label>
            </div>
            {temExperiencia && (
              <textarea
                name="experiencia_descricao"
                rows={3}
                placeholder="Conte onde e o que fez"
                className={textareaClass}
              />
            )}
          </div>

          <div>
            <label className={labelClass}>Portfólio (link)</label>
            <input name="portfolio_url" type="url" placeholder="Instagram, YouTube, Drive..." className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Vídeo de apresentação / self-tape (link)</label>
            <input name="selftape_url" type="url" placeholder="Link do YouTube (não listado), Drive ou Instagram" className={inputClass} />
            <p className="text-xs text-gray-400 mt-1">
              Um vídeo curto (até 1 min) da criança se apresentando. Suba no YouTube/Drive e cole o link.
            </p>
          </div>

          <div>
            <label className={labelClass}>Foto recente</label>
            <label
              className={cn(
                inputClass,
                "flex items-center gap-2 cursor-pointer text-gray-500 hover:border-brand-purple-600"
              )}
            >
              <Upload size={16} className="shrink-0" />
              <span className="truncate">{fotoNome || "Escolher foto (JPG ou PNG)"}</span>
              <input
                name="foto"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => setFotoNome(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </div>

          <div>
            <label className={labelClass}>
              Já tem material profissional pronto (foto e vídeo em qualidade profissional) para enviar caso seja
              escolhida?
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="material_profissional"
                  value="true"
                  onChange={() => setTemMaterial(true)}
                  className="w-4 h-4 accent-brand-purple-600"
                />
                Sim
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="material_profissional"
                  value="false"
                  defaultChecked
                  onChange={() => setTemMaterial(false)}
                  className="w-4 h-4 accent-brand-purple-600"
                />
                Ainda não
              </label>
            </div>
            {temMaterial && (
              <input
                name="material_profissional_link"
                type="url"
                placeholder="Link do material profissional (opcional)"
                className={inputClass}
              />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* --- Consentimentos --- */}
      <div className="space-y-3 pt-2">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
            name="consentimento_menor"
            value="true"
            id="ciencia-menor"
            className="mt-1 w-4 h-4 accent-brand-purple-600 cursor-pointer"
          />
          <label htmlFor="ciencia-menor" className="text-sm text-gray-600 cursor-pointer">
            Estou ciente de que a candidata é menor de idade e que{" "}
            <strong>um responsável maior de idade com vínculo familiar precisa estar presente</strong> no dia do
            encontro. Nada é assinado sem a presença desse responsável. <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            required
            name="consentimento_lgpd"
            value="true"
            id="lgpd"
            className="mt-1 w-4 h-4 accent-brand-purple-600 cursor-pointer"
          />
          <label htmlFor="lgpd" className="text-sm text-gray-600 cursor-pointer">
            Concordo com a{" "}
            <a href="/privacidade" className="text-brand-purple-600 hover:underline">
              Política de Privacidade
            </a>{" "}
            e autorizo o uso dos dados para o processo desta seletiva. <span className="text-red-500">*</span>
          </label>
        </div>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="optin_aulas"
            value="true"
            id="optin-aulas"
            className="mt-1 w-4 h-4 accent-brand-purple-600 cursor-pointer"
          />
          <label htmlFor="optin-aulas" className="text-sm text-gray-600 cursor-pointer">
            Quero receber informações sobre as aulas de teatro, dança e música da Sede do Movimento.
          </label>
        </div>
      </div>

      <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} rightIcon={<Send size={16} />}>
        {loading ? "Enviando..." : "Enviar inscrição"}
      </Button>
    </form>
  );
}
