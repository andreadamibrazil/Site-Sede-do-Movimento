import { cn } from "@/lib/utils/cn";
import { ImageIcon } from "lucide-react";

interface PlaceholderImageProps {
  width?: string | number;
  height?: string | number;
  label?: string;
  className?: string;
  aspectRatio?: string;
}

export default function PlaceholderImage({
  label = "Imagem",
  className,
  aspectRatio,
}: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-gray-100 text-gray-400 border border-gray-200 rounded-lg overflow-hidden",
        aspectRatio && `aspect-[${aspectRatio}]`,
        !aspectRatio && "w-full h-full min-h-48",
        className
      )}
    >
      <ImageIcon size={32} className="opacity-50 mb-2" />
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}
