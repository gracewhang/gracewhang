import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/content/site.config";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NoFlashTheme } from "@/components/NoFlashTheme";
import { SiteNav } from "@/components/SiteNav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

const pageContainer = "mx-auto w-full max-w-3xl px-5";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <NoFlashTheme />
      </head>
      <body>
        <header className="mb-12 border-b border-border pt-7 pb-[22px]">
          <div
            className={`${pageContainer} flex flex-wrap items-center gap-5 max-[640px]:flex-col max-[640px]:text-center`}
          >
            <Link href="/" className="block size-16 shrink-0" aria-label="Home">
              <Image
                src={siteConfig.avatar}
                alt={`${siteConfig.name} avatar`}
                width={160}
                height={160}
                priority
                className="size-16 rounded-full border border-border object-cover"
              />
            </Link>
            <div className="min-w-[200px] flex-1">
              <h1 className="m-0 text-[22px] font-semibold tracking-tight">
                <Link
                  href="/"
                  className="text-fg transition-colors duration-[160ms] hover:text-accent hover:no-underline"
                >
                  {siteConfig.name}
                </Link>
              </h1>
              {siteConfig.description && (
                <p className="m-0 mt-0.5 text-sm text-muted">
                  {siteConfig.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-[18px] max-[640px]:w-full max-[640px]:justify-center">
              <SiteNav />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className={`${pageContainer} min-h-[50vh] pb-24`}>
          {children}
        </main>
        <footer className="border-t border-border py-6 text-center text-[13px] text-muted">
          <div className={pageContainer}>
            <span>
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
