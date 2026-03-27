import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock } from "lucide-react";
import { SanityPost } from "@/lib/sanity/types";
import PlaceholderImage from "@/components/ui/PlaceholderImage";
import Badge from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/utils/formatDate";
import { urlFor } from "@/sanity/lib/image";

interface BlogPostCardProps {
  post: SanityPost;
  variant?: "vertical" | "horizontal";
}

const categoryColor: Record<string, "primary" | "accent" | "secondary" | "success" | "warning"> = {
  Escola: "primary",
  Ensino: "secondary",
  Resultados: "success",
  Espetáculos: "accent",
  Eventos: "warning",
};

export default function BlogPostCard({ post, variant = "vertical" }: BlogPostCardProps) {
  const imageUrl = post.coverImage ? urlFor(post.coverImage).width(600).height(400).url() : null;

  if (variant === "horizontal") {
    return (
      <Link href={`/blog/${post.slug}`} className="group flex gap-4 bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow">
        <div className="w-32 sm:w-40 shrink-0 aspect-square bg-gray-100 relative overflow-hidden">
          {imageUrl ? (
            <Image src={imageUrl} alt={post.title} fill className="object-cover" />
          ) : (
            <PlaceholderImage className="w-full h-full rounded-none border-none" label={post.title} />
          )}
        </div>
        <div className="flex flex-col justify-center py-3 pr-4">
          <Badge color={categoryColor[post.category] ?? "primary"} variant="subtle" size="xs" className="mb-2 w-fit">{post.category}</Badge>
          <h3 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-brand-purple-600 transition-colors">{post.title}</h3>
          <p className="text-gray-400 text-xs">{formatDateShort(post.publishedAt)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
      <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
        {imageUrl ? (
          <Image src={imageUrl} alt={post.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <PlaceholderImage className="w-full h-full rounded-none border-none" label={post.title} />
        )}
      </div>
      <div className="p-5">
        <Badge color={categoryColor[post.category] ?? "primary"} variant="subtle" size="xs" className="mb-3">{post.category}</Badge>
        <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-brand-purple-600 transition-colors">{post.title}</h3>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            {formatDateShort(post.publishedAt)}
          </div>
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {post.readingTime} min
          </div>
        </div>
      </div>
    </Link>
  );
}
