import Image from "next/image";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container, SectionHeading } from "@/components/ui";
import { caseStudies } from "@/lib/site";

export function CasePreview() {
  const featured = caseStudies.slice(0, 3);

  return (
    <section className="py-24 sm:py-32">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-8">
          <Reveal>
            <SectionHeading
              eyebrow="Case study"
              title="Work at the scale it was actually delivered"
              lede="A representative slice of the contracts running today, described by the numbers that defined them."
            />
          </Reveal>
          <Reveal delay={120}>
            <ButtonLink href="/case-study" variant="ghost">
              All case studies
            </ButtonLink>
          </Reveal>
        </div>

        <ul className="mt-16 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((study, i) => (
            <Reveal
              as="li"
              key={study.title}
              delay={i * 100}
              className="flex flex-col bg-paper"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={study.image}
                  alt={study.imageAlt}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute left-0 top-0 bg-brand px-3.5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-white">
                  {study.sector}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-8">
                <h3 className="display-3">{study.title}</h3>
                <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-soft">
                  {study.body}
                </p>
                <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-rule pt-6">
                  {study.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                        {metric.label}
                      </dt>
                      <dd className="tabular mt-1.5 font-display text-xl font-semibold text-ink">
                        {metric.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          ))}
        </ul>
      </Container>
    </section>
  );
}
