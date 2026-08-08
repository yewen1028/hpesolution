import type { Metadata } from "next";
import { Media } from "@/components/media";
import { CaseRow } from "@/components/case-row";
import DiagonalMarquee from "@/components/ui/diagonal-marquee";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ScrollDrift } from "@/components/scroll-drift";
import {
  READING_DRIFT,
  ScrollStage,
  SETTLED_EXIT_SPAN,
} from "@/components/scroll-stage";
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

/*
 * The masthead backdrop. Nine stills, every one of them already in
 * `public/media` and already checked by eye against the section it serves —
 * these are the pairings recorded in `services` and used on the service pages,
 * reused here rather than a fresh set sourced blind.
 *
 * The `title` is for the component's own API; the field is `aria-hidden`, so
 * none of it is announced. The photographs that carry alt text on this page are
 * the ones in the case rows below.
 */
const MARQUEE_CARDS = [
  { id: 1, url: "/media/svc-managed-services.jpg", title: "Managed services" },
  { id: 2, url: "/media/svc-project-deployment.jpg", title: "Deployment" },
  { id: 3, url: "/media/svc-helpdesk.jpg", title: "Helpdesk" },
  { id: 4, url: "/media/svc-staffing.jpg", title: "Staffing" },
  { id: 5, url: "/media/svc-warranty.jpg", title: "Warranty" },
  { id: 6, url: "/media/svc-sourcing.jpg", title: "Sourcing" },
  { id: 7, url: "/media/svc-value-added.jpg", title: "Value added" },
  { id: 8, url: "/media/band-network-rack.jpg", title: "Network" },
  { id: 9, url: "/media/contact-support.jpg", title: "Datacentre" },
];

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
        /*
          A contact sheet of the work, drifting behind the masthead.

          Deliberately **not** the eight case photographs: every one of those
          appears in a row further down this page, and a hero that previews the
          page it sits on is a page that says everything twice. These are the
          service stills instead — engineers at racks, a helpdesk desk, a memory
          module going into a chassis — which are the same work seen from the
          other side, and none of them appears anywhere else on this page.
        */
        backdrop={<DiagonalMarquee cards={MARQUEE_CARDS} />}
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
                {items.map((study, i) => {
                  /*
                    The picture changes sides down the list. Five rows built
                    identically read as a template; alternating them gives the
                    page a rhythm and costs one `order` class, and the seam
                    between picture and type moves with it so the eye has
                    something new to land on each time.

                    It is also what decides which way each half arrives: every
                    column enters from the outside edge it occupies, so the row
                    assembles inward towards its own seam. Reading that off the
                    same expression as the `order` class is what keeps the two
                    from disagreeing — a picture that sits right and arrives
                    from the left crosses the type on its way in.
                  */
                  const pictureFirst = i % 2 === 0;

                  return (
                  <li key={`${study.title}-${i}`} className="bg-paper">
                    <CaseRow>
                      {/*
                        `case-row__body` carries the departure. It cannot go on
                        `CaseRow` itself — see the note there.
                      */}
                      <article className="case-row__body grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                        <Reveal
                          as="div"
                          from={pictureFirst ? "left" : "right"}
                          className={`case-row__media relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-64 ${
                            pictureFirst ? "" : "lg:order-2"
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
                        </Reveal>

                        {/*
                          The type follows the picture in rather than landing
                          with it. 120ms is enough to read as an order of
                          arrival and short enough that the row still assembles
                          as one gesture.
                        */}
                        <Reveal
                          as="div"
                          from={pictureFirst ? "right" : "left"}
                          delay={120}
                          className="flex flex-col justify-center p-8 lg:p-12"
                        >
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
                        </Reveal>
                      </article>
                    </CaseRow>
                  </li>
                  );
                })}
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

        **It is a register, and it is now laid out as one.** It used to be four
        equal cells in a two-column grid, which is the wrong container for this
        content twice over. The groups hold 3, 2, 6 and 9 entries, and a grid
        row equalises to its tallest cell — so the two-item helpdesk group sat
        beside the nine-item sourcing group and spent most of its height empty.
        That is the same hollow-cell failure recorded in `services-grid.tsx`,
        and it cannot be fixed by writing more copy, because the copy is a
        register of work rather than prose.

        So each group is a full-width band instead: the contract type on a left
        rail with a count, the entries ruled beneath one another on the right,
        and the sectors in their own column against a hairline. Nothing is
        equalised against anything, so nothing has a void to fill. The sector
        column is the part worth keeping — a reader arriving here is looking
        for their own industry, and aligned into a column the recurrences are
        visible down the page in a way they were not when each tag list hung
        under its own sentence.

        Deliberately not here: **numbering.** Same reason as the services grid
        — these are parallel entries in a register, not steps, and 01/02/03
        would assert a sequence the content does not have. The count on each
        rail is a real fact about the group; an index number would not be.
      */}
      <ScrollStage variant="rise" exitSpan={SETTLED_EXIT_SPAN}>
        <section className="border-t border-rule py-24 sm:py-32">
          <Container>
            <Reveal>
              <SectionHeading
                title="Further engagements"
                lede="Support partner appointments, helpdesk and staffing contracts, and sourcing work, listed by the sector each was delivered for."
              />
            </Reveal>

            {/*
              The figure for this section, and it plays on arrival and on
              departure only — `READING_DRIFT`, because the register is several
              screens tall and the default spans would resolve both phases with
              it all but off screen.

              The rail and the entries counter-drift: the contract type leads,
              its entries follow, and on the way out the name leaves first. The
              hairlines belong to the group and stay put while the type moves
              inside them, which is the same figure the case rows above use for
              their photographs — one page, one idea about what moves.
            */}
            <ScrollDrift className="mt-16" phasing={READING_DRIFT}>
              <div className="ledger border-t border-rule">
                {engagementGroups.map((group, gi) => (
                  <Reveal
                    as="section"
                    key={group.name}
                    delay={gi * 70}
                    className="ledger__group border-b border-rule py-9 lg:grid lg:grid-cols-[minmax(0,15rem)_1fr] lg:gap-10 lg:py-11"
                  >
                    <div className="ledger__rail">
                      <h3 className="font-display text-sm font-semibold uppercase leading-snug tracking-[0.14em] text-ink">
                        {group.name}
                      </h3>
                      {/*
                        How much is under this heading, which is the one thing
                        the rail can say that the entries do not.
                      */}
                      <p className="tabular mt-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {group.items.length} listed
                      </p>
                    </div>

                    <ul className="ledger__entries mt-7 lg:mt-0">
                      {group.items.map((item) => (
                        <li
                          key={item.body}
                          className="ledger__row border-b border-rule py-4 last:border-b-0 last:pb-0 sm:grid sm:grid-cols-[1fr_minmax(0,14rem)] sm:gap-8 lg:border-l lg:pl-8"
                        >
                          <p className="ledger__body text-[0.95rem] leading-relaxed text-ink-soft transition-colors duration-300">
                            {item.body}
                          </p>
                          {/*
                            The tag column keeps its hairline whether or not the
                            entry carries sectors — three of them do not, and a
                            rule that came and went down the column would read
                            as a mistake rather than as an absence.
                          */}
                          <p className="ledger__tags mt-2 text-[0.72rem] font-semibold uppercase leading-relaxed tracking-[0.12em] text-ink-muted sm:mt-0 sm:border-l sm:border-rule sm:pl-6">
                            {item.sectors.map((sector) => (
                              <span key={sector}>{sector}</span>
                            ))}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                ))}
              </div>
            </ScrollDrift>
          </Container>
        </section>
      </ScrollStage>

      <ContactCta />
    </>
  );
}
