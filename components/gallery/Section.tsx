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
      className="photo-section"
    >
      <h2>{label}</h2>
      <div className="photo-column">{children}</div>
    </section>
  );
}
