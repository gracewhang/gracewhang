import { GalleryShell } from "@/components/gallery/GalleryShell";

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <GalleryShell>{children}</GalleryShell>;
}
