import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Container, SectionHeading } from "@/components/ui";
import { CoverageMap } from "@/components/coverage-map";
import { NetworkMap } from "@/components/network-map";
import { ContactCta } from "@/components/sections/contact-cta";
import { allCentres } from "@/lib/site";

export const metadata: Metadata = {
  title: "Coverage Map",
  description:
    "An interactive map of all 18 HPE Solutions service centres across Peninsular Malaysia, Sabah, Sarawak and Labuan.",
};

export default function CoverageMapPage() {
  return (
    <>
      <PageHero
        eyebrow="Coverage map"
        title="Every centre, plotted."
        lede="The same eighteen centres as the directory, placed on the map. Distance to the nearest one is what a four-hour response actually depends on."
        image="/media/coverage-kl.jpg"
        imageAlt="Aerial view of the Kuala Lumpur skyline at night"
        crumbs={[
          { label: "Service Centre", href: "/service-centre" },
          { label: "Coverage Map" },
        ]}
      />

      <section className="py-24 sm:py-32">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow="Nationwide"
              title={`${allCentres.length} centres on one map`}
              lede="Peninsular Malaysia, Sabah, Sarawak and Labuan. Head office in Puchong carries contract administration, the helpdesk and central parts coordination."
            />
          </Reveal>

          {/* NetworkMap is a server component passed through as a prop, so its
              SVG is prerendered even though the stage around it is client-side. */}
          <div className="mt-16">
            <CoverageMap networkMap={<NetworkMap />} />
          </div>
        </Container>
      </section>

      <ContactCta />
    </>
  );
}
