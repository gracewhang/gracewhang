// Reads every file in public/images and emits content/image-data.json with
// dimensions, a tiny blur placeholder, and select EXIF fields for each image.
// Intentionally drops GPS coordinates so private location data does not ship.

import { readdir, readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import exifr from "exifr";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const imagesDir = join(root, "public", "images");
const outPath = join(root, "content", "image-data.json");

const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

function formatExposure(t) {
  if (!t) return undefined;
  if (t >= 1) return `${t}s`;
  const denom = Math.round(1 / t);
  return `1/${denom}s`;
}

function toIsoDate(d) {
  if (!d) return undefined;
  if (d instanceof Date && !isNaN(d.getTime())) return d.toISOString();
  return undefined;
}

async function walk(dir, base = "") {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      out.push(...(await walk(join(dir, entry.name), rel)));
    } else if (
      entry.isFile() &&
      SUPPORTED.has(extname(entry.name).toLowerCase())
    ) {
      out.push(rel);
    }
  }
  return out;
}

async function main() {
  const files = (await walk(imagesDir)).sort();

  const out = {};
  let i = 0;
  for (const file of files) {
    i += 1;
    const filePath = join(imagesDir, file);
    const buf = await readFile(filePath);
    let width;
    let height;
    let blurDataURL;
    try {
      const img = sharp(buf, { failOn: "none" }).rotate();
      const meta = await img.metadata();
      width = meta.width;
      height = meta.height;
      const blurBuf = await sharp(buf, { failOn: "none" })
        .rotate()
        .resize(16, null, { fit: "inside" })
        .jpeg({ quality: 60 })
        .toBuffer();
      blurDataURL = `data:image/jpeg;base64,${blurBuf.toString("base64")}`;
    } catch (err) {
      console.warn(`sharp failed for ${file}: ${err.message}`);
    }

    let exif;
    try {
      const data = await exifr.parse(buf, {
        tiff: true,
        ifd0: true,
        exif: true,
        gps: false,
        translateKeys: true,
        translateValues: true,
        reviveValues: true,
      });
      if (data) {
        const camera =
          [data.Make, data.Model].filter(Boolean).join(" ") || undefined;
        exif = {
          camera,
          lens: data.LensModel || data.LensMake || undefined,
          fNumber:
            typeof data.FNumber === "number"
              ? Number(data.FNumber.toFixed(1))
              : undefined,
          exposureTime: formatExposure(data.ExposureTime),
          iso: data.ISO || data.ISOSpeedRatings || undefined,
          focalLength:
            typeof data.FocalLength === "number"
              ? Math.round(data.FocalLength)
              : undefined,
          dateTaken:
            toIsoDate(data.DateTimeOriginal) || toIsoDate(data.CreateDate),
        };
        const hasAny = Object.values(exif).some((v) => v !== undefined);
        if (!hasAny) exif = undefined;
      }
    } catch {
      // EXIF parse failure is fine — many images have none
    }

    out[`/images/${file}`] = {
      width: width ?? null,
      height: height ?? null,
      blurDataURL: blurDataURL ?? null,
      exif: exif ?? null,
    };
    if (i % 10 === 0 || i === files.length) {
      console.log(`  ${i}/${files.length} ${file}`);
    }
  }

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote ${files.length} entries → ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
