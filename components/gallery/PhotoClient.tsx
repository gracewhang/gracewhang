"use client";

import Image from "next/image";
import { useGalleryCtx } from "./GalleryShell";
import type { Exif } from "@/lib/image-data";

type Props = {
  src: string;
  alt?: string;
  caption?: string;
  width: number;
  height: number;
  blurDataURL?: string;
  exif: Exif | null;
  priority?: boolean;
};

export function PhotoClient({
  src,
  alt = "",
  caption,
  width,
  height,
  blurDataURL,
  exif,
  priority,
}: Props) {
  const { open } = useGalleryCtx();

  // Caption is intentionally NOT in this payload — the lightbox stays clean.
  const meta = JSON.stringify({
    width,
    height,
    blurDataURL,
    exif,
  });

  return (
    <button
      type="button"
      className="photo"
      data-photo-src={src}
      data-photo-meta={meta}
      onClick={() => open(src)}
      aria-label={caption || "Open image"}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        sizes="(max-width: 800px) 100vw, 720px"
        priority={priority}
      />
      {caption && (
        <span className="photo-caption">
          <span className="photo-caption-text">{caption}</span>
        </span>
      )}
    </button>
  );
}
