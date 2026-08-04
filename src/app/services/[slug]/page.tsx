import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactCta } from "@/components/sections/contact-cta";
import { Container, SectionHeading, ServiceIcon } from "@/components/ui";
import { SectionNav } from "@/components/section-nav";
import { ScrollTimeline } from "@/components/scroll-timeline";
import { getService, services } from "@/lib/site";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.title,
    description: service.short,
    openGraph: { title: service.title, description: service.short },
  };
}

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  // Only sections this service actually renders. `scope` and `tiers` are
  // optional in the data, and a nav entry pointing at a missing id would
  // scroll nowhere and never highlight.
  const sectionLinks = [
    { id: "features", label: "Features" },
    ...(service.scope?.length ? [{ id: "scope", label: "Scope" }] : []),
    ...(service.tiers?.length ? [{ id: "tiers", label: "Service tiers" }] : []),
    { id: "benefits", label: "Benefits" },
  ];

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={service.title}
        lede={service.summary}
        image={service.image}
        imageAlt={service.imageAlt}
        crumbs={[
          { label: "Services", href: "/services" },
          { label: service.title },
        ]}
      />

      <SectionNav links={sectionLinks} />

      {/* Features */}
      <section id="features" className="scroll-mt-28 py-24 sm:py-32">
        <Container>
          <Reveal>
            <div className="flex items-start gap-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-rule text-brand">
                <ServiceIcon name={service.icon} size={26} />
              </span>
              <SectionHeading
                title={service.featureHeading}
              />
            </div>
          </Reveal>

          {/*
            Sequential features render as a scroll-linked timeline; catalogue
            features keep the two-column grid. The flag lives in `site.ts` with
            the content it describes.
          */}
          {service.featureFlow ? (
            <div className="mt-14 border-t border-rule pt-10">
              <ScrollTimeline steps={service.features} />
            </div>
          ) : (
            <ul className="mt-14 grid border-t border-rule md:grid-cols-2">
              {service.features.map((feature, i) => (
                <Reveal
                  as="li"
                  key={feature.title}
                  delay={(i % 2) * 90}
                  className="border-b border-rule py-8 pr-0 md:[&:nth-child(odd)]:border-r md:[&:nth-child(odd)]:pr-12 md:[&:nth-child(even)]:pl-12"
                >
                  <h3 className="flex items-baseline gap-4 font-display text-lg font-semibold text-ink">
                    <span className="tabular text-[0.8rem] font-semibold tracking-[0.1em] text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {feature.title}
                  </h3>
                  <p className="mt-3 pl-[2.4rem] text-[0.95rem] leading-relaxed text-ink-soft">
                    {feature.body}
                  </p>
                </Reveal>
              ))}
            </ul>
          )}
        </Container>
      </section>

      {/* Optional procedural scope */}
      {service.scope?.map((block) => (
        <section
          key={block.heading}
          id="scope"
          className="scroll-mt-28 border-t border-rule bg-paper-warm py-24 sm:py-32"
        >
          <Container>
            <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
              <Reveal>
                <SectionHeading title={block.heading} />
              </Reveal>
              <Reveal delay={100}>
                <ul className="grid gap-x-12 sm:grid-cols-2">
                  {block.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3.5 border-b border-rule py-4 text-[0.95rem] leading-relaxed text-ink-soft"
                    >
                      <Check
                        size={17}
                        strokeWidth={2.25}
                        className="mt-0.5 shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </Container>
        </section>
      ))}

      {/* Optional tier table */}
      {service.tiers && (
        <section id="tiers" className="scroll-mt-28 border-t border-rule py-24 sm:py-32">
          <Container>
            <Reveal>
              <SectionHeading
                eyebrow="Service tiers"
                title="Coverage windows and response commitments"
                lede="The tier is agreed before the contract starts and written into the SLA."
              />
            </Reveal>
            <Reveal delay={100}>
              <table className="mt-12 w-full border-collapse text-left">
                <caption className="sr-only">
                  {service.title} tiers, coverage and response
                </caption>
                <thead>
                  <tr className="border-b border-rule-strong">
                    <th
                      scope="col"
                      className="pb-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-muted"
                    >
                      Tier
                    </th>
                    <th
                      scope="col"
                      className="pb-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-muted"
                    >
                      Coverage
                    </th>
                    <th
                      scope="col"
                      className="pb-4 text-right text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-muted"
                    >
                      Response
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {service.tiers.map((tier) => (
                    <tr key={tier.name} className="border-b border-rule">
                      <th
                        scope="row"
                        className="py-5 font-display text-lg font-semibold text-ink"
                      >
                        {tier.name}
                      </th>
                      <td className="tabular py-5 text-[0.95rem] text-ink-soft">
                        {tier.coverage}
                      </td>
                      <td className="py-5 text-right text-[0.95rem] text-ink-soft">
                        {tier.response}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </Container>
        </section>
      )}

      {/* Benefits */}
      <section id="benefits" className="scroll-mt-28 border-t border-rule bg-paper-warm py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              title="What changes once this is contracted out"
            />
          </Reveal>
          <ul className="mt-14 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {service.benefits.map((benefit, i) => (
              <Reveal
                as="li"
                key={benefit.title}
                delay={(i % 4) * 80}
                className="bg-paper p-8"
              >
                <h3 className="font-display text-lg font-semibold text-ink">
                  {benefit.title}
                </h3>
                <p className="mt-3 text-[0.925rem] leading-relaxed text-ink-soft">
                  {benefit.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      {/* Sibling services */}
      <section className="border-t border-rule py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading title="Related services" />
          </Reveal>
          <ul className="mt-12 grid border-t border-rule md:grid-cols-3">
            {others.map((other, i) => (
              <Reveal
                as="li"
                key={other.slug}
                delay={i * 90}
                className="border-b border-rule md:[&:not(:last-child)]:border-r"
              >
                <Link
                  href={`/services/${other.slug}`}
                  className="group flex h-full flex-col p-8 transition-colors hover:bg-paper-warm"
                >
                  <span className="text-brand">
                    <ServiceIcon name={other.icon} size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                    {other.title}
                  </h3>
                  <p className="mt-2.5 flex-1 text-[0.925rem] leading-relaxed text-ink-soft">
                    {other.short}
                  </p>
                  <ArrowRight
                    size={17}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="mt-6 text-ink-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand"
                  />
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <ContactCta />
    </>
  );
}
