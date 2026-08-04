import { SkeletonBlock, SkeletonHeading, SkeletonPage } from "@/components/skeleton";

/**
 * Matches `services/[slug]/page.tsx` as far as it can.
 *
 * The icon-plus-heading pair is identical on every service. The feature list
 * below it is not: five services render a two-column grid, and the two whose
 * features describe a sequence (`featureFlow` in `site.ts`) render a timeline
 * instead. `loading.tsx` receives no params, so it cannot know which route it
 * is standing in for.
 *
 * A single column is therefore the honest shape — it is exactly what the grid
 * collapses to below `md`, so it is correct for every route on mobile and the
 * smaller of the two possible mismatches on desktop. Committing to two columns
 * would guarantee a visible reflow on the timeline routes.
 */
export default function Loading() {
  return (
    <SkeletonPage label="Loading service">
      <div className="flex items-start gap-6">
        <SkeletonBlock className="h-14 w-14 shrink-0" />
        <SkeletonHeading />
      </div>

      <ul className="mt-14 border-t border-rule">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="border-b border-rule py-8">
            <SkeletonBlock className="h-5 w-2/5" />
            <SkeletonBlock className="mt-3 h-3.5 w-full max-w-2xl" />
            <SkeletonBlock className="mt-2 h-3.5 w-3/5" />
          </li>
        ))}
      </ul>
    </SkeletonPage>
  );
}
