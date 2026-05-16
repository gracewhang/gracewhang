# CLAUDE.md

Context for AI agents working on this repo. Read this before making changes.

## What this is

Grace Whang's personal site. Next.js 15 (App Router) + MDX content pages.
Three galleries — Art, Places, Plants — each is a single `.mdx` file the
owner edits by hand. See `README.md` for the user-facing maintenance guide.

## Stack

- Next.js 15.5 (App Router, React Server Components)
- React 19
- TypeScript (strict)
- MDX via `@next/mdx` — page files use `.mdx`, components injected through
  `mdx-components.tsx`
- Build-time image pipeline: `sharp` (dimensions + blur placeholders) +
  `exifr` (EXIF extraction)
- Package manager: **pnpm** (per `packageManager` field). Don't use npm/yarn.
- No CSS framework — plain CSS with CSS variables in `app/globals.css`

## Commands

```bash
pnpm install              # install deps
pnpm dev                  # http://localhost:3000 (runs image pipeline first)
pnpm build                # production build (runs image pipeline first)
pnpm start                # serve production build
pnpm build:images         # regenerate content/image-data.json by hand
```

`dev` and `build` chain `build:images` directly (`pnpm run build:images && next …`)
rather than relying on `pre*` lifecycle hooks — pnpm disables those by default
(`enable-pre-post-scripts=false`), so the chained form is what actually guarantees
fresh metadata.

## File layout (what matters)

```
app/
  layout.tsx              Root layout, header, theme toggle, footer
  page.tsx                Home (hero image only, no copy)
  icon.svg                Pixel-art tomato favicon
  globals.css             All site styles (no Tailwind, no CSS modules)
  (gallery)/              Route group — pages here share the gallery shell
    layout.tsx              Wraps children with <GalleryShell>
    art/page.mdx
    places/page.mdx
    plants/page.mdx

components/
  gallery/
    GalleryShell.tsx      Client. React Context, opens/closes lightbox,
                          scans DOM for [data-photo-src] to build the
                          prev/next list when a photo is clicked.
    Section.tsx           Server. <section id=… data-section data-section-label=…>
    Photo.tsx             Server. Looks up image meta from image-data.json,
                          forwards everything to PhotoClient.
    PhotoClient.tsx       Client. Button + next/image + optional caption overlay.
                          Encodes width/height/blurDataURL/exif as JSON in
                          data-photo-meta so the lightbox can read it back.
    SectionNav.tsx        Client. Sticky right rail. IntersectionObserver
                          scrollspy on [data-section]. Hidden ≤720px.
    Lightbox.tsx          Client portal. Fullscreen modal with EXIF strip.
                          Reads metadata from data-photo-meta in the DOM.
  NoFlashTheme.tsx        Inline script in <head>; resolves theme pre-paint.
  ThemeToggle.tsx         Client. Toggles data-theme on <html>.

content/
  site.config.ts          Name, description, avatar, nav (single source of truth).
  image-data.json         Auto-generated. Do not edit by hand.

lib/
  image-data.ts           Typed loader for image-data.json.

mdx-components.tsx        Exposes <Photo> and <Section> globally to MDX.

public/images/
  art/   places/   plants/   ← organized by gallery, kebab-case names.

scripts/
  build-image-data.mjs    Walks public/images recursively, runs sharp + exifr.
  reorganize-images.mjs   One-shot migration script; do not rerun.
```

## How a gallery page renders

1. MDX file → wrapped by `app/(gallery)/layout.tsx` → `<GalleryShell>`.
2. `<Photo src="…">` (server) reads `image-data.json` and forwards to
   `<PhotoClient>` (client).
3. `<PhotoClient>` renders a `<button>` containing `next/image` and (optionally)
   a `<span class="photo-caption">` overlay. The image's full metadata
   (width/height/blurDataURL/exif) is serialized into `data-photo-meta`.
4. Click → `useGalleryCtx().open(src)` → `GalleryShell` does
   `document.querySelectorAll("[data-photo-src]")` to build the photo list in
   DOM order, finds the index of the clicked src, and mounts `<Lightbox>`.
5. `<Lightbox>` renders into `document.body` via a portal. It reads the meta
   payload off the clicked button — captions are intentionally not in the
   payload, so they don't show in the lightbox.
6. Prev/Next/Esc shortcuts and on-screen buttons cycle through the list.

## Conventions

### Images

- Live under `public/images/{art|places|plants}/`.
- Lowercase, kebab-case, no spaces.
- Places use date prefix: `YYYY-MM-place.jpg`.
- Plants use year prefix: `YYYY-plant.jpg`.
- Art uses category prefix: `digital-collage-01.jpg`, `canvas-…`, `wire-…`.
- Duplicate scenes in the same month: append `-01`, `-02`.

