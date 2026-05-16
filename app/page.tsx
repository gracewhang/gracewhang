import Image from "next/image";
import { getImageMeta } from "@/lib/image-data";

const HERO_SRC = "/images/art/digital-collage-01.jpg";

export default function HomePage() {
  const meta = getImageMeta(HERO_SRC);
  const width = meta?.width ?? 4000;
  const height = meta?.height ?? 2400;
  const blur = meta?.blurDataURL ?? undefined;

  return (
    <div className="flex flex-col gap-14">
      <figure className="relative m-0 overflow-hidden rounded-[18px] bg-bg-elev shadow-[0_1px_0_var(--border),0_30px_60px_-30px_rgba(0,0,0,0.18)]">
        <Image
          src={HERO_SRC}
          alt="Raspberries falling past a rocky peak — digital collage"
          width={width}
          height={height}
          placeholder={blur ? "blur" : "empty"}
          blurDataURL={blur}
          sizes="(max-width: 900px) 100vw, 900px"
          priority
        />
      </figure>
    </div>
  );
}
