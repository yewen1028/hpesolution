/**
 * Seamless scrolling text banner.
 *
 * Loop logic is the same one `partner-carousel.tsx` proved: the set of items is
 * rendered **twice**, the track is `width: max-content`, and the animation
 * slides it from `-50%` to `0`. Because the two halves are identical, the wrap
 * at the end of every cycle lands on a pixel-identical frame and is invisible.
 * That is what makes it seamless — not a JavaScript measurement, which would
 * have to re-run on every resize and font swap.
 *
 * The second pass is `aria-hidden`, so a screen reader hears the list once.
 *
 * Unlike the partner carousel, this **does** bail out under reduced motion, per
 * the site-wide rule in CLAUDE.md. The carousel is a documented exception
 * because a stopped carousel of logos reads as broken; a stopped line of text
 * is just a line of text, and the CSS below turns it into a scrollable row so
 * nothing becomes unreachable.
 *
 * Server component — pure CSS, no script at all.
 */
export function TextMarquee({
  items,
  duration = 48,
  tone = "light",
  separator = "·",
  className = "",
}: {
  items: string[];
  /** Seconds for one full cycle. Longer track wants a longer duration. */
  duration?: number;
  /** `light` for dark bands, `dark` for paper. */
  tone?: "light" | "dark";
  separator?: string;
  className?: string;
}) {
  return (
    <div
      className={`text-marquee text-marquee--${tone} ${className}`}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
    >
      <div className="text-marquee__track">
        {[0, 1].map((pass) => (
          <ul
            key={pass}
            className="text-marquee__set"
            aria-hidden={pass === 1 ? "true" : undefined}
          >
            {items.map((item) => (
              <li key={item} className="text-marquee__item">
                {item}
                <span className="text-marquee__sep" aria-hidden="true">
                  {separator}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
