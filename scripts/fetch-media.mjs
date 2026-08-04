// Downloads the Pexels stills used across the site into /public/media.
// Every id below was picked from Pexels search results and then checked by eye
// against the section it serves — do not swap ids without re-checking the frame.
//
// Run with: node scripts/fetch-media.mjs
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const OUT = new URL("../public/media/", import.meta.url);

/** @type {[id: string, file: string, width: number, subject: string][]} */
const PHOTOS = [
  // Full-bleed bands
  ["1148820", "hero-datacentre.jpg", 2400, "server blades and patch cabling"],
  ["325229", "band-network-rack.jpg", 2400, "datacentre rack aisle"],
  ["12903158", "band-office.jpg", 2400, "open-plan office, staff at desktop workstations"],
  ["6804068", "band-workspace.jpg", 2000, "developers at desks in a tech office"],
  ["12267675", "coverage-kl.jpg", 2400, "Kuala Lumpur aerial skyline at night"],

  // Service pages
  ["1181354", "svc-managed-services.jpg", 1600, "engineer with tablet beside server racks"],
  ["37605911", "svc-project-deployment.jpg", 1600, "IT technician working in a server room"],
  ["5453822", "svc-helpdesk.jpg", 1600, "helpdesk agent wearing a headset"],
  ["442151", "svc-staffing.jpg", 1600, "engineers working on a network rack"],
  ["10558598", "svc-warranty.jpg", 1600, "memory module being fitted to an open laptop"],
  ["2881227", "svc-sourcing.jpg", 1600, "ports and link LEDs on a rack switch"],
  ["6804586", "svc-value-added.jpg", 1600, "technician handling network cables"],
  ["5203849", "contact-support.jpg", 1600, "server room aisle"],

  // Case studies
  ["210607", "case-banking.jpg", 1400, "financial market ticker board"],
  ["3550484", "case-audit.jpg", 1400, "laptops stacked on their shipping cartons"],
  ["8422728", "case-retail.jpg", 1400, "card terminal at a grocery checkout"],
  ["19728112", "case-telco.jpg", 1400, "technicians working on a cell tower"],
  ["33316597", "case-media.jpg", 1400, "operator at a video switcher and multiview monitor"],
  ["723240", "case-aviation.jpg", 1400, "aircraft on stand at sunset"],
  ["6767962", "case-oil-gas.jpg", 1400, "aerial view of an oil refinery"],
  ["4610271", "case-government.jpg", 1400, "Perdana Putra, Putrajaya"],
];

async function download(url, name) {
  const target = new URL(name, OUT);
  try {
    const s = await stat(target);
    if (s.size > 10_000) return `skip  ${name}`;
  } catch {}

  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0", accept: "image/*" },
  });
  if (!res.ok) throw new Error(`${res.status} ${name} <- ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(target));

  const { size } = await stat(target);
  return `ok    ${name} (${Math.round(size / 1024)} KB)`;
}

await mkdir(OUT, { recursive: true });

const results = await Promise.allSettled(
  PHOTOS.map(([id, name, w]) =>
    download(
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`,
      name,
    ),
  ),
);

let failed = 0;
for (const r of results) {
  if (r.status === "fulfilled") console.log(r.value);
  else {
    failed++;
    console.error(`FAIL  ${r.reason.message}`);
  }
}
process.exit(failed ? 1 : 0);
