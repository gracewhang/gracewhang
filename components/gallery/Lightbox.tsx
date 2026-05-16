"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Exif } from "@/lib/image-data";

export type LightboxItem = {
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
  exif?: Exif | null;
};

type Props = {
  item: LightboxItem;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
};

function formatDate(iso?: string | null) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

const btnBase =
  "absolute z-[2] inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/[0.08] p-0 text-white transition-[background,transform] duration-[160ms] hover:bg-white/[0.18] [&>svg]:block";

export function Lightbox({
  item,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  if (!mounted) return null;

  const exif = item.exif ?? null;
  const date = formatDate(exif?.dateTaken);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/90 p-6 [animation:lightbox-in_160ms_ease]"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className={`${btnBase} right-[18px] top-[18px]`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous image"
            className={`${btnBase} left-[18px] top-1/2 -translate-y-1/2 hover:-translate-x-0.5 hover:-translate-y-1/2 max-[640px]:hidden`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next image"
            className={`${btnBase} right-[18px] top-1/2 -translate-y-1/2 hover:translate-x-0.5 hover:-translate-y-1/2 max-[640px]:hidden`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex h-full w-full max-w-[1400px] flex-col items-center gap-4 px-14 max-[640px]:px-2"
      >
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <Image
            key={item.src}
            src={item.src}
            alt=""
            width={item.width}
            height={item.height}
            placeholder={item.blurDataURL ? "blur" : "empty"}
            blurDataURL={item.blurDataURL}
            sizes="100vw"
            quality={90}
            priority
            className="!h-auto max-h-full !w-auto max-w-full rounded-[4px] object-contain shadow-[0_30px_80px_-10px_rgba(0,0,0,0.6)]"
          />
        </div>

        <div className="flex w-full flex-none flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-1 text-[13px] text-white/85">
          <span className="font-mono tabular-nums tracking-[0.06em] text-white/55">
            {index + 1} / {total}
          </span>
          {exif ? (
            <ul className="m-0 flex list-none flex-wrap items-center gap-x-[14px] gap-y-1 p-0 text-white/90 tabular-nums [&>li]:inline-flex [&>li]:items-center [&>li+li]:before:mr-[14px] [&>li+li]:before:text-white/35 [&>li+li]:before:content-['·']">
              {exif.camera && <li>{exif.camera}</li>}
              {exif.focalLength != null && <li>{exif.focalLength}mm</li>}
              {exif.fNumber != null && <li>f/{exif.fNumber}</li>}
              {exif.exposureTime && <li>{exif.exposureTime}</li>}
              {exif.iso != null && <li>ISO {exif.iso}</li>}
              {date && <li>{date}</li>}
            </ul>
          ) : (
            <span className="m-0 text-xs text-white/45">No EXIF data</span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
