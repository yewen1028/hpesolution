import { Hero } from "@/components/sections/hero";
import { Positioning } from "@/components/sections/positioning";
import { ServicesGrid } from "@/components/sections/services-grid";
import { OperationsBand } from "@/components/sections/operations-band";
import { CasePreview } from "@/components/sections/case-preview";
import { Coverage } from "@/components/sections/coverage";
import { Partners } from "@/components/sections/partners";
import { ContactCta } from "@/components/sections/contact-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServicesGrid />
      <OperationsBand />
      <Positioning />
      <CasePreview />
      <Coverage />
      <Partners />
      <ContactCta />
    </>
  );
}
