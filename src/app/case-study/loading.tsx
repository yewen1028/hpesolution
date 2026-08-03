import { SkeletonCaseGrid, SkeletonHeading, SkeletonPage } from "@/components/skeleton";

/**
 * Shown while the case-study route streams in on a client-side navigation.
 * Shapes match `case-study/page.tsx` — heading, then the hairline card grid —
 * so the layout does not jump when the real content replaces it.
 */
export default function Loading() {
  return (
    <SkeletonPage label="Loading case studies">
      <SkeletonHeading />
      <SkeletonCaseGrid count={6} />
    </SkeletonPage>
  );
}
