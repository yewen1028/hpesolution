import { SkeletonBlock, SkeletonHeading, SkeletonPage } from "@/components/skeleton";

/**
 * Matches `services/[slug]/page.tsx`: the icon-plus-heading pair, then the
 * two-column feature list drawn on hairlines.
 */
export default function Loading() {
  return (
    <SkeletonPage label="Loading service">
      <div className="flex items-start gap-6">
        <SkeletonBlock className="h-14 w-14 shrink-0" />
        <SkeletonHeading />
      </div>

      <ul className="mt-14 grid border-t border-rule md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <li
            key={i}
            className="border-b border-rule py-8 md:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:pr-12 md:[&:nth-child(even)]:pl-12"
          >
            <SkeletonBlock className="h-5 w-3/5" />
            <SkeletonBlock className="mt-3 h-3.5 w-full" />
            <SkeletonBlock className="mt-2 h-3.5 w-4/5" />
          </li>
        ))}
      </ul>
    </SkeletonPage>
  );
}
