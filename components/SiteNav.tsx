"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/site.config";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-4 max-[640px]:justify-center">
      {siteConfig.nav.map((item) => {
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`border-b-[1.5px] px-0.5 py-1 text-[14.5px] font-medium transition-colors duration-[160ms] hover:border-accent hover:text-accent hover:no-underline ${
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-fg-soft"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
