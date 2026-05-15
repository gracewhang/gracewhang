import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/content/site.config";
import { getImageMeta } from "@/lib/image-data";

const HERO_SRC = "/images/art/digital-collage-01.jpg";

export default function HomePage() {
  const meta = getImageMeta(HERO_SRC);
  const width = meta?.width ?? 4000;
  const height = meta?.height ?? 2400;
  const blur = meta?.blurDataURL ?? undefined;

  return (
    <div className="home">
      <figure className="hero">
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
        <figcaption className="hero-caption">
          <span className="hero-caption-eyebrow">No. 01</span>
          <span className="hero-caption-text">
            Raspberries, after the rain.
          </span>
        </figcaption>
      </figure>

      <nav className="home-nav" aria-label="Sections">
        {siteConfig.nav.map((item, i) => (
          <Link key={item.href} href={item.href} className="home-nav-item">
            <span className="home-nav-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="home-nav-label">{item.label}</span>
            <span className="home-nav-arrow" aria-hidden="true">
              →
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
