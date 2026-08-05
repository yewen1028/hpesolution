import { Hero } from "@/components/sections/hero";
import { Positioning } from "@/components/sections/positioning";
import { ServicesGrid } from "@/components/sections/services-grid";
import { OperationsBand } from "@/components/sections/operations-band";
import { CasePreview } from "@/components/sections/case-preview";
import { Coverage } from "@/components/sections/coverage";
import { Partners } from "@/components/sections/partners";
import { ContactCta } from "@/components/sections/contact-cta";
import { ScrollStage } from "@/components/scroll-stage";

/*
 * Eight bands, eight different scroll behaviours.
 *
 * Four of them already carried a figure of their own before `ScrollStage`
 * existed, and those are left alone rather than wrapped: stacking a stage on
 * top of a band that is already animating gives you two gestures fighting over
 * the same pixels, which reads worse than either alone.
 *
 *   1 Hero            photo drifts against the scroll, headline staggers in
 *                     word by word. Its own thing; also first paint, and a
 *                     section that animates before it has been scrolled to is
 *                     a section that animates on arrival.
 *   2 ServicesGrid    FOLD - hinges on its top edge and tips away.
 *   3 OperationsBand  ScrollTheme resolves the page from light to dark across
 *                     half a viewport, over lazy-loaded video. Wrapping it
 *                     would also pull its angled SectionDivider seams off the
 *                     neighbours they are cut to meet.
 *   4 Positioning     sticky photo column behind a MaskReveal. Cannot take a
 *                     stage at all: perspective and clip-path both make the
 *                     wrapper a containing block, and the column would then
 *                     stick inside a moving frame.
 *   5 CasePreview     PAN - crosses sideways: in from the right, out to the
 *                     left. The only figure on the horizontal axis, and the
 *                     only section that can take it — it has no fill and no
 *                     border, so nothing but its contents travels. It replaced
 *                     ZOOM, which settled forward and back and was too close a
 *                     relative of the fold two sections above.
 *   6 Coverage        aperture parallax - the skyline holds still and the band
 *                     travels over it.
 *   7 Partners        CURTAIN - clips open downward and shut from the top. The
 *                     one figure that does not move the section, which keeps
 *                     it from competing with the carousel running inside it.
 *   8 ContactCta      RISE - translation and fade, nothing else. After three
 *                     sections that rotate, scale and clip, the closing band
 *                     simply arrives.
 */
export default function HomePage() {
  return (
    <>
      <Hero />

      <ScrollStage variant="fold">
        <ServicesGrid />
      </ScrollStage>

      <OperationsBand />

      <Positioning />

      <ScrollStage variant="pan">
        <CasePreview />
      </ScrollStage>

      <Coverage />

      <ScrollStage variant="curtain">
        <Partners />
      </ScrollStage>

      <ScrollStage variant="rise">
        <ContactCta />
      </ScrollStage>
    </>
  );
}
