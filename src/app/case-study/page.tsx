import type { Metadata } from "next";
import { Media } from "@/components/media";
import { CaseRow } from "@/components/case-row";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { FolderOpen } from "lucide-react";
import { CounterText } from "@/components/counter";
import { EmptyState } from "@/components/empty-state";
import { Container, SectionHeading } from "@/components/ui";
import { ContactCta } from "@/components/sections/contact-cta";
import { caseStudies, engagementGroups } from "@/lib/site";

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
        title="Proven at nationwide scale, across every sector."
        lede="Node counts, outlet counts and response windows describe this work better than adjectives do. These are the contracts that shaped how we staff and stock the network."
        image="/media/case-telco.jpg"
        imageAlt="Engineers working on rooftop cellular antenna equipment"
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

              {items.length === 0 ? (
                <div className="mt-16">
                  <EmptyState
                    icon={FolderOpen}
                    title="No published engagements yet"
                    body={`We have not published a ${discipline.toLowerCase()} engagement for this discipline yet. The work is running; the write-ups follow once clients approve them.`}
                    action={{ href: "/contact", label: "Ask about this work" }}
                  />
                </div>
              ) : (
              <ul className="mt-16 space-y-px bg-rule">
                {items.map((study, i) => (
                  <Reveal
                    as="li"
                    key={`${study.title}-${i}`}
                    delay={(i % 3) * 90}
                    className="bg-paper"
                  >
                    <CaseRow>
                      <article className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                        {/*
                          The picture changes sides down the list. Five rows
                          built identically read as a template; alternating them
                          gives the page a rhythm and costs one `order` class,
                          and the seam between picture and type moves with it so
                          the eye has something new to land on each time.
                        */}
                        <div
                          className={`case-row__media relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-64 ${
                            i % 2 === 1 ? "lg:order-2" : ""
                          }`}
                        >
                          <Media
                            src={study.image}
                            alt={study.imageAlt}
                            fill
                            sizes="(min-width: 1024px) 40vw, 100vw"
                            className="case-row__image object-cover"
                          />
                          <span className="absolute left-0 top-0 z-10 bg-brand px-3.5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white">
                            {study.sector}
                          </span>
                        </div>

                        <div className="flex flex-col justify-center p-8 lg:p-12">
                          {/*
                            The same numbering the services grid uses, so a
                            reader who has seen one list recognises the other.
                            Decorative in the sense that the heading already
                            identifies the row — hidden from assistive tech
                            rather than read out as a stray number.
                          */}
                          <span
                            aria-hidden="true"
                            className="tabular mb-4 block text-[0.8rem] font-semibold tracking-[0.1em] text-brand"
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>

                          <h3 className="display-3">{study.title}</h3>
                          <p className="mt-4 max-w-2xl text-[0.975rem] leading-relaxed text-ink-soft">
                            {study.body}
                          </p>
                          <dl className="case-row__metrics mt-8 flex flex-wrap gap-x-14 gap-y-6 border-t border-rule pt-6">
                            {study.metrics.map((metric) => (
                              <div key={metric.label}>
                                <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                                  {metric.label}
                                </dt>
                                <dd className="tabular mt-1.5 font-display text-2xl font-semibold text-ink">
                                  <CounterText>{metric.value}</CounterText>
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </article>
                    </CaseRow>
                  </Reveal>
                ))}
              </ul>
              )}
            </Container>
          </section>
        );
      })}

      {/*
        The other four headings from hpe.com.my's case study page. The source
        lists these as short capability statements tagged with the client's
        sector, with no node counts or response windows, so they are rendered
        as the hairline list they are rather than dressed up as engagements
        with metrics they do not have.
      */}
      <section className="border-t border-rule py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              title="Further engagements"
              lede="Support partner appointments, helpdesk and staffing contracts, and sourcing work, listed by the sector each was delivered for."
            />
          </Reveal>

          <div className="mt-16 grid gap-px bg-rule lg:grid-cols-2">
            {engagementGroups.map((group, gi) => (
              <Reveal
                key={group.name}
                delay={(gi % 2) * 90}
                className="bg-paper p-8 lg:p-10"
              >
                <h3 className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink">
                  {group.name}
                </h3>
                <ul className="mt-6 border-t border-rule">
                  {group.items.map((item) => (
                    <li key={item.body} className="border-b border-rule py-4">
                      <p className="text-[0.95rem] leading-relaxed text-ink-soft">
                        {item.body}
                      </p>
                      {item.sectors.length > 0 && (
                        <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                          {item.sectors.map((sector) => (
                            <span key={sector}>{sector}</span>
                          ))}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <ContactCta />
    </>
  );
}
