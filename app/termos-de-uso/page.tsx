import { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/live";
import { legalPageBySlugQuery } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Termos de Uso | Sede do Movimento",
  robots: { index: false, follow: false },
};

const FALLBACK_CONTENT = `TERMOS DE USO

Última atualização: 16 de abril de 2026

Ao acessar e usar o site sededomovimento.art, você concorda com os seguintes Termos de Uso. Se não concordar com algum dos termos, solicitamos que não utilize o site.

1. USO DO SITE

O site é destinado a fornecer informações sobre a Sede do Movimento, seus serviços, cursos e atividades. Você concorda em usar o site apenas para fins legais e de maneira que não infrinja os direitos de terceiros.

2. PROPRIEDADE INTELECTUAL

Todo o conteúdo deste site — incluindo textos, imagens, logotipos, vídeos e materiais audiovisuais — é de propriedade da Sede do Movimento ou de seus licenciantes e está protegido por leis de propriedade intelectual. É proibida a reprodução, distribuição ou uso comercial sem autorização prévia e por escrito.

3. ISENÇÃO DE RESPONSABILIDADE

O site é fornecido "no estado em que se encontra". Não garantimos que o site estará sempre disponível, livre de erros ou vírus. Não nos responsabilizamos por danos decorrentes do uso ou da impossibilidade de uso do site.

4. LINKS EXTERNOS

Nosso site pode conter links para sites de terceiros. Não temos controle sobre o conteúdo desses sites e não nos responsabilizamos por suas práticas de privacidade ou conteúdo.

5. MODIFICAÇÕES

Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entram em vigor imediatamente após a publicação. O uso continuado do site após as alterações implica aceitação dos novos termos.

6. LEGISLAÇÃO APLICÁVEL

Estes Termos de Uso são regidos pelas leis do Brasil. Qualquer disputa será resolvida no foro da comarca do Rio de Janeiro — RJ.

7. CONTATO

Para dúvidas sobre estes termos:
E-mail: contato@sededomovimento.art
Endereço: Rio Comprido, Rio de Janeiro — RJ`;

export default async function TermosDeUsoPage() {
  const { data } = await sanityFetch({
    query: legalPageBySlugQuery,
    params: { slug: "termos-de-uso" },
  });
  const page = data as { title?: string; effectiveDate?: string; content?: string } | null;

  const title = page?.title ?? "Termos de Uso";
  const effectiveDate = page?.effectiveDate ?? "16 de abril de 2026";
  const content = page?.content ?? FALLBACK_CONTENT;

  return (
    <div className="min-h-screen bg-white px-6 py-16 max-w-3xl mx-auto">
      <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 mb-10 inline-block">
        ← Voltar ao site
      </Link>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-2">{title}</h1>
      <p className="text-sm text-gray-400 mb-10">Última atualização: {effectiveDate}</p>
      <div className="prose prose-sm prose-gray max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-600 leading-relaxed">{content}</pre>
      </div>
    </div>
  );
}
