import Image from "next/image";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container } from "@/components/ui";
import { drivers } from "@/lib/site";

export function Positioning() {
  return (
    <section className="border-t border-rule bg-paper-warm py-24 sm:py-32">
      <Container>
        <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          {/* Photo column — the parallax frame is fixed height, the layer drifts. */}
          <Reveal className="relative">
            <div className="relative h-[26rem] overflow-hidden lg:sticky lg:top-32 lg:h-[34rem]">
              <Parallax speed={70} className="absolute inset-x-0">
                <Image
                  src="/media/band-office.jpg"
                  alt="Two colleagues working at computers in an open-plan office"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <p className="eyebrow">Why managed</p>
              <h2 className="display-2 mt-5">
                Five pressures that push IT support out of house.
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
