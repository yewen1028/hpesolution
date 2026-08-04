import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import { PartnerMarquee } from "@/components/sections/partner-marquee";
import { ContactCta } from "@/components/sections/contact-cta";

export const metadata: Metadata = {
  title: "Business Partner",
  description:
    "The principals and distributors HPE Solutions is accredited to deploy, support and repair, including Cisco, Fortinet, Huawei, Microsoft, Sophos, Veeam and HP Enterprise.",
};

const domains = [
  {
    title: "Network & SD-WAN",
    body: "Routing, switching, load balancing and WAN optimisation, plus nationwide managed SD-WAN.",
    brands: ["Cisco", "Riverbed", "Peplink", "Huawei", "TM"],
  },
  {
    title: "Security",
    body: "Perimeter, endpoint and managed security across the platforms we hold accreditation on.",
    brands: ["Fortinet", "Sophos", "Sangfor", "Cyberoam"],
  },
  {
    title: "Wireless & infrastructure",
    body: "Enterprise WiFi, structured cabling and the passive infrastructure underneath it.",
    brands: ["Aruba", "Ruckus", "Dintek", "AMP"],
  },
  {
    title: "Platform & data protection",
    body: "Server, desktop and datacentre platforms, with backup and recovery tooling.",
    brands: ["HP Enterprise", "Microsoft", "Veeam", "Avaya"],
  },
];

export default function BusinessPartnerPage() {
  return (
    <>
      <PageHero
        eyebrow="Business partner"
        title="Authorised Support Partner to leading manufacturers."
        lede="We are appointed as an Authorised Support Partner by PC, server and network manufacturers. That appointment is what lets us carry their parts, close their claims and stand behind the SLA they promised their customers."
        image="/media/svc-sourcing.jpg"
        imageAlt="Warehouse racking stocked to floor-to-ceiling height"
        crumbs={[{ label: "Business Partner" }]}
      />

      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              title="Our technology domains"
              lede="Sourcing and support are the same conversation. These are the areas where our vendor relationships translate into equipment we can specify, deploy and then service ourselves."
            />
          </Reveal>

          <ul className="mt-16 grid gap-px bg-rule lg:grid-cols-2">
            {domains.map((domain, i) => (
              <Reveal
                as="li"
                key={domain.title}
                delay={(i % 2) * 100}
                className="bg-paper p-8 lg:p-12"
              >
                <h3 className="display-3">{domain.title}</h3>
                <p className="mt-4 text-[0.975rem] leading-relaxed text-ink-soft">
                  {domain.body}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {domain.brands.map((brand) => (
                    <li
                      key={brand}
                      className="border border-rule px-3.5 py-1.5 text-[0.8rem] font-medium text-ink-soft"
                    >
                      {brand}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <PartnerMarquee />
      <ContactCta />
    </>
  );
}
