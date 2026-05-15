"use client";

import { useEffect, useState } from "react";

type Item = { id: string; label: string };

export function SectionNav() {
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
    if (list.length > 0) setActiveId(list[0].id);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActiveId((visible[0].target as HTMLElement).id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (items.length < 2) return null;

  return (
    <aside className="section-nav" aria-label="Sections">
      <ul>
        {items.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className={s.id === activeId ? "is-active" : ""}
              onClick={(e) => {
                const target = document.getElementById(s.id);
                if (target) {
                  e.preventDefault();
                  target.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${s.id}`);
                }
              }}
            >
              <span className="dot" aria-hidden="true" />
              <span className="label">{s.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
