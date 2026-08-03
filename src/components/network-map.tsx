import { allCentres } from "@/lib/site";
import { NETMAP_DOTS } from "@/lib/netmap-dots";

/**
 * The dispatch-network map from the `HPE - refined` draft: Malaysia as a dot
 * field, with an arc drawn from Puchong out to each of the other seventeen
 * centres.
 *
 * Deliberately a server component — it is SVG and CSS with no interactivity, so
 * it ships no JavaScript at all and paints on the first frame. The draft built
 * the arcs and nodes with DOM calls at runtime; the geometry is fully
 * determined by the coordinates, so it is computed here at build time instead.
 *
 * Animation is decoration layered on top. The static state is the *complete*
 * state — arcs fully drawn, nodes visible — so the map reads correctly when
 * animation never runs, which is the norm on machines reporting reduced motion.
 */

const hq = allCentres.find((c) => c.hq)!;
const spokes = allCentres.filter((c) => !c.hq);

/** Quadratic arc lifted from the draft, bowing upward off the midpoint. */
function arcPath(ax: number, ay: number, bx: number, by: number) {
  const mx = (ax + bx) / 2;
  const my = Math.min(ay, by) - 50;
  return `M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`;
}

const STAGGER = 0.22;

export function NetworkMap() {
  return (
    <div className="netmap">
      <svg
        viewBox="0 0 800 380"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Network map of Malaysia showing dispatch routes from the Puchong head office to ${spokes.length} regional service centres`}
      >
        <defs>
          {/* Stop colours are set in CSS, not as presentation attributes:
              `var()` inside an SVG attribute is not reliably supported, but it
              is a plain CSS property here and resolves everywhere. */}
          <linearGradient id="netmapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop className="netmap-grad-from" offset="0%" stopOpacity="0" />
            <stop className="netmap-grad-from" offset="12%" stopOpacity="1" />
            <stop className="netmap-grad-to" offset="100%" stopOpacity="1" />
          </linearGradient>
        </defs>

        <path className="netmap-dots" d={NETMAP_DOTS} />

        <g className="netmap-arcs">
          {spokes.map((centre, i) => (
            <path
              key={centre.name}
              className="netmap-arc"
              d={arcPath(hq.nx, hq.ny, centre.nx, centre.ny)}
              style={{ "--delay": `${(i * STAGGER).toFixed(2)}s` } as React.CSSProperties}
            />
          ))}
        </g>

        <g className="netmap-points">
          {allCentres.map((centre, i) => (
            <g
              key={centre.name}
              className={`netmap-pt${centre.hq ? " netmap-pt--hq" : ""}`}
              style={
                {
                  "--delay": `${(centre.hq ? 0 : i * STAGGER).toFixed(2)}s`,
                } as React.CSSProperties
              }
            >
              <circle
                className="netmap-ring"
                cx={centre.nx}
                cy={centre.ny}
                r={centre.hq ? 9 : 7}
              />
              <circle
                className="netmap-core"
                cx={centre.nx}
                cy={centre.ny}
                r={centre.hq ? 4.2 : 3}
              />
              {/* Native tooltip: no JS, and it reaches the accessibility tree. */}
              <title>{centre.hq ? `${centre.name} — head office` : centre.name}</title>
            </g>
          ))}
        </g>
      </svg>

      <p className="netmap-key">
        <span className="netmap-key__hq" aria-hidden="true" />
        Puchong head office
        <span className="netmap-key__pt" aria-hidden="true" />
        Regional centre
      </p>
    </div>
  );
}
