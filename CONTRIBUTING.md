# gracewhang.com

Personal site — Next.js (App Router) + MDX for content. Each gallery page is
just an `.mdx` file you edit by hand. The site auto-extracts EXIF and generates
blur placeholders for every image.

---

## TL;DR for adding an image

1. Drop the image into the right folder under `public/images/`:
   - Places → `public/images/places/YYYY-MM-name.jpg`
   - Plants → `public/images/plants/YEAR-name.jpg`
   - Art → `public/images/art/category-name.jpg`
2. Add one line to the matching MDX page (`app/(gallery)/places/page.mdx`,
   `…/plants/page.mdx`, `…/art/page.mdx`):
   ```mdx
   <Photo src="/images/places/2026-04-lisbon.jpg" />
   ```
3. Run `pnpm dev` (or `pnpm build`). The image pipeline reruns automatically.

That's it. EXIF, dimensions, and blur placeholders are picked up for you.

---

## Local setup

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build        # production build
pnpm start        # serve the production build
```

`pnpm dev` and `pnpm build` both run `scripts/build-image-data.mjs` first
(see [Image pipeline](#image-pipeline) below).

---

## Project layout

```
app/
  layout.tsx              Root layout — header, theme toggle, footer.
  page.tsx                Home page — hero + nav links.
  icon.svg                Tomato favicon.
  globals.css             All site styles.
  (gallery)/              Route group: every page inside shares the gallery shell.
    layout.tsx            Wraps each gallery page with <GalleryShell>.
    art/page.mdx          ←— You edit these.
    places/page.mdx
    plants/page.mdx

components/
  gallery/
    GalleryShell.tsx      Context + lightbox state.
    Section.tsx           Heading + container for a group of photos.
    Photo.tsx             Server wrapper that looks up image metadata.
    PhotoClient.tsx       Client button that opens the lightbox.
    SectionNav.tsx        Sticky right-rail year/section picker.
    Lightbox.tsx          Fullscreen modal with EXIF panel.
  NoFlashTheme.tsx        Inline script — no theme flash on load.
  ThemeToggle.tsx         Sun/moon toggle in the header.

content/
  site.config.ts          Site name, description, nav, avatar URL.
  image-data.json         Auto-generated (see below). Don't edit.

lib/
  image-data.ts           Typed accessor for image-data.json.

public/images/            Source images (see naming convention below).
  art/
  places/
  plants/

scripts/
  build-image-data.mjs    Walks public/images/, extracts EXIF + dimensions,
                          generates blur placeholders. Runs as predev/prebuild.
  reorganize-images.mjs   One-shot migration; not needed for ongoing edits.
```

---

## Image naming convention

Keep filenames lowercase, kebab-case, and hint at the content.

| Folder              | Pattern                            | Example                             |
| ------------------- | ---------------------------------- | ----------------------------------- |
| `public/images/places/` | `YYYY-MM-place-name.jpg`        | `2026-04-lisbon.jpg`                |
| `public/images/plants/` | `YYYY-plant-name.jpg`           | `2026-tomato.jpg`                   |
| `public/images/art/`    | `category-name-NN.jpg`          | `digital-collage-05.jpg`            |

Why this matters:
- Photos in `places` are listed chronologically — the date prefix makes the
  newest-first order obvious.
- Subfolders keep the asset directory navigable as the collection grows.
- Lowercase + kebab-case avoids the `.JPG`/`.jpg`/space-in-name issues we had
  porting from the old Jekyll site.

If you have multiple photos from the same place in the same month, append
`-01`, `-02`, etc. (e.g. `2026-04-lisbon-01.jpg`, `2026-04-lisbon-02.jpg`).

---

## Adding a photo to an existing section

Each gallery page is plain MDX. To add a photo to `Places → 2023+`:

1. Save your image to `public/images/places/2026-05-porto.jpg`.
2. Open `app/(gallery)/places/page.mdx` and add a line inside the matching
   `<Section>`:

   ```mdx
   <Section id="y2023" label="2023+">
     <Photo src="/images/places/2026-05-porto.jpg" />
     <Photo src="/images/places/2023-01-muenster.jpg" />
     ...
   </Section>
   ```

3. Save. The image pipeline picks up the new file on the next `pnpm dev` /
   `pnpm build`.

> **Order = display order.** Photos render in the order they appear in MDX.

### With a caption

`<Photo>` accepts an optional `caption` prop. It renders as a small italic
overlay at the bottom of the image (with a subtle dark gradient for legibility).
The caption is **not** shown in the expanded lightbox view.

```mdx
<Photo
  src="/images/places/2026-05-porto.jpg"
  caption="Porto, Portugal — May 2026"
