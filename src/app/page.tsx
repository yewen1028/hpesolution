import { Hero } from "@/components/sections/hero";
import { Positioning } from "@/components/sections/positioning";
import { ServicesGrid } from "@/components/sections/services-grid";
import { OperationsBand } from "@/components/sections/operations-band";
import { CasePreview } from "@/components/sections/case-preview";
import { Coverage } from "@/components/sections/coverage";
import { Partners } from "@/components/sections/partners";
import { ContactCta } from "@/components/sections/contact-cta";
import { ScrollFold } from "@/components/scroll-fold";

/*
 * Four of the eight bands are wrapped in `ScrollFold`. The other four are left
 * alone deliberately, and each for its own reason:
 *
 *   Hero            first paint; it already drives its own parallax layer, and
 *                   a section that folds before it has been scrolled to is a
 *                   section that folds on arrival.
 *   OperationsBand  `SectionDivider` cuts angled seams against the sections
 *                   above and below it. Rotating the band pulls those seams off
 *                   the neighbours they are cut to meet.
 *   Positioning     its photo column is `lg:sticky`, and the `perspective()` in
 *                   the fold would make this the containing block — the column
 *                   would then stick inside a frame that is itself moving.
 *   Coverage        a full-bleed parallax band; folding a full-bleed image
 *                   exposes the page edge behind it.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ScrollFold>
        <ServicesGrid />
      </ScrollFold>
      <OperationsBand />
      <Positioning />
      <ScrollFold>
        <CasePreview />
      </ScrollFold>
      <Coverage />
      <ScrollFold>
        <Partners />
      </ScrollFold>
      <ScrollFold>
        <ContactCta />
      </ScrollFold>
    </>
  );
}
