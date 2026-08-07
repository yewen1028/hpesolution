// Downloads the partner brand marks used by the business-partner carousel into
// /public/media/logos.
//
// SOURCE IS hpe.com.my ITSELF. These are the seventeen files the live site
// serves on /business-partner, so the carousel shows exactly the marks the
// company already publishes for itself — same brands, same artwork, same
// treatment. That is the whole point, and it is why this no longer pulls from
// Wikimedia Commons: Commons had nothing usable for AMP or Cyberoam (its `amp`
// is Google AMP, and searching "Ruckus Networks" returns a photo of their head
// office), so those two rendered as typographic wordmarks while everything else
// had artwork. All seventeen have artwork now.
//
// EVERY LOGO IS THE FULL LOCKUP. This script briefly also derived `-mark.png`
// crops — the symbol cut away from the wordmark — for the five brands whose
// lockup is too wide to read in a small box. That is deleted, and should not
// come back. The fix for artwork that does not fit is a frame that fits the
// artwork, which is what `partner-carousel.tsx` now has; cropping instead meant
// the site was editing seventeen other companies' trademarks to suit its own
// layout, and doing it with a geometric split that cannot tell a symbol from a
// letter. It cut Ruckus' logo through the "R" and produced a file that looked
// entirely plausible.
//
// Every file below was downloaded and LOOKED AT before being committed. Keep
// that habit: these ids are not self-describing.
//
// Run with: node scripts/fetch-logos.mjs
import { mkdir, stat, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const OUT = new URL("../public/media/logos/", import.meta.url);
const BASE = "https://hpe.com.my/wp-content/uploads/2021/02/";
const UA = "hpe-solutions-site-build/1.0 (+https://hpe.com.my) node-fetch";

/**
 * @type {[remote: string, file: string, subject: string][]}
 * `remote` is the slug in `HPE-BusinessPartners-lg-<remote>.png`, whose casing
 * is the live site's and is not derivable from the brand name.
 */
const LOGOS = [
  ["AMP", "amp.png", "AMP NETCONNECT wordmark in a blue ellipse"],
  ["aruba", "aruba.png", "aruba wordmark, orange"],
  ["AVAYA", "avaya.png", "AVAYA wordmark, red"],
  ["CISCO", "cisco.png", "Cisco bridge bars over the CISCO wordmark"],
  ["Cyberoam", "cyberoam.png", "Cyberoam fan over the wordmark"],
  ["DINTEK", "dintek.png", "DINTEK globe badge beside the wordmark"],
  ["FORTINET", "fortinet.png", "FORTINET wordmark, red block in the O"],
  ["HPEnterprise", "hp-enterprise.png", "HPE green rectangle over the wordmark"],
  ["HUAWEI", "huawei.png", "Huawei red fan over the wordmark"],
  ["Microsoft", "microsoft.png", "Microsoft four-square beside the wordmark"],
  ["peplink", "peplink.png", "peplink wordmark under orange dots"],
  ["riverbed", "riverbed.png", "riverbed wordmark over 'Think fast.'"],
  ["Ruckus", "ruckus.png", "Ruckus dog beside the wordmark"],
  ["SANGFOR", "sangfor.png", "SANGFOR globe beside the wordmark"],
  ["SOPHOS", "sophos.png", "SOPHOS wordmark, blue"],
  ["TM", "tm.png", "Telekom Malaysia TM mark with the orange swoosh"],
  ["veeam", "veeam.png", "veeam wordmark, green"],
];

const path = (url) => fileURLToPath(url);

/** Fetches the untouched 600x300 original. */
async function download(remote, name) {
  const url = `${BASE}HPE-BusinessPartners-lg-${remote}.png`;
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "image/png,image/*" },
  });
  if (!res.ok) throw new Error(`${res.status} ${name} <- ${url}`);

  const raw = Buffer.from(await res.arrayBuffer());
  const { hasAlpha } = await sharp(raw).metadata();
  return hasAlpha ? raw : keyOutWhite(raw);
}

/** Writes the logo. */
async function writeLockup(raw, name) {
  const target = new URL(name, OUT);

  /*
   * Trimmed to its ink on the way in, and this is what makes the strip read
   * evenly.
   *
   * All seventeen arrive as 600x300 with their own internal padding, and the
   * padding is not consistent — Fortinet's wordmark fills most of its canvas
   * while Microsoft's lockup floats in the middle of its own. Dropped into one
   * box under `object-contain`, the padding is what gets fitted and the logo
   * lands at whatever size is left over, so the marks come out at visibly
   * different optical weights. Trimming means the box fits the artwork, which
   * is what lets one frame hold everything from Huawei's square lockup to
   * Fortinet's 8.5:1 wordmark at a comparable weight.
   */
  const trimmed = await sharp(raw).ensureAlpha().trim({ threshold: 12 }).toBuffer();
  await writeFile(path(target), trimmed);

  const { size } = await stat(target);
  return Math.round(size / 1024);
}

/**
 * Knocks a flat white background out to transparency.
 *
 * Sixteen of the seventeen arrive as RGBA on transparency; **Cyberoam's file
 * has no alpha channel at all** and is drawn on opaque white. Left alone it
 * paints a white rectangle wherever the surface under it is not also white —
 * which is every dark-theme surface on the site — so it is the one logo whose
 * bounding box would be visible. Trimming does not help: trimming crops the
 * canvas, and what is left is still opaque.
 *
 * Only the flat field goes. The threshold is high enough that the wordmark's
 * antialiased edges keep their coverage, so the type does not come back thin
 * and ragged; the cost is that white *inside* a mark would go too, which none
 * of these have.
 */
async function keyOutWhite(raw) {
  const { data, info } = await sharp(raw)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += info.channels) {
    if (data[i] > 244 && data[i + 1] > 244 && data[i + 2] > 244) {
      data[i + 3] = 0;
    }
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: info.channels },
  })
    .png()
    .toBuffer();
}

await mkdir(OUT, { recursive: true });

let failed = 0;
for (const [remote, name] of LOGOS) {
  try {
    const raw = await download(remote, name);
    const kb = await writeLockup(raw, name);
    console.log(`ok    ${name} (${kb} KB)`);
  } catch (e) {
    failed++;
    console.error(`FAIL  ${e.message}`);
  }
  await new Promise((r) => setTimeout(r, 250));
}
process.exit(failed ? 1 : 0);
