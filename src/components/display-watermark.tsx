/**
 * Oversized display type used as a graphic rather than as reading matter.
 *
 * The figure is already stated in the heading beside it, so this is a
 * duplicate: it is `aria-hidden` and carries no semantic weight. What it adds
 * is scale — a numeral set at 34vw reads as a shape first and a number second,
 * which is the point.
 *
 * Outlined rather than filled. A solid numeral at this size on a photographic
 * band either fights the type in front of it or has to be dropped so low in
 * opacity that it turns to mud; a hairline outline keeps the drawing while
 * staying behind the content, and it matches a design system built out of
 * hairlines.
 *
 * Server component — no state, no script.
 */
export function DisplayWatermark({
  children,
  tone = "light",
  className = "",
}: {
  children: React.ReactNode;
  /** `light` for dark bands, `dark` for paper. */
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`display-watermark display-watermark--${tone} ${className}`}
    >
      {children}
    </span>
  );
}
