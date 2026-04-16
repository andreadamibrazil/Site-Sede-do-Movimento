import { Metadata } from "next";
import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/live";
import { legalPageBySlugQuery } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Política de Privacidade | Sede do Movimento",
  robots: { index: false, follow: false },
};

const FALLBACK_CONTENT = `POLÍTICA DE PRIVACIDADE

Última atualização: 16 de abril de 2026

A Sede do Movimento ("nós", "nossa") está comprometida com a proteção da sua privacidade. Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações ao acessar nosso site (sededomovimento.art).

1. INFORMAÇÕES QUE COLETAMOS

Coletamos informações que você nos fornece diretamente, como nome, e-mail e telefone ao preencher formulários de contato ou matrícula. Também coletamos automaticamente dados de uso por meio de ferramentas de análise.

2. USO DE COOKIES E TECNOLOGIAS DE RASTREAMENTO

Utilizamos cookies e tecnologias similares para melhorar sua experiência e analisar o tráfego do site. Ao continuar navegando, você concorda com o uso de cookies conforme esta política.

Ferramentas utilizadas:
• Google Analytics — análise de tráfego e comportamento de usuários. Você pode optar por não participar em: https://tools.google.com/dlpage/gaoptout
• Microsoft Clarity — gravações de sessão e mapas de calor para melhorar a usabilidade do site.
• Google AdSense — exibição de anúncios (recurso planejado para uso futuro).

3. COMO USAMOS SUAS INFORMAÇÕES

Utilizamos as informações coletadas para: operar e melhorar o site, responder a solicitações de contato, enviar comunicações sobre nossos serviços (com seu consentimento) e cumprir obrigações legais.

4. COMPARTILHAMENTO DE INFORMAÇÕES

Não vendemos nem alugamos suas informações pessoais. Podemos compartilhá-las com prestadores de serviços que nos auxiliam na operação do site, sempre sujeitos a obrigações de confidencialidade.

5. SEUS DIREITOS (LGPD)

Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem o direito de acessar, corrigir, excluir ou portar seus dados pessoais. Para exercer esses direitos, entre em contato conosco.

6. SEGURANÇA

Adotamos medidas técnicas e organizacionais razoáveis para proteger suas informações contra acesso não autorizado.

7. ALTERAÇÕES NESTA POLÍTICA

Podemos atualizar esta política periodicamente. A versão mais recente estará sempre disponível nesta página com a data de atualização.

8. CONTATO

Para questões sobre privacidade ou proteção de dados:
E-mail: contato@sededomovimento.art
Endereço: Rio Comprido, Rio de Janeiro — RJ

Esta política é regida pelas leis do Brasil.`;

export default async function PoliticaDePrivacidadePage() {
  const { data } = await sanityFetch({
    query: legalPageBySlugQuery,
    params: { slug: "politica-de-privacidade" },
  });
  const page = data as { title?: string; effectiveDate?: string; content?: string } | null;

  const title = page?.title ?? "Política de Privacidade";
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
