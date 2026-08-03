import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Target, Handshake } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { Container, SectionHeading } from "@/components/ui";
import { Positioning } from "@/components/sections/positioning";
import { Coverage } from "@/components/sections/coverage";
import { ContactCta } from "@/components/sections/contact-cta";
import { principles, stats } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "HPE Solutions is a Malaysian IT support service provider with 18 nationwide service centres, 70 full-time engineers and more than 50,000 customer nodes under management.",
};

const pillars = [
  { icon: Compass, label: "Vision", body: principles.vision },
  { icon: Target, label: "Mission", body: principles.mission },
  { icon: Handshake, label: "Commitment", body: principles.commitment },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Ten years of keeping other people's systems up."
        lede="HPE Solutions began as an IT support provider and grew into an IT solutions organisation with a nationwide support network. The work has not changed shape — it has changed scale."
        image="/media/band-workspace.jpg"
        imageAlt="Staff working at desks in an open-plan technology office"
        crumbs={[{ label: "About Us" }]}
      />

      {/* Figures */}
      <section className="border-b border-rule py-20 sm:py-24">
        <Container>
          <dl className="grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 90} className="bg-paper p-8">
                <dt className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-brand">
                  {stat.label}
                </dt>
                <dd>
                  <span className="display-2 mt-3 block font-display font-semibold text-ink">
                    <Counter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </span>
                  <span className="mt-3 block text-[0.9rem] leading-relaxed text-ink-soft">
                    {stat.note}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </section>

      {/* Narrative + parallax photo */}
      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-24">
            <div>
              <Reveal>
                <SectionHeading
                  eyebrow="Who we are"
                  title="An IT support business, first and last."
                />
              </Reveal>
              <Reveal delay={80}>
                <div className="mt-8 space-y-6 text-[1.05rem] leading-relaxed text-ink-soft">
                  <p>
                    We support corporate clients and we fulfil warranty on
                    behalf of principals. Those two roles pull in the same
                    direction: both are judged on whether a fault gets closed
                    inside the window that was agreed, and both depend on
                    having parts and engineers near the site that needs them.
                  </p>
                  <p>
                    That is why the network of 18 centres matters more than any
                    single capability. A four-hour response in Kuala Lumpur is
                    an ordinary promise. The same response in Bintulu, Sandakan
                    or Kota Bharu is what the network was built for.
                  </p>
                  <p>
                    Behind it sit 70 full-time professional support staff —
                    permanent employees rather than a contractor pool — carrying
                    the manufacturer accreditations for the platforms we are
                    appointed to service.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <div className="relative h-[24rem] overflow-hidden lg:h-[32rem]">
                <Parallax speed={70} className="absolute inset-x-0">
                  <Image
                    src="/media/svc-managed-services.jpg"
                    alt="Engineer checking a tablet beside racked servers"
                    fill
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                </Parallax>
              </div>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Vision / mission / commitment */}
      <section className="border-t border-rule bg-paper-warm py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="What we hold to"
              title="Three statements we are willing to be measured against"
            />
          </Reveal>
          <ul className="mt-14 grid gap-px bg-rule lg:grid-cols-3">
            {pillars.map((pillar, i) => (
              <Reveal
                as="li"
                key={pillar.label}
                delay={i * 100}
                className="bg-paper p-10"
              >
                <span className="flex h-12 w-12 items-center justify-center border border-rule text-brand">
                  <pillar.icon size={22} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <h3 className="mt-7 text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-brand">
                  {pillar.label}
                </h3>
                <p className="mt-4 text-[1.02rem] leading-relaxed text-ink">
                  {pillar.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <Positioning />
      <Coverage />
      <ContactCta />
    </>
  );
}
