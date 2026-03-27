import { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export const metadata: Metadata = { title: "Parcerias", description: "Parceiros institucionais da Sede do Movimento." };

export default function ParceriasPage() {
  return (
    <>
      <PageHero eyebrow="Parcerias" title="Quem acredita na arte como transformação" breadcrumbs={[{ label: "A Escola", href: "/a-escola" }, { label: "Parcerias" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Nossos parceiros" title="Construindo juntos" subtitle="Desenvolvemos parcerias com a Prefeitura do Rio de Janeiro, instituições públicas e privadas, ampliando o alcance de ações culturais e projetos de impacto social." />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-center justify-center aspect-[2/1]">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Parceiro ${i + 1}`} />
              </div>
            ))}
          </div>
          <div className="bg-brand-light rounded-2xl p-8 text-center max-w-2xl mx-auto">
            <h3 className="font-bold text-gray-900 text-xl mb-3">Seja um parceiro</h3>
            <p className="text-gray-500 leading-relaxed mb-6">Estamos abertos a conexões com instituições, empresas e projetos que acreditam na arte como ferramenta de desenvolvimento humano, social, cultural e sustentável.</p>
            <a href="/contato" className="inline-flex items-center gap-2 bg-brand-purple-600 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-brand-purple-700 transition-colors">
              Entre em contato
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
