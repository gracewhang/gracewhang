import data from "@/content/image-data.json" assert { type: "json" };

export type Exif = {
  camera?: string | null;
  lens?: string | null;
  fNumber?: number | null;
  exposureTime?: string | null;
  iso?: number | null;
  focalLength?: number | null;
  dateTaken?: string | null;
};

export type ImageMeta = {
  width: number | null;
  height: number | null;
  blurDataURL: string | null;
  exif: Exif | null;
};

export const imageData = data as Record<string, ImageMeta>;

export function getImageMeta(src: string): ImageMeta | undefined {
  return imageData[src];
}
