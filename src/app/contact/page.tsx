import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { EnquiryForm } from "@/components/enquiry-form";
import { Container, SectionHeading } from "@/components/ui";
import { contact, regions } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach HPE Solutions in Puchong, Selangor: sales, technical support and HR contacts, plus nationwide service centre coverage.",
};

const totalCentres = regions.reduce((n, r) => n + r.centres.length, 0);

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to our team about your IT support."
        lede="Send us the sites, the node count and the hours that matter. We will come back with a coverage model, a tier and a response time you can hold us to."
        image="/media/contact-support.jpg"
        imageAlt="Aisle of racked servers in a datacentre"
        crumbs={[{ label: "Contact" }]}
      />

      <section className="py-24 sm:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
            {/* Details */}
            <div>
              <Reveal>
                <SectionHeading eyebrow="Head office" title="Puchong, Selangor" />
              </Reveal>

              <Reveal delay={80}>
                <dl className="mt-10 border-t border-rule">
                  <div className="flex gap-5 border-b border-rule py-6">
                    <dt className="shrink-0 pt-0.5 text-brand">
                      <MapPin size={19} strokeWidth={1.75} aria-hidden="true" />
                      <span className="sr-only">Address</span>
                    </dt>
                    <dd>
                      <address className="not-italic leading-relaxed text-ink">
                        {contact.addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    </dd>
                  </div>

                  <div className="flex gap-5 border-b border-rule py-6">
                    <dt className="shrink-0 pt-0.5 text-brand">
                      <Phone size={19} strokeWidth={1.75} aria-hidden="true" />
                      <span className="sr-only">Office telephone</span>
                    </dt>
                    <dd>
                      <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                        Office
                      </span>
                      <a
                        href={`tel:${contact.phoneDial}`}
                        className="mt-1 block font-display text-xl font-semibold text-ink transition-colors hover:text-brand"
                      >
                        {contact.phoneDisplay}
                      </a>
                    </dd>
                  </div>

                  {contact.emails.map((email) => (
                    <div
                      key={email.address}
                      className="flex gap-5 border-b border-rule py-6"
                    >
                      <dt className="shrink-0 pt-0.5 text-brand">
                        <Mail size={19} strokeWidth={1.75} aria-hidden="true" />
                        <span className="sr-only">{email.label}</span>
                      </dt>
                      <dd>
                        <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                          {email.label}
                        </span>
                        <a
                          href={`mailto:${email.address}`}
                          className="mt-1 block text-ink transition-colors hover:text-brand"
                        >
                          {email.address}
                        </a>
                      </dd>
                    </div>
                  ))}
                </dl>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-8 border-l-2 border-brand pl-5 text-[0.95rem] leading-relaxed text-ink-soft">
                  For faults on an existing contract, go straight to the 24 × 7
                  helpdesk on the number above. It reaches the ticketing queue
                  directly, wherever the fault sits across our {totalCentres}{" "}
                  centres.
                </p>
              </Reveal>
            </div>

            {/* Enquiry form */}
            <div>
              <Reveal>
                <SectionHeading
                  title="Send us your enquiry"
                />
              </Reveal>
              <Reveal delay={100}>
                <div className="mt-10">
                  <EnquiryForm />
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      {/* Map */}
      <section className="border-t border-rule">
        <h2 className="sr-only">Head office location</h2>
        <iframe
          title="Map showing HPE Solutions at Setia Walk, Pusat Bandar Puchong"
          src="https://www.openstreetmap.org/export/embed.html?bbox=101.6096%2C3.0281%2C101.6296%2C3.0421&layer=mapnik&marker=3.0351%2C101.6196"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[26rem] w-full border-0 grayscale-[0.35]"
        />
      </section>
    </>
  );
}
