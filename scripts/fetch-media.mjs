// Downloads the Pexels stills and clips used across the site into /public/media.
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
  // Full-bleed bands.
  //
  // The home hero used to take a still from here (1148820, server blades and
  // patch cabling). It is a carousel of clips now — see HERO below.
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

/*
 * The home hero's video carousel — `components/hero-carousel.tsx`.
 *
 * Four clips, ordered hardware → network → site → people, and deliberately
 * ordered dark to light: the masthead tint sits at 0.6 opacity on its right
 * edge, so a bright frame reads brightest there and only the last slide is
 * allowed to be one.
 *
 * Each clip ships with the matching still, which is the `poster` and is also
 * what the hero shows outright under reduced motion — so the stills have to
 * stand on their own, exactly as `components/video-band.tsx` requires.
 *
 * Pexels' poster filename carries a per-clip slug and the video filename a
 * per-rendition id, so neither is derivable from the clip id the way a photo's
 * is. Both are written out in full.
 *
 * Rendition choice is per clip, not a global: these are backgrounds behind a
 * heavy tint, so the rule is "the smallest rendition that is not visibly soft
 * at full bleed". 1085656 and 5028622 are shallow-focus and handheld
 * respectively and lose nothing at 960 wide, which halves them.
 *
 * @type {[posterUrl: string, poster: string, videoUrl: string, video: string, subject: string][]}
 */
const HERO = [
  [
    "https://images.pexels.com/videos/7140931/pexels-photo-7140931.jpeg",
    "hero-servers.jpg",
    "https://videos.pexels.com/video-files/7140931/7140931-hd_1280_720_24fps.mp4",
    "hero-servers.mp4",
    "rack-mounted server front panels lit blue, drive bays and status LEDs",
  ],
  [
    "https://images.pexels.com/videos/1085656/free-video-1085656.jpg",
    "hero-network.jpg",
    "https://videos.pexels.com/video-files/1085656/1085656-sd_960_540_25fps.mp4",
    "hero-network.mp4",
    "patch panel under blue light, copper leads and green link LEDs",
  ],
  [
    "https://images.pexels.com/videos/5028622/pexels-photo-5028622.jpeg",
    "hero-rackroom.jpg",
    "https://videos.pexels.com/video-files/5028622/5028622-sd_960_540_25fps.mp4",
    "hero-rackroom.mp4",
    "comms room: open racks, patch panel and NAS on site",
  ],
  [
    "https://images.pexels.com/videos/8865706/call-center-office-talk-work-8865706.jpeg",
    "hero-helpdesk.jpg",
    "https://videos.pexels.com/video-files/8865706/8865706-hd_1280_720_25fps.mp4",
    "hero-helpdesk.mp4",
    "three support agents in headsets at a shared desk",
  ],
];

async function download(url, name) {
  const target = new URL(name, OUT);
  try {
    const s = await stat(target);
    if (s.size > 10_000) return `skip  ${name}`;
  } catch {}

  const res = await fetch(url, {
    headers: { "user-agent": "Mozilla/5.0", accept: "image/*,video/*" },
  });
  if (!res.ok) throw new Error(`${res.status} ${name} <- ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(target));

  const { size } = await stat(target);
  return `ok    ${name} (${Math.round(size / 1024)} KB)`;
}

await mkdir(OUT, { recursive: true });

const results = await Promise.allSettled([
  ...PHOTOS.map(([id, name, w]) =>
    download(
      `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`,
      name,
    ),
  ),
  ...HERO.flatMap(([posterUrl, poster, videoUrl, video]) => [
    download(`${posterUrl}?auto=compress&cs=tinysrgb&w=2000`, poster),
    download(videoUrl, video),
  ]),
]);

let failed = 0;
for (const r of results) {
  if (r.status === "fulfilled") console.log(r.value);
  else {
    failed++;
    console.error(`FAIL  ${r.reason.message}`);
  }
}
process.exit(failed ? 1 : 0);
