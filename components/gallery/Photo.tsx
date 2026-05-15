import { getImageMeta } from "@/lib/image-data";
import { PhotoClient } from "./PhotoClient";

export function Photo({
  src,
  alt = "",
  caption,
  priority = false,
}: {
  src: string;
  alt?: string;
  caption?: string;
  priority?: boolean;
}) {
  const meta = getImageMeta(src);
  if (!meta || !meta.width || !meta.height) {
    return null;
  }
  return (
    <PhotoClient
      src={src}
      alt={alt || caption || ""}
      caption={caption}
      width={meta.width}
      height={meta.height}
      blurDataURL={meta.blurDataURL ?? undefined}
      exif={meta.exif ?? null}
      priority={priority}
    />
  );
}
