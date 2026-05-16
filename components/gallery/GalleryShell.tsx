"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Lightbox, type LightboxItem } from "./Lightbox";
import { SectionNav } from "./SectionNav";

type GalleryCtx = {
  open: (src: string) => void;
};

const Ctx = createContext<GalleryCtx | null>(null);

export function useGalleryCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useGalleryCtx must be used inside <GalleryShell>");
  return ctx;
}

function collectPhotosFromDOM(): LightboxItem[] {
  if (typeof document === "undefined") return [];
  return Array.from(
    document.querySelectorAll<HTMLElement>("[data-photo-src]"),
  ).map((el) => {
    const metaJson = el.dataset.photoMeta;
    let meta: Partial<LightboxItem> = {};
    if (metaJson) {
      try {
        meta = JSON.parse(metaJson);
      } catch {}
    }
    return {
      src: el.dataset.photoSrc!,
      width: meta.width ?? 1200,
      height: meta.height ?? 900,
      blurDataURL: meta.blurDataURL,
      exif: meta.exif,
    } as LightboxItem;
  });
}

export function GalleryShell({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{
    photos: LightboxItem[];
    index: number;
  } | null>(null);

  const open = useCallback((src: string) => {
    const photos = collectPhotosFromDOM();
    const index = photos.findIndex((p) => p.src === src);
    if (index === -1) return;
    setState({ photos, index });
  }, []);

  const close = useCallback(() => setState(null), []);

  const go = useCallback((dir: 1 | -1) => {
    setState((cur) => {
      if (!cur) return cur;
      const next = (cur.index + dir + cur.photos.length) % cur.photos.length;
      return { ...cur, index: next };
    });
  }, []);

  const value = useMemo<GalleryCtx>(() => ({ open }), [open]);

  return (
    <Ctx.Provider value={value}>
      <div className="relative">
        <div className="mx-auto max-w-[720px]">{children}</div>
        <SectionNav />
      </div>
      {state && (
        <Lightbox
          item={state.photos[state.index]}
          index={state.index}
          total={state.photos.length}
          onClose={close}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
        />
      )}
    </Ctx.Provider>
  );
}
