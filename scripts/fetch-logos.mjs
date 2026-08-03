// Downloads the partner brand marks used by the business-partner carousel into
// /public/media/logos.
//
// Source is Wikimedia Commons, asked for a rendered PNG rather than the SVG
// (`Special:FilePath/<file>?width=`). Rendering server-side sidesteps the SVGs
// that reference external fonts or filters and would otherwise land wrong.
//
// Every file below was downloaded and LOOKED AT before being committed. Commons
// titles are not self-describing: searching "Ruckus Networks" returns a photo of
// their head office, and Simple Icons' `amp` is Google AMP, not the cabling
// brand. If you add or change an entry, download it and open it before you
// commit, and keep `LOGOS` in sync with `partnerLogos` in src/lib/site.ts.
//
// Brands with no usable Commons file fall back to a typographic wordmark in the
// carousel — see `partnerLogos`. Preferred fix is the logo pack the principal
// issues to authorised partners; drop it in /public/media/logos and add a line.
//
// Run with: node scripts/fetch-logos.mjs
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const OUT = new URL("../public/media/logos/", import.meta.url);
const UA = "hpe-solutions-site-build/1.0 (+https://hpe.com.my) node-fetch";
const WIDTH = 400;

/** @type {[commonsFile: string, file: string, subject: string][]} */
const LOGOS = [
  ["Cisco logo blue 2016.svg", "cisco.png", "Cisco bridge mark, 2016 blue"],
  ["Huawei wordmark 2019.svg", "huawei.png", "Huawei wordmark"],
  ["Fortinet logo.svg", "fortinet.png", "Fortinet wordmark, red"],
  ["Veeam logo.svg", "veeam.png", "Veeam wordmark, green"],
  ["Sophos logo.svg", "sophos.png", "Sophos wordmark, blue"],
  ["Avaya Logo.svg", "avaya.png", "Avaya wordmark, red"],
  ["Aruba Networks logo.svg", "aruba.png", "Aruba Networks wordmark"],
  ["Riverbed logo.svg", "riverbed.png", "Riverbed wordmark"],
  [
    "Hewlett Packard Enterprise logo.svg",
    "hp-enterprise.png",
    "HPE green rectangle mark",
  ],
  ["Telekom Malaysia logo (2023).svg", "tm.png", "Telekom Malaysia 2023 mark"],
  ["Microsoft logo.svg", "microsoft.png", "Microsoft four-square + wordmark"],
];

async function download(commonsFile, name) {
  const target = new URL(name, OUT);
  try {
    const s = await stat(target);
    if (s.size > 1_000) return `skip  ${name}`;
  } catch {}

  const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
    commonsFile,
  )}?width=${WIDTH}`;

  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "image/png,image/*" },
  });
  if (!res.ok) throw new Error(`${res.status} ${name} <- ${commonsFile}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(target));

  const { size } = await stat(target);
  return `ok    ${name} (${Math.round(size / 1024)} KB)`;
}

await mkdir(OUT, { recursive: true });

// Serial with a pause: Commons rate-limits parallel bursts from one address.
let failed = 0;
for (const [commonsFile, name] of LOGOS) {
  try {
    console.log(await download(commonsFile, name));
  } catch (e) {
    failed++;
    console.error(`FAIL  ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 800));
}
process.exit(failed ? 1 : 0);
