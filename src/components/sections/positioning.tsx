import { Media } from "@/components/media";
import { MaskReveal } from "@/components/mask-reveal";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container } from "@/components/ui";
import { drivers } from "@/lib/site";

/**
 * Used on two pages, and what sits above it differs — which is the whole reason
 * `topRule` exists.
 *
 * On `/about-us` the previous section is also `paper-warm`, so without a rule
 * the two run together as one block: it stays on, and that is the default.
 *
 * On the home page the previous section is the SLA band, which ends on an
 * angled `SectionDivider` **cut in this section's own `paper-warm`** — the
 * handover is already drawn, on the diagonal. A straight rule there is a second
 * separator that disagrees with the first: it ran the full width across the
 * foot of the band's photograph, a few pixels below where the angle had already
 * given the page over. So the home page passes `topRule={false}`.
 *
 * The test for any new caller is that one question: does the section above end
 * on a divider? If it does, this rule is redundant and will be visible as a
 * line across the bottom of that section's artwork.
 */
export function Positioning({ topRule = true }: { topRule?: boolean } = {}) {
  return (
    <section
      className={`bg-paper-warm py-24 sm:py-32 ${
        topRule ? "border-t border-rule" : ""
      }`}
    >
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          {/* Photo column — the parallax frame is fixed height, the layer drifts. */}
          <Reveal className="relative">
            {/*
              MaskReveal wraps the frame, not the Parallax layer: the layer is
              oversized by `speed` on both edges so its drift never exposes an
              edge, and clipping it there would cut the picture at the drift
              boundary rather than at the frame.
            */}
            <MaskReveal
              from="up"
              className="relative h-[26rem] overflow-hidden lg:sticky lg:top-32 lg:h-[34rem]"
            >
              <Parallax speed={70} className="absolute inset-x-0">
                <Media
                  src="/media/band-office.jpg"
                  alt="Colleagues working at desktop workstations in an open-plan office"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </MaskReveal>
          </Reveal>

          <div>
            <Reveal>
              <h2 className="display-2">
                Five reasons to move to managed IT support.
              </h2>
              <p className="lede mt-6">
                None of these are new. What has changed is how quickly each one
                becomes visible to the rest of the business when it goes
                unaddressed.
              </p>
            </Reveal>

            <ol className="mt-12 border-t border-rule">
              {drivers.map((driver, i) => (
                <Reveal
                  as="li"
                  key={driver.title}
                  delay={i * 80}
                  className="flex gap-6 border-b border-rule py-7"
                >
                  <span className="tabular shrink-0 pt-1 font-display text-[0.8rem] font-semibold tracking-[0.1em] text-brand">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {driver.title}
                    </h3>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-ink-soft">
                      {driver.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </ol>

            <Reveal delay={120}>
              <div className="mt-12">
                <ButtonLink href="/about-us" variant="ghost">
                  About HPE Solutions
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