/>
```

Convention used in this repo:
- Places → `"City, Country — Month Year"` (em-dash, not hyphen).
- Plants → just the plant name (e.g. `"California poppies"`).
- Art → no captions.

---

## Adding a new section (e.g. a new year)

Open the relevant MDX file and add a `<Section>` block. The right-rail nav
picks it up automatically — no other changes needed.

```mdx
<Section id="y2026" label="2026">
  <Photo src="/images/places/2026-01-tokyo.jpg" />
  <Photo src="/images/places/2026-02-kyoto.jpg" />
</Section>
```

Rules:
- `id` must be unique within the page and URL-safe (we prefix years with `y`
  because CSS selectors don't love leading digits — `id="y2026"`).
- `label` is what shows up in the right-rail picker.
- Sections render in document order.

---

## Adding a new top-level page (e.g. /writing)

1. Create `app/(gallery)/writing/page.mdx`:

   ```mdx
   export const metadata = { title: "Writing" };

   # Writing

   <Section id="essays" label="Essays">
     <Photo src="/images/art/canvas-study.jpg" />
   </Section>
   ```

2. Add a nav entry in `content/site.config.ts`:

   ```ts
   nav: [
     { label: "Art", href: "/art" },
     { label: "Places", href: "/places" },
     { label: "Plants", href: "/plants" },
     { label: "Writing", href: "/writing" }, // ← new
   ],
   ```

3. Done. The header nav, home-page list, and section nav all derive from the
   same config.

If the new page **shouldn't** show the gallery shell (lightbox, right-rail nav),
put it under `app/` directly instead of `app/(gallery)/`:

```
app/
  writing/
    page.mdx     ← rendered without the gallery shell
```

---

## Image pipeline

`scripts/build-image-data.mjs`:

- Walks every file under `public/images/`.
- For each image, writes an entry to `content/image-data.json`:
  - `width`, `height` — pulled with [sharp](https://sharp.pixelplumbing.com/).
  - `blurDataURL` — a 16px-wide JPEG, base64-encoded, used by `next/image` as a
    blur placeholder while the full image loads.
  - `exif` — camera, lens, focal length, aperture, shutter, ISO, date taken
    (via [exifr](https://github.com/MikeKovarik/exifr)).
- **GPS coordinates are intentionally stripped** — see the `gps: false` option
  in the script. If you want them shown in the lightbox, change that and add a
  GPS field to the `Exif` type in `lib/image-data.ts` + the lightbox display.

The script runs automatically before `dev` and `build` (via the `predev` and
`prebuild` npm hooks). Run it by hand any time with:

```bash
pnpm build:images
```

It's idempotent — safe to rerun. If an image fails to parse (corrupt file, etc.)
it's logged and skipped; the corresponding `<Photo>` will render nothing.

---

## How `<Photo>` and the lightbox work

- `<Photo src="…">` is a **server** component (`components/gallery/Photo.tsx`).
  It looks up the image in `content/image-data.json` and forwards width,
  height, blur placeholder, and EXIF to `<PhotoClient>`.
- `<PhotoClient>` is a **client** component. It renders `next/image` and stores
  the metadata as a `data-photo-meta` JSON blob on the button so the lightbox
  can read it back without re-fetching.
- Clicking a photo asks `GalleryShell` to open the lightbox.
- `GalleryShell` scans the DOM for every `[data-photo-src]` at open time, so
  prev/next buttons step through every photo on the page (regardless of which
  section they're in).
- Keyboard shortcuts in the lightbox:
  - `←` / `→` — previous / next
  - `Esc` — close

---

## Customising the site

| Change                          | Where                                              |
| ------------------------------- | -------------------------------------------------- |
| Name, tagline, nav, avatar URL  | `content/site.config.ts`                           |
| Hero image on the home page     | `HERO_SRC` in `app/page.tsx`                       |
| Hero caption                    | The `<figcaption>` block in `app/page.tsx`         |
| Theme palette                   | CSS vars at the top of `app/globals.css`           |
| Favicon                         | `app/icon.svg` (pixel-art SVG)                     |
| What EXIF fields appear         | `components/gallery/Lightbox.tsx`                  |

---

## Common pitfalls

- **Image not showing up?** Check that the path in `<Photo src="…">` starts
  with `/images/` and matches the file on disk exactly (case-sensitive).
- **HEIC files masquerading as `.jpg`?** Apple devices sometimes export HEIC
  with a `.jpg` extension. The build pipeline can't read these in browsers.
  Convert with `sips -s format jpeg input.jpg --out output.jpg` before adding.
- **Right-rail nav not appearing?** It only shows when there are at least two
  `<Section>` blocks on the page.
- **EXIF missing in the lightbox?** Either the file genuinely has no EXIF
  (digital art, screenshots) or it was stripped before upload. The lightbox
  will show "No EXIF data" — this is expected, not a bug.
- **Stale image after replacing a file?** Delete `.next/cache/images/` and
  restart the dev server.
