"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { id: string; label: string };

export function SectionNav() {
  const pathname = usePathname();
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-section]"),
    );
    const list: Item[] = els.map((el) => ({
      id: el.id,
      label: el.dataset.sectionLabel || el.id,
    }));
    setItems(list);
    setActiveId(list[0]?.id ?? null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  if (items.length < 2) return null;

  return (
    <aside
      aria-label="Sections"
      className="group fixed top-1/2 z-20 -translate-y-1/2 right-[max(16px,calc((100vw-880px)/2-130px))] max-[1100px]:right-4 max-[980px]:hidden"
    >
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {items.map((s) => {
          const isActive = s.id === activeId;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  const target = document.getElementById(s.id);
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    history.replaceState(null, "", `#${s.id}`);
                  }
                }}
                className={`inline-flex cursor-pointer items-center gap-[10px] py-1.5 text-xs tracking-[0.06em] hover:no-underline ${isActive ? "text-accent" : "text-muted hover:text-fg"}`}
              >
                <span
                  aria-hidden="true"
                  className={`inline-block h-px bg-current transition-[width,opacity] duration-[160ms] ${isActive ? "w-7 opacity-100" : "w-[18px] opacity-50"}`}
                />
                <span
                  className={`whitespace-nowrap transition-[opacity,transform] duration-[160ms] max-[1100px]:group-hover:inline ${isActive ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 max-[1100px]:hidden"}`}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
