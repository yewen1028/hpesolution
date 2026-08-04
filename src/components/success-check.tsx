/**
 * Checkmark that draws itself in — ring first, then the tick.
 *
 * `pathLength="1"` is set on both strokes, the same normalisation `DrawIcon`
 * uses: it tells the renderer to treat each path as one unit long whatever its
 * real geometry, so `stroke-dasharray: 1` is exactly one stroke and nothing has
 * to be measured with `getTotalLength()`.
 *
 * The ring and the tick are separate elements rather than one path so they can
 * carry different durations and a stagger — a tick that draws at the same rate
 * as the circle enclosing it reads as one squiggle rather than two marks.
 *
 * Server component. All the motion is CSS keyed off `.success-check`, which
 * only mounts once the form reaches its success state, so the animation runs on
 * mount and needs no trigger.
 */
export function SuccessCheck({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={`success-check ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        className="success-check__ring"
        cx="12"
        cy="12"
        r="10"
        pathLength="1"
      />
      <path className="success-check__tick" d="m8 12.5 2.75 2.75L16 9.5" pathLength="1" />
    </svg>
  );
}
