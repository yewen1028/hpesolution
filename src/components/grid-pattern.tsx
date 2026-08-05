/**
 * Magic UI's **Grid Pattern** (21st.dev/magicui), redrawn for this site.
 *
 * The original is a tiled SVG `<pattern>` of squares, used as a faint backdrop
 * behind hero copy. It earns its place here for two reasons the flashier
 * options in that collection do not:
 *
 *   1. It is the grammar this site already draws in. The page grids are
 *      hairlines, the network map is a field of dots, and `flickering-grid.tsx`
 *      is the same idea on a canvas. A ruled backdrop is native here; meteors
 *      and sparkles are not.
 *   2. **It does not move.** The band it sits in already carries the page's one
 *      parallax figure, and the brief was one figure per page. A static texture
 *      adds depth to that band without spending a second scroll effect on it.
 *
 * A server component: pure markup, no state, nothing to hydrate. Sized in the
 * pattern's own user units, so the tile stays crisp at any band height.
 */
export function GridPattern({
  size = 48,
  className = "",
}: {
  /** Tile edge in px. */
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        {/*
          The id is per-size rather than fixed: two bands at different sizes on
          one page would otherwise share the first pattern defined, and SVG ids
          are document-global.
        */}
        <pattern
          id={`grid-${size}`}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          {/* One corner of the cell — a top and a left edge. Tiled, that is a
              continuous grid with no doubled lines where cells meet. */}
          <path
            d={`M ${size} 0 L 0 0 0 ${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#grid-${size})`} />
    </svg>
  );
}
