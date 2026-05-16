import type { ReactNode } from "react";

export function Section({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-section=""
      data-section-label={label}
      className="mb-16 scroll-mt-5"
    >
      <h2>{label}</h2>
      <div className="flex flex-col gap-7">{children}</div>
    </section>
  );
}
