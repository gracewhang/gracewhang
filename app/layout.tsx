import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/content/site.config";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NoFlashTheme } from "@/components/NoFlashTheme";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

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
        <header className="masthead">
          <div className="container masthead-inner">
            <Link href="/" className="avatar" aria-label="Home">
              <Image
                src={siteConfig.avatar}
                alt={`${siteConfig.name} avatar`}
                width={160}
                height={160}
                priority
              />
            </Link>
            <div className="site-info">
              <h1 className="site-name">
                <Link href="/">{siteConfig.name}</Link>
              </h1>
              <p className="site-description">{siteConfig.description}</p>
            </div>
            <div className="masthead-tools">
              <nav className="site-nav">
                {siteConfig.nav.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="container main">{children}</main>
        <footer className="site-footer">
          <div className="container">
            <span>
              © {new Date().getFullYear()} {siteConfig.name}
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
