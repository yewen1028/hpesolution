"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  DivIcon,
  GeoJSON,
  Map as LeafletMap,
  Marker,
  PathOptions,
  TooltipOptions,
} from "leaflet";
import { MapPin, Network, Globe2 } from "lucide-react";
import { regions, type Centre } from "@/lib/site";
import "leaflet/dist/leaflet.css";

type View = "network" | "geo";

const allCentres = regions.flatMap((r) => r.centres);

/* ── Marker icons ─────────────────────────────────────────────────────────
 * Leaflet's divIcon takes an HTML string, so the two lucide glyphs are
 * inlined here rather than rendered as components. Paths are copied verbatim
 * from `lucide-react` (`building-2`, `map-pin`) — keep them in step if the
 * dependency is upgraded.
 */
const ICON_HQ = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 12h4"/><path d="M10 8h4"/><path d="M14 21v-3a2 2 0 0 0-4 0v3"/><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"/><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/></svg>`;
const ICON_PIN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;

/* ── State boundaries ─────────────────────────────────────────────────────
 * Hover styling for the sixteen states. Colours are literals because Leaflet
 * writes them onto SVG presentation attributes, where `var()` does not
 * resolve; they track `--color-brand` and `--color-paper-deep` by hand.
 */
const STATE_REST: PathOptions = {
  color: "rgb(160 190 220 / 0.5)",
  weight: 1.1,
  opacity: 1,
  fillColor: "#16212c",
  fillOpacity: 0.08,
  interactive: true,
};

const STATE_HOVER: PathOptions = {
  color: "#f26f21",
  weight: 2.4,
  opacity: 1,
  fillColor: "#f26f21",
  fillOpacity: 0.18,
};

type Leaflet = typeof import("leaflet");

/**
 * A pin is a round badge carrying the lucide glyph, anchored at its foot so it
 * sits above the coordinate rather than covering it. Head office is the larger
 * of the two and wears a pulse ring.
 */
function pinIcon(L: Leaflet, centre: Centre, isActive: boolean): DivIcon {
  const classes = [
    "sc-pin",
    centre.hq ? "sc-pin--hq" : "",
    isActive ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const body = centre.hq
    ? `${ICON_HQ}<span class="sc-pin__pulse"></span>`
    : ICON_PIN;
  const size: [number, number] = centre.hq ? [32, 32] : [28, 28];
  return L.divIcon({
    // Empty rather than omitted: Leaflet's own `leaflet-div-icon` default
    // paints a white box behind the badge.
    className: "",
    html: `<div class="${classes}">${body}</div>`,
    iconSize: size,
    iconAnchor: centre.hq ? [16, 32] : [14, 28],
    popupAnchor: [0, -30],
    // Lift the label clear of the top of the badge, not over its middle.
    tooltipAnchor: centre.hq ? [0, -34] : [0, -30],
  });
}

const tooltipText = (centre: Centre) =>
  centre.hq ? `${centre.name} — head office` : centre.name;

/**
 * The selected centre keeps its label up permanently; everything else labels
 * on hover.
 */
function tooltipOptions(centre: Centre, isActive: boolean): TooltipOptions {
  return {
    permanent: isActive,
    direction: "top",
    className: [
      "sc-tooltip",
      centre.hq ? "sc-tooltip--hq" : "",
      isActive ? "sc-tooltip--sel" : "",
    ]
      .filter(Boolean)
      .join(" "),
  };
}

/**
 * The map stage: a switch between the draft's two maps, the horizontal map
 * itself, and the centre directory underneath.
 *
 * The network map is a server component handed in as `networkMap`, so its SVG
 * is in the HTML from the first byte and the default view costs no JavaScript
 * to paint. Leaflet is only imported — and the map only constructed — once the
 * visitor asks for the geographic view. That ordering is the point: the heavy,
 * network-dependent map is opt-in.
 *
 * Motion here takes the normal reduced-motion bail-out. Unlike the partner
 * carousel, nothing about a map depends on movement to make sense.
 */
export function CoverageMap({ networkMap }: { networkMap: React.ReactNode }) {
  const [view, setView] = useState<View>("network");
  const [active, setActive] = useState<string | null>(null);
  /** Flips once the markers exist, so the active-marker effect has something
      to act on however the two async steps happen to interleave. */
  const [ready, setReady] = useState(false);

  const holder = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leaflet = useRef<Leaflet | null>(null);
  const markers = useRef<Record<string, Marker>>({});
  /** A centre chosen from the list while the network map was showing. */
  const pending = useRef<Centre | null>(null);
  /** The map's settle handler is registered once, so it reads the selection
      through a ref rather than closing over the state at construction time. */
  const activeRef = useRef<string | null>(null);

  const flyTo = useCallback((centre: Centre) => {
    const map = mapRef.current;
    if (!map) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Zoom in only as far as the country view — enough to place the town
    // without throwing away the surrounding coastline.
    map.setView([centre.lat, centre.lng], Math.max(map.getZoom(), 7), {
      animate: !still,
    });
  }, []);

  useEffect(() => {
    if (view !== "geo") return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !holder.current || mapRef.current) return;
      leaflet.current = L;

      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Malaysia is ~19° of longitude, which is only ~430px at zoom 5 — lost
      // inside a container two or three times that wide. Zoom 6 doubles it and
      // fills the stage. It needs ~865px to fit, so anything narrower than
      // that stays at 5 rather than opening on a cropped country.
      const zoom = holder.current.clientWidth >= 880 ? 6 : 5;

      const map = L.map(holder.current, {
        center: [4.2, 109.0],
        zoom,
        minZoom: 4,
        maxZoom: 12,
        // Never swallow the page scroll — the map is mid-document.
        scrollWheelZoom: false,
        zoomAnimation: !still,
        fadeAnimation: !still,
        markerZoomAnimation: !still,
      });
      mapRef.current = map;

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
        {
          subdomains: "abcd",
          maxZoom: 19,
          // Required by the OSM and CARTO terms — do not remove.
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      ).addTo(map);

      // ── State boundaries, drawn under the markers.
      // The tile layer carries no labels, so this is what makes the map
      // legible as Malaysia rather than a coastline. Served from `public/`, so
      // a slow or unreachable third party can never hold up the map; if it
      // fails the markers still stand on their own.
      fetch("/geo/malaysia-states.json")
        .then((r) => (r.ok ? r.json() : null))
        .then((geojson) => {
          if (cancelled || !geojson || !mapRef.current) return;
          const states: GeoJSON = L.geoJSON(geojson, {
            style: () => STATE_REST,
            onEachFeature: (feature, layer) => {
              const name: string = feature?.properties?.name ?? "";
              layer.on({
                mouseover: (e) => {
                  const target = e.target as typeof layer & {
                    setStyle: (s: PathOptions) => void;
                    bringToFront: () => void;
                  };
                  target.setStyle(STATE_HOVER);
                  target.bringToFront();
                  if (name) {
                    layer
                      .bindTooltip(name, {
                        direction: "center",
                        className: "state-tooltip",
                        sticky: true,
                      })
                      .openTooltip();
                  }
                },
                mouseout: (e) => {
                  states.resetStyle(e.target);
                  layer.closeTooltip();
                },
              });
            },
          }).addTo(map);
          // Boundaries are decoration; the pins must stay clickable over them.
          states.bringToBack();
        })
        .catch(() => {});

      for (const centre of allCentres) {
        // A divIcon rather than Leaflet's default: the stock icon resolves
        // image paths relative to its own CSS and breaks under bundling.
        const marker = L.marker([centre.lat, centre.lng], {
          title: centre.name,
          icon: pinIcon(L, centre, false),
        })
          .addTo(map)
          .bindTooltip(tooltipText(centre), tooltipOptions(centre, false));

        // Highlighting only — no `setView`, so clicking a pin never pans the
        // country out from under the visitor's cursor.
        marker.on("click", () => setActive(centre.name));
        markers.current[centre.name] = marker;
      }

      // Panning, zooming and the state layer's own tooltip churn can all close
      // a permanent tooltip. Re-opening on settle keeps the selected centre
      // labelled rather than silently losing its name after a drag.
      map.on("zoomend moveend dragend", () => {
        const current = markers.current[activeRef.current ?? ""];
        if (current?.getTooltip()) current.openTooltip();
      });

      setReady(true);

      // Honour a centre picked before this map existed.
      if (pending.current) {
        flyTo(pending.current);
        pending.current = null;
      }
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leaflet.current = null;
      markers.current = {};
      setReady(false);
    };
  }, [view, flyTo]);

  /**
   * Push the selection onto the markers. Icons are swapped with `setIcon`
   * rather than by toggling a class on the element: Leaflet re-creates marker
   * DOM on zoom, which wipes any class added behind its back.
   */
  useEffect(() => {
    activeRef.current = active;
    const L = leaflet.current;
    if (!ready || !L) return;
    for (const centre of allCentres) {
      const marker = markers.current[centre.name];
      if (!marker) continue;
      const isActive = centre.name === active;
      marker.setIcon(pinIcon(L, centre, isActive));
      marker.unbindTooltip();
      marker.bindTooltip(tooltipText(centre), tooltipOptions(centre, isActive));
      if (isActive) marker.openTooltip();
    }
  }, [active, ready]);

  /** Selecting a centre always ends up on the geographic map. */
  function select(centre: Centre) {
    setActive(centre.name);
    if (view === "geo" && mapRef.current) {
      flyTo(centre);
      return;
    }
    pending.current = centre;
    setView("geo");
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Map view"
        className="mb-8 inline-flex border border-rule"
      >
        {(
          [
            { id: "network", label: "Network map", Icon: Network },
            { id: "geo", label: "Interactive map", Icon: Globe2 },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={`flex items-center gap-2.5 px-5 py-3 text-[0.85rem] font-semibold transition-colors duration-200 ${
              view === id
                ? "bg-brand text-white"
                : "bg-paper text-ink-soft hover:bg-paper-warm hover:text-ink"
            }`}
          >
            <Icon size={16} strokeWidth={2} aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Horizontal stage: the map runs the full width of the container, which
          suits Malaysia's shape — it is far wider than it is tall. */}
      <div className="w-full">
        {view === "network" ? (
          networkMap
        ) : (
          <div
            ref={holder}
            role="application"
            aria-label="Interactive map of HPE Solutions service centres across Malaysia"
            className="aspect-[800/380] max-h-[70vh] min-h-[360px] w-full border border-rule bg-paper-deep"
          />
        )}
      </div>

      <p className="mt-4 text-[0.8rem] text-ink-muted">
        {view === "network"
          ? "Every arc is a dispatch route from the Puchong head office. Select a centre below to place it geographically."
          : "Hover a state to name it; select a centre to locate it. Markers show town centres, not branch addresses — call ahead before a walk-in."}
      </p>

      {/* Directory. Server-rendered markup inside a client component, so the
          eighteen centres are in the HTML whether or not either map loads. */}
      <div className="mt-14 grid gap-10 border-t border-rule pt-12 lg:grid-cols-2 lg:gap-16">
        {regions.map((region) => (
          <div key={region.name}>
            <h3 className="flex items-baseline gap-3 border-b border-rule-strong pb-4 font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink">
              {region.name}
              <span className="tabular text-ink-muted">
                {region.centres.length}
              </span>
            </h3>
            <ul className="sm:grid sm:grid-cols-2 sm:gap-x-10">
              {region.centres.map((centre) => (
                <li key={centre.name} className="border-b border-rule">
                  <button
                    type="button"
                    onClick={() => select(centre)}
                    aria-current={active === centre.name || undefined}
                    className="flex w-full items-center gap-3 py-3.5 text-left text-[0.975rem] text-ink-soft transition-colors duration-200 hover:text-brand aria-[current]:font-semibold aria-[current]:text-brand"
                  >
                    <MapPin
                      size={16}
                      strokeWidth={1.75}
                      className="shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    {centre.name}
                    {centre.hq && (
                      <span className="ml-auto text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        HQ
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
