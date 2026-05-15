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
      className="lightbox"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox-btn lightbox-close"
        onClick={onClose}
        aria-label="Close"
      >
        ×
      </button>
      {total > 1 && (
        <>
          <button
            type="button"
            className="lightbox-btn lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            aria-label="Previous image"
          >
            ‹
          </button>
          <button
            type="button"
            className="lightbox-btn lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            aria-label="Next image"
          >
            ›
          </button>
        </>
      )}

      <div
        className="lightbox-stage"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lightbox-image-wrap">
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
            className="lightbox-image"
            priority
          />
        </div>

        <div className="lightbox-meta">
          <span className="lightbox-counter">
            {index + 1} / {total}
          </span>
          {exif ? (
            <ul className="lightbox-exif">
              {exif.camera && <li>{exif.camera}</li>}
              {exif.focalLength != null && <li>{exif.focalLength}mm</li>}
              {exif.fNumber != null && <li>f/{exif.fNumber}</li>}
              {exif.exposureTime && <li>{exif.exposureTime}</li>}
              {exif.iso != null && <li>ISO {exif.iso}</li>}
              {date && <li>{date}</li>}
            </ul>
          ) : (
            <span className="lightbox-empty">No EXIF data</span>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
