import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { ServicesGrid } from "@/components/sections/services-grid";
import { OperationsBand } from "@/components/sections/operations-band";
import { ContactCta } from "@/components/sections/contact-cta";

export const metadata: Metadata = {
  title: "Services",
  description:
    "IT support and managed services, project deployment, helpdesk, staffing, authorised warranty fulfilment, total solution sourcing and value added services across Malaysia.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Support that is contracted, measured and reported."
        lede="Seven service lines covering the full life of an IT estate — from sourcing and deployment through daily support, warranty fulfilment and eventual relocation."
        image="/media/band-network-rack.jpg"
        imageAlt="Network equipment racks in a datacentre aisle"
        crumbs={[{ label: "Services" }]}
      />
      <ServicesGrid
        eyebrow="Service lines"
        title="Choose the scope that fits the estate"
        lede="Each service is priced and measured on its own terms. Most clients combine two or three, with a single point of escalation across all of them."
      />
      <OperationsBand />
      <ContactCta />
    </>
  );
}
