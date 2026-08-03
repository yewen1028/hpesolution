import {
  SkeletonCentreList,
  SkeletonHeading,
  SkeletonMap,
  SkeletonPage,
} from "@/components/skeleton";

/**
 * Matches `service-centre/map/page.tsx`: heading, the map stage at its real
 * aspect ratio, then the two-column centre directory beneath it.
 */
export default function Loading() {
  return (
    <SkeletonPage label="Loading coverage map">
      <SkeletonHeading />
      <div className="mt-16">
        <SkeletonMap />
      </div>
      <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:gap-20">
        <SkeletonCentreList rows={10} />
        <SkeletonCentreList rows={8} />
      </div>
    </SkeletonPage>
  );
}
