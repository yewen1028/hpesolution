import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import { ContactCta } from "@/components/sections/contact-cta";
import { caseStudies } from "@/lib/site";

export const metadata: Metadata = {
  title: "Case Study",
  description:
    "Representative HPE Solutions engagements across banking, retail, telecommunications, media, aviation, oil and gas, and government.",
};

const disciplines = [
  "IT Management & Support",
  "Project Management & Deployment",
] as const;

export default function CaseStudyPage() {
  return (
    <>
      <PageHero
        eyebrow="Case study"
        title="The engagements, at the scale they were run."
        lede="Node counts, outlet counts and response windows describe this work better than adjectives do. These are the contracts that shaped how we staff and stock the network."
        image="/media/case-telco.jpg"
        imageAlt="Telecommunications and network infrastructure equipment"
        crumbs={[{ label: "Case Study" }]}
      />

      {disciplines.map((discipline, di) => {
        const items = caseStudies.filter((c) => c.discipline === discipline);

        return (
          <section
            key={discipline}
            className={`py-24 sm:py-32 ${
              di % 2 === 1 ? "border-t border-rule bg-paper-warm" : ""
            }`}
          >
            <Container>
              <Reveal>
                <SectionHeading
                  eyebrow={di === 0 ? "Ongoing support" : "Delivered projects"}
                  title={discipline}
                />
              </Reveal>

              <ul className="mt-16 space-y-px bg-rule">
                {items.map((study, i) => (
                  <Reveal
                    as="li"
                    key={`${study.title}-${i}`}
                    delay={(i % 3) * 90}
                    className="bg-paper"
                  >
                    <article className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-64">
                        <Image
                          src={study.image}
                          alt={study.imageAlt}
                          fill
                          sizes="(min-width: 1024px) 40vw, 100vw"
                          className="object-cover"
                        />
                        <span className="absolute left-0 top-0 bg-brand px-3.5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white">
                          {study.sector}
                        </span>
                      </div>

                      <div className="flex flex-col justify-center p-8 lg:p-12">
                        <h3 className="display-3">{study.title}</h3>
                        <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-ink-soft">
                          {study.body}
                        </p>
                        <dl className="mt-8 flex flex-wrap gap-x-14 gap-y-6 border-t border-rule pt-6">
                          {study.metrics.map((metric) => (
                            <div key={metric.label}>
                              <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                {metric.label}
                              </dt>
                              <dd className="tabular mt-1.5 font-display text-2xl font-semibold text-ink">
                                {metric.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </ul>
            </Container>
          </section>
        );
      })}

      <ContactCta />
    </>
  );
}
