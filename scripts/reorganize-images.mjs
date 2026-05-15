// One-shot migration: rename + move every referenced image into a clean
// category folder structure under public/images. Anything not in the rename
// map is removed. Safe to re-run (no-op if files already at new paths).

import { existsSync } from "node:fs";
import { rename, mkdir, readdir, unlink, rmdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const imagesDir = join(root, "public", "images");

// from → to (paths relative to public/images)
const moves = {
  // ── ART ─────────────────────────────────────────────
  "img1.jpg": "art/digital-collage-01.jpg",
  "img3.jpg": "art/digital-collage-02.jpg",
  "img4.jpg": "art/digital-collage-03.jpg",
  "img5.jpg": "art/digital-collage-04.jpg",
  "tote_bags.png": "art/canvas-tote-bags.png",
  "IMG_7113.jpg": "art/canvas-study.jpg",
  "2019_wire.jpg": "art/wire-sculpture.jpg",
  "wire_hand.jpg": "art/wire-hand.jpg",
  "clay.jpg": "art/clay.jpg",
  "scarf1.jpg": "art/scarf-01.jpg",
  "scarf2.jpg": "art/scarf-02.jpg",

  // ── PLANTS ──────────────────────────────────────────
  "2020_dragonfruit.png": "plants/2020-dragonfruit.png",
  "2020_hops.png": "plants/2020-hops.png",
  "2020_jacaranda.png": "plants/2020-jacaranda.png",
  "2020_okra.png": "plants/2020-okra.png",
  "2020_peppers.JPG": "plants/2020-peppers.jpg",
  "2020_poppy.jpg": "plants/2020-poppy.jpg",
  "2020_potato.png": "plants/2020-potato.png",
  "2020_succulent.png": "plants/2020-succulent.png",
  "2020_sunflower.png": "plants/2020-sunflower.png",
  "2020_tomato.png": "plants/2020-tomato.png",
  "2021_Dragonfruit.jpg": "plants/2021-dragonfruit.jpg",
  "2021_Dragonfruitflower.jpg": "plants/2021-dragonfruit-flower.jpg",
  "2021_Jacaranda.jpg": "plants/2021-jacaranda.jpg",

  // ── PLACES ──────────────────────────────────────────
  "2016Dec_Washington.jpg": "places/2016-12-snoqualmie.jpg",
  "2017Sept_Amsterdam.JPG": "places/2017-09-amsterdam.jpg",
  "2017Sept_Copenhagen.jpg": "places/2017-09-copenhagen.jpg",
  "2018Aug_Chicago.jpg": "places/2018-08-chicago.jpg",
  "2018AugLund.jpg": "places/2018-08-lund.jpg",
  "2018Aug_NewYork.jpg": "places/2018-08-new-york.jpg",
  "2018Aug_Stockholm.jpg": "places/2018-08-stockholm-01.jpg",
  "2018AugStockholm2.jpg": "places/2018-08-stockholm-02.jpg",
  "2018Jun_Portland.jpg": "places/2018-06-portland.jpg",
  "2018Jul_Tahoe.jpg": "places/2018-07-lake-tahoe.jpg",
  "2018Sept_Copenhagen.jpg": "places/2018-09-copenhagen.jpg",
  "2019Jan_MarinaDelRey.jpg": "places/2019-01-marina-del-rey.jpg",
  "2019Jan_UCSD.jpg": "places/2019-01-la-jolla.jpg",
  "2019Jun_UCLA.jpg": "places/2019-05-ucla.jpg",
  "2019July_CulverCity.jpg": "places/2019-07-culver-city.jpg",
  "2019July_LakeColchuck.jpg": "places/2019-07-lake-colchuck.jpg",
  "2019July_MalibuLakeHike.jpg": "places/2019-07-malibu.jpg",
  "2019Nov_SantaMonica.jpg": "places/2019-11-santa-monica.jpg",
  "2019Sept_Beijing.jpg": "places/2019-09-beijing.jpg",
  "2019Sept_Seoul.jpg": "places/2019-09-seoul.jpg",
  "2020Apr_BorregoSprings.jpg": "places/2020-04-borrego-springs.jpg",
  "2020Jan_Berlin.jpg": "places/2020-01-berlin.jpg",
  "2020Jan_BigBasin.jpg": "places/2020-01-big-basin.jpg",
  "2020Jan_Geneva.jpg": "places/2020-01-geneva.jpg",
  "2020Jan_SantaCruz.jpg": "places/2020-01-santa-cruz.jpg",
  "Dec2020_idyllwild.png": "places/2020-12-idyllwild.png",
  "Nov2020_topanga.png": "places/2020-11-topanga.png",
  "Ojai.jpg": "places/2021-04-ojai.jpg",
  "Jtree.JPG": "places/2021-05-joshua-tree.jpg",
  "2021July_Kings_Canyon.JPG": "places/2021-07-kings-canyon.jpg",
  "2021Aug_Boston.jpg": "places/2021-08-boston.jpg",
  "2021Aug_SF.jpg": "places/2021-08-san-francisco.jpg",
  "2021Nov_Angeles.jpg": "places/2021-11-angeles-national-forest.jpg",
  "2022_Feb_UCLA.jpg": "places/2022-02-ucla.jpg",
  "2022_March_Santa_Monica.jpg": "places/2022-03-santa-monica.jpg",
  "2022_April_Ojai.jpg": "places/2022-04-ojai.jpg",
  "2022_May_Hawaii.jpg": "places/2022-05-hawaii.jpg",
  "2022_May_Madison_Wisconsin.jpg": "places/2022-05-madison.jpg",
  "2022_July_VasquezRocks.jpg": "places/2022-07-vasquez-rocks.jpg",
  "2022_Aug_BlacksBeach.jpg": "places/2022-08-blacks-beach.jpg",
  "2022_Aug_Griffith_Park.jpg": "places/2022-08-griffith-park.jpg",
  "2022_Aug_Kenter_Trail.jpg": "places/2022-08-kenter-trail.jpg",
  "2022Aug_Malibu.jpg": "places/2022-08-malibu.jpg",
  "2022_Sept_Koln.jpg": "places/2022-09-koln.jpg",
  "2022_Sept_Los_Angeles.jpg": "places/2022-09-los-angeles.jpg",
  "2022_Sept_San_Francisco.jpg": "places/2022-09-san-francisco.jpg",
  "2022_Oct_Dusseldorf.jpg": "places/2022-10-dusseldorf.jpg",
  "2022_Oct_Zons.jpg": "places/2022-10-zons.jpg",
  "2022_Nov_Koln.jpg": "places/2022-11-koln.jpg",
  "2022_Nov_Madrid.jpg": "places/2022-11-madrid.jpg",
  "2022Nov_Stockholm.jpg": "places/2022-11-stockholm.jpg",
  "Dec2022_Amsterdam.jpg": "places/2022-12-amsterdam.jpg",
  "Jan2023_Muenster.jpg": "places/2023-01-muenster.jpg",
  "Feb2023_Chemnitz.jpg": "places/2023-02-chemnitz.jpg",
  "Feb2023_Prague.jpg": "places/2023-02-prague.jpg",
  "2023Feb_Koln.jpg": "places/2023-02-koln.jpg",
  "2023_March_Genoa.jpg": "places/2023-03-genoa.jpg",
  "2023_March_Venice.jpg": "places/2023-03-venice.jpg",
  "2023_May_Paris.jpg": "places/2023-05-paris.jpg",
  "2023_May_Mont_Saint_Michel.jpg": "places/2023-05-mont-saint-michel.jpg",
  "2023_May_Muenster.jpg": "places/2023-05-muenster.jpg",
  "2023_May_Frankfurt.jpg": "places/2023-05-frankfurt.jpg",
  "2023_June_Austria_Kleinwalsertal.jpg": "places/2023-06-kleinwalsertal.jpg",
  "2023_June_Neuschwanstein.jpg": "places/2023-06-neuschwanstein.jpg",
  "2023_June_Muenster_Spargel.jpg": "places/2023-06-muenster-spargel.jpg",
  "2023_June_Berlin.jpg": "places/2023-06-berlin.jpg",
  "2023_July_Den_Hague_Netherlands.jpg": "places/2023-07-den-haag.jpg",
  "2023_July_Rotterdam_Netherlands.jpg": "places/2023-07-rotterdam.jpg",
  "2023_Aug_Wadden_Sea.jpg": "places/2023-08-wadden-sea.jpg",
  "2023_Aug_Hamburg.jpg": "places/2023-08-hamburg.jpg",
  "2023_Aug_Berlin.jpg": "places/2023-08-berlin.jpg",
  "2023_Aug_Leipzig_Voelkerschlachtdenkmal.jpg": "places/2023-08-leipzig.jpg",
  "2023_Aug_Meeder.jpg": "places/2023-08-meeder.jpg",
  "2023_Aug_Goldkronach.jpg": "places/2023-08-goldkronach.jpg",
  "2023_Aug_Heidelberg.jpg": "places/2023-08-heidelberg.jpg",
  "2023_Aug_Marienthal.jpg": "places/2023-08-marienthal.jpg",
  "2023_Aug_Muenster.jpg": "places/2023-08-muenster.jpg",
  "2023_Sept_Oslo_Norway.jpg": "places/2023-09-oslo.jpg",
  "2023_Sept_Tromsoe_Norway.jpg": "places/2023-09-tromso.jpg",
  "2023_Oct_Berlin.jpg": "places/2023-10-berlin.jpg",
  "2023_Oct_Bremen.jpg": "places/2023-10-bremen.jpg",
  "2023_Oct_Muenster.jpg": "places/2023-10-muenster.jpg",
};

async function main() {
  // Ensure target dirs exist
  for (const dir of ["art", "places", "plants"]) {
    await mkdir(join(imagesDir, dir), { recursive: true });
  }

  const keep = new Set(Object.values(moves)); // target paths relative to imagesDir
  const sources = new Set(Object.keys(moves));

  // Move files
  let moved = 0;
  for (const [from, to] of Object.entries(moves)) {
    const fromAbs = join(imagesDir, from);
    const toAbs = join(imagesDir, to);
    if (!existsSync(fromAbs)) {
      if (existsSync(toAbs)) continue; // already migrated
      console.warn(`missing source: ${from}`);
      continue;
    }
    await rename(fromAbs, toAbs);
    moved++;
  }
  console.log(`moved ${moved} files`);

  // Delete leftover top-level files that aren't kept
  const topEntries = await readdir(imagesDir, { withFileTypes: true });
  let removed = 0;
  for (const entry of topEntries) {
    if (entry.isDirectory()) continue;
    if (sources.has(entry.name)) continue; // shouldn't happen post-rename
    await unlink(join(imagesDir, entry.name));
    removed++;
  }
  console.log(`removed ${removed} unused top-level files`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