### Captions

`<Photo>` takes an optional `caption` prop. It renders as a small italic
overlay at the bottom of the image. The caption is **not** shown in the
lightbox — by design (see `data-photo-meta` note under Gotchas).

```mdx
<Photo src="/images/places/2026-05-porto.jpg" caption="Porto, Portugal — May 2026" />
```

Match the existing format:
- Places → `"City, Country — Month Year"` (em-dash `—`, **not** a hyphen `-`).
- Plants → just the plant name (e.g. `"California poppies"`).
- Art → no captions at all.

For German-speaking cities the repo uses native forms with diacritics in
captions (`Köln`, `Münster`, `Nürnberg`, `Wien`) even though the filenames
are ASCII (`koln`, `muenster`, `nurnberg`, `wien`). USA places use `"…, USA"`
not the state name in the 2024+ sections.

### Section IDs

CSS selectors choke on a leading digit, so year IDs are prefixed with `y`:
`id="y2023"`, `id="y2021-2022"`. Don't drop the prefix.

### TypeScript / React

- Client components are explicitly `"use client"`. Default everything to server.
- Don't add a `"use client"` to a file that doesn't need it (Photo.tsx is a
  server component on purpose — it reads image-data.json server-side so the
  JSON doesn't bloat the client bundle).
- No `any`. The existing types are intentional.

### Styles

- Everything in `app/globals.css`. No CSS modules, no inline `<style>` blocks,
  no Tailwind.
- Theme palette lives in `:root`/`[data-theme="dark"]` blocks — extend there
  rather than hard-coding colors.
- SVG icons inside circular buttons need `display: block` to center cleanly
  (font baselines shift text glyphs off-center; that's why `×` / `‹` / `›`
  were replaced with SVGs).

## Gotchas

- **HEIC masquerading as `.jpg`** — Apple exports HEIC with a `.jpg` extension
  sometimes. Sharp will fail and the image won't render in non-Safari browsers.
  Convert before adding: `sips -s format jpeg in.jpg --out out.jpg`. The
  pipeline logs which file failed and skips it.
- **Empty / corrupt images** — `build-image-data.mjs` logs a warning and
  emits null width/height; the corresponding `<Photo>` then renders nothing
  (Photo bails out early if meta is missing).
- **GPS is stripped on purpose** — `exifr` is called with `gps: false` to
  keep location data out of the public bundle. Don't re-enable this without
  asking the owner.
- **`curl -I` on `/_next/image`** returns 400. That's a Next.js Image quirk
  with HEAD requests, not a bug. Use GET in any smoke test.
- **Don't rerun `scripts/reorganize-images.mjs`** — it was a one-shot
  migration. The "from → to" map is now out of date.
- **`data-photo-meta` is the lightbox protocol** — if you add a new field
  the lightbox should display, encode it in PhotoClient's `meta` JSON and
  decode it in `GalleryShell.collectPhotosFromDOM`. Captions are *not* in
  this payload by design.
- **Right-rail nav hides itself** if a page has fewer than two `<Section>`
  blocks (`SectionNav.tsx`: `if (items.length < 2) return null`).
- **Image cache** — if a file was replaced but Next.js keeps serving the old
  one, delete `.next/cache/images/`.

## When making changes

- Prefer editing existing files. The owner asked for a clean codebase.
- No new dependencies without a clear need.
- No comments explaining *what* the code does — only *why*, and only when
  non-obvious. The owner's CLAUDE.md rules apply (terse, no fluff).
- After non-trivial changes, run `pnpm build` to catch type errors before
  reporting done.
- UI changes: spin up `pnpm dev` and verify in a browser (or describe
  explicitly that you didn't).
- Don't commit `content/image-data.json` changes for renamed/added images
  without also updating the relevant `.mdx` paths — the file is regenerated
  but the MDX references are what tie it together.

## What lives where (quick lookup)

| Change                          | File                                          |
| ------------------------------- | --------------------------------------------- |
| Site name, tagline, nav, avatar | `content/site.config.ts`                      |
| Hero image                      | `HERO_SRC` in `app/page.tsx`                  |
| Theme colors                    | `:root` / `[data-theme="dark"]` in globals.css|
| Favicon                         | `app/icon.svg`                                |
| Which EXIF fields show          | `components/gallery/Lightbox.tsx`             |
| GPS toggle                      | `gps: false` in `scripts/build-image-data.mjs`|
| Caption styling                 | `.photo-caption*` in globals.css              |
| Photo bundle protocol           | `meta` JSON in `PhotoClient.tsx` + readers in `GalleryShell.tsx` / `Lightbox.tsx` |
