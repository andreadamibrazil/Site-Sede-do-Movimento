import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import PageHero from "@/components/sections/PageHero";
import SectionTitle from "@/components/ui/SectionTitle";
import ScrollReveal from "@/components/ui/ScrollReveal";
import PlaceholderImage from "@/components/ui/PlaceholderImage";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("ensino/eventos-extras", {
    title: "Eventos Extras",
    description: "Eventos e atividades especiais da Sede do Movimento.",
  });
}

const eventos = [
  { name: "FAL – Festival de Artes Local", emoji: "🎪", desc: "Festival interno que reúne todas as turmas em apresentações ao vivo. Um momento de celebração e arte para toda a comunidade." },
  { name: "Aulas Temáticas", emoji: "🎉", desc: "Festa Junina, Páscoa, Dia das Crianças e muito mais. Aulas especiais que aproximam as famílias do processo artístico." },
  { name: "Semana da Família", emoji: "👨‍👩‍👧", desc: "Uma semana inteira dedicada à integração entre alunos, pais e professores. Aulas abertas, apresentações e conversas." },
  { name: "Colônia de Férias", emoji: "☀️", desc: "Durante as férias escolares, programação artística intensiva com oficinas de dança, teatro, música e artes visuais." },
  { name: "Cerimônia da Sapatilha", emoji: "🩰", desc: "Ritual especial de passagem para as bailarinas que recebem sua primeira sapatilha de ponta. Um momento emocionante e marcante." },
  { name: "Sarau Cultural", emoji: "🎭", desc: "Encontros culturais com apresentações de música e teatro. Um espaço de troca e celebração da arte em suas diversas formas." },
  { name: "Exposição de Artes", emoji: "🎨", desc: "Mostra de trabalhos artísticos dos alunos, celebrando a criatividade e o processo de criação ao longo do ano." },
  { name: "Espetáculo Janelas", emoji: "🌟", desc: "Apresentação de trabalhos intermediários ao longo do ano. Um espaço de experiência e aprendizado em formato de espetáculo." },
];

export default function EventosExtrasPage() {
  return (
    <>
      <PageHero eyebrow="Eventos extras" title="Muito além das aulas" subtitle="Atividades especiais que enriquecem a experiência artística e fortalecem a comunidade da Sede." breadcrumbs={[{ label: "Ensino", href: "/ensino" }, { label: "Eventos Extras" }]} />
      <section className="section-padding bg-white">
        <div className="container-main">
          <SectionTitle eyebrow="Calendário" title="Eventos ao longo do ano" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {eventos.map((ev, i) => (
              <ScrollReveal key={ev.name} delay={i * 0.06}>
                <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                  <div className="text-3xl mb-3">{ev.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{ev.name}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{ev.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <PlaceholderImage className="w-full h-full rounded-none border-none" label={`Evento ${i + 1}`} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
