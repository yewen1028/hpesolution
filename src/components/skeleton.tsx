import { Container } from "@/components/ui";

/**
 * Skeletons shaped like the content they stand in for.
 *
 * Deliberately not a spinner. A spinner says "something is happening"; a
 * skeleton in the right shape says "a row of case studies is arriving", and the
 * page does not jump when the real thing lands because the boxes already
 * occupy the same space.
 *
 * Every skeleton here is `aria-hidden` and sits inside a container that carries
 * one `role="status"` announcement. Eighteen shimmering rectangles must not be
 * eighteen separate announcements.
 *
 * Server components — geometry only.
 */

/** One shimmering block. `className` supplies the size. */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

/** Wraps a set of blocks and makes the single polite announcement. */
export function SkeletonRegion({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

/** Matches `SectionHeading`: eyebrow, two title lines, two lede lines. */
export function SkeletonHeading({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className={`max-w-3xl ${tone === "light" ? "skeleton-on-dark" : ""}`}>
      <SkeletonBlock className="h-3 w-32" />
      <SkeletonBlock className="mt-5 h-9 w-full max-w-xl" />
      <SkeletonBlock className="mt-3 h-9 w-2/3" />
      <SkeletonBlock className="mt-7 h-4 w-full" />
      <SkeletonBlock className="mt-2.5 h-4 w-4/5" />
    </div>
  );
}

/**
 * Matches a case-study card in `case-preview.tsx`: 16/10 image, title, body,
 * and the two-column metric row under a hairline.
 */
export function SkeletonCaseCard() {
  return (
    <div className="flex flex-col bg-paper">
      <SkeletonBlock className="aspect-[16/10] w-full" />
      <div className="flex flex-1 flex-col p-8">
        <SkeletonBlock className="h-6 w-11/12" />
        <SkeletonBlock className="mt-3 h-6 w-3/5" />
        <SkeletonBlock className="mt-5 h-3.5 w-full" />
        <SkeletonBlock className="mt-2 h-3.5 w-full" />
        <SkeletonBlock className="mt-2 h-3.5 w-2/3" />
        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-rule pt-6">
          {[0, 1].map((i) => (
            <div key={i}>
              <SkeletonBlock className="h-2.5 w-20" />
              <SkeletonBlock className="mt-2 h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Matches the hairline grid of case cards. */
export function SkeletonCaseGrid({ count = 3 }: { count?: number }) {
  return (
    <ul className="mt-16 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <SkeletonCaseCard />
        </li>
      ))}
    </ul>
  );
}

/**
 * Matches the centre directory in `coverage.tsx`: a region heading, the share
 * meter, then rows of pin + town name.
 */
export function SkeletonCentreList({ rows = 9 }: { rows?: number }) {
  return (
    <div>
      <div className="flex items-baseline gap-3 pb-4">
        <SkeletonBlock className="h-3.5 w-44" />
        <SkeletonBlock className="h-3.5 w-6" />
      </div>
      <SkeletonBlock className="h-0.5 w-full" />
      <ul className="mt-2 grid gap-x-8 sm:grid-cols-2">
        {Array.from({ length: rows }, (_, i) => (
          <li
            key={i}
            className="flex items-center gap-3 border-b border-rule py-3.5"
          >
            <SkeletonBlock className="h-4 w-4 shrink-0 rounded-full" />
            <SkeletonBlock className="h-3.5 w-28" />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Matches the network map's 800×380 stage, aspect included so nothing jumps. */
export function SkeletonMap() {
  return <SkeletonBlock className="skeleton--netmap w-full" />;
}

/** Page-level skeleton for a content route. */
export function SkeletonPage({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <SkeletonRegion label={label}>
      <section className="py-24 sm:py-32">
        <Container>{children}</Container>
      </section>
    </SkeletonRegion>
  );
}
