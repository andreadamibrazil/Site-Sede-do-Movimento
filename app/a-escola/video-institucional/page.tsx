import { Metadata } from "next";
import { getPageMetadata } from "@/lib/utils/getPageMetadata";
import { sanityFetch } from "@/sanity/lib/live";
import { videoInstitucionalQuery } from "@/lib/sanity/queries";
import PageHero from "@/components/sections/PageHero";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("a-escola/video-institucional", {
    title: "Vídeo Institucional",
    description:
      "Conheça a Sede do Movimento, nossos valores, nossa história e o que nos move através do nosso vídeo institucional.",
  });
}

type VideoDoc = {
  title: string;
  youtubeUrl: string;
  description?: string;
};

function getEmbedUrl(url: string): string | null {
  try {
    // youtu.be/ID
    const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (short) return `https://www.youtube.com/embed/${short[1]}?rel=0`;

    // youtube.com/watch?v=ID
    const watch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (watch) return `https://www.youtube.com/embed/${watch[1]}?rel=0`;

    // already an embed URL
    const embed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
    if (embed) return `https://www.youtube.com/embed/${embed[1]}?rel=0`;

    return null;
  } catch {
    return null;
  }
}

export default async function VideoInstitucionalPage() {
  const { data } = await sanityFetch({ query: videoInstitucionalQuery });
  const video = data as VideoDoc | null;
  const embedUrl = video?.youtubeUrl ? getEmbedUrl(video.youtubeUrl) : null;

  return (
    <>
      <PageHero
        eyebrow="A Escola"
        title={video?.title ?? "Vídeo Institucional"}
        subtitle={
          video?.description ??
          "Conheça a Sede do Movimento, nossa história e o que nos move."
        }
        breadcrumbs={[
          { label: "A Escola", href: "/a-escola" },
          { label: "Vídeo Institucional" },
        ]}
      />

      <section className="section-padding bg-white">
        <div className="container-main">
          <div className="max-w-4xl mx-auto">
            {embedUrl ? (
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-brand-md">
                <iframe
                  src={embedUrl}
                  title={video?.title ?? "Vídeo Institucional"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-2xl bg-gray-100 flex flex-col items-center justify-center gap-3">
                <p className="text-gray-500 font-medium">Vídeo não configurado.</p>
                <p className="text-gray-400 text-sm text-center max-w-sm">
                  Acesse o Sanity Studio, vá em Vídeos e cadastre um vídeo com a
                  categoria <strong>Institucional</strong> e marque-o como ativo.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
