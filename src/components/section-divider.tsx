/**
 * Angled edge between two sections of different colour.
 *
 * Angled, not curved, and deliberately so: CLAUDE.md's design system is drawn
 * with hairlines and hard edges — "grids are drawn with hairlines, not cards" —
 * and a soft wave or blob would read as borrowed from a different site. A 2.5°
 * cut keeps the geometry of the rest of the page while removing the dead-flat
 * horizontal line.
 *
 * The SVG paints the colour of the *neighbouring* section, so it reads as that
 * section's edge intruding rather than as a separate band. `preserveAspectRatio
 * ="none"` lets a 1-unit-tall viewBox stretch to whatever height is asked for,
 * so the angle stays constant at any viewport width.
 *
 * Server component — geometry only, no script.
 */
export function SectionDivider({
  position,
  color,
  height = 72,
  flip = false,
  className = "",
}: {
  /** Which edge of the *current* section this sits on. */
  position: "top" | "bottom";
  /** CSS colour of the adjacent section, e.g. `var(--color-paper-warm)`. */
  color: string;
  /** Cut depth in px. */
  height?: number;
  /** Mirrors the angle, so consecutive dividers do not all lean the same way. */
  flip?: boolean;
  className?: string;
}) {
  // Top edge: the neighbour's colour fills the upper triangle.
  // Bottom edge: it fills the lower one.
  const points =
    position === "top"
      ? flip
        ? "0,0 100,0 100,1 0,0"
        : "0,0 100,0 0,1 0,0"
      : flip
        ? "0,1 100,1 100,0 0,1"
        : "0,1 100,1 0,0 0,1";

  return (
    <div
      aria-hidden="true"
      className={`section-divider section-divider--${position} ${className}`}
      style={{ height }}
    >
      <svg
        viewBox="0 0 100 1"
        preserveAspectRatio="none"
        focusable="false"
        role="presentation"
      >
        <polygon points={points} fill={color} />
      </svg>
    </div>
  );
}
