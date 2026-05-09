"use client";

import { useState } from "react";
import { useDocumentOperation } from "sanity";
import { DocumentActionComponent, DocumentActionProps } from "sanity";
import { SparklesIcon } from "@sanity/icons";

function useImageUrl(doc: Record<string, unknown>): string | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

  const image = (doc?.coverImage ?? doc?.heroImage ?? doc?.image ?? doc?.img) as
    | { asset?: { _ref?: string } }
    | undefined;

  if (!image?.asset?._ref) return null;

  // Parse ref: image-<id>-<dimensions>-<format>
  const ref = image.asset._ref;
  const parts = ref.replace("image-", "").split("-");
  if (parts.length < 3) return null;
  const format = parts[parts.length - 1];
  const id = parts.slice(0, parts.length - 2).join("-");

  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}.${format}`;
}

export const GenerateAIDescription: DocumentActionComponent = (
  props: DocumentActionProps
) => {
  const { patch } = useDocumentOperation(props.id, props.type);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const doc = props.draft ?? props.published ?? {};
  const imageUrl = useImageUrl(doc as Record<string, unknown>);
  const title = (doc as Record<string, unknown>)?.title as string | undefined;

  if (!imageUrl) return null;

  return {
    label: loading ? "Gerando descrição..." : done ? "✓ Descrição gerada!" : "Gerar descrição IA",
    icon: SparklesIcon,
    disabled: loading,
    tone: done ? "positive" : "primary",
    onHandle: async () => {
      setLoading(true);
      setDone(false);
      try {
        const res = await fetch("/api/ai/describe-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl,
            postTitle: title,
            context: `${props.type} da Sede do Movimento`,
          }),
        });

        if (!res.ok) throw new Error("Erro na API");
        const { description } = (await res.json()) as { description: string };

        // Salva no campo aiDescription da imagem de capa
        if ((doc as Record<string, unknown>)?.coverImage) {
          patch.execute([
            { set: { "coverImage.aiDescription": description } },
            {
              setIfMissing: {
                "coverImage.alt": description.slice(0, 125),
              },
            },
          ]);
        } else if ((doc as Record<string, unknown>)?.image) {
          patch.execute([
            { set: { "image.aiDescription": description } },
            { setIfMissing: { "image.alt": description.slice(0, 125) } },
          ]);
        }

        setDone(true);
        setTimeout(() => setDone(false), 4000);
      } catch (err) {
        console.error("[GenerateAIDescription]", err);
      } finally {
        setLoading(false);
      }
    },
  };
};
