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
      data-photo-src={src}
      data-photo-meta={meta}
      onClick={() => open(src)}
      aria-label={caption || "Open image"}
      className="relative m-0 block w-full cursor-zoom-in overflow-hidden rounded-[10px] border-0 bg-transparent p-0 transition-transform duration-[160ms] hover:-translate-y-px [&_img]:block [&_img]:h-auto [&_img]:w-full [&_img]:bg-bg-elev"
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
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-start bg-[linear-gradient(to_top,rgba(0,0,0,0.55)_0%,rgba(0,0,0,0.25)_55%,rgba(0,0,0,0)_100%)] px-[18px] pt-12 pb-[14px] max-[640px]:px-[14px] max-[640px]:pt-9 max-[640px]:pb-[10px]">
          <span className="font-serif text-[15px] italic leading-[1.35] tracking-[-0.005em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.45)] max-[640px]:text-[13px]">
            {caption}
          </span>
        </span>
      )}
    </button>
  );
}
