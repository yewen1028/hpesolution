import { Mail, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ButtonLink, Container } from "@/components/ui";
import { Typewriter } from "@/components/typewriter";
import { DrawIcon } from "@/components/draw-icon";
import { caseStudies, contact } from "@/lib/site";

/*
 * Derived from the case studies, deduplicated and kept in their published
 * order. Adding an engagement in a new sector adds a phrase here for free;
 * removing the last one in a sector drops it, so the line can never claim a
 * sector the site cannot evidence.
 */
const sectorPhrases = Array.from(
  new Set(caseStudies.map((study) => study.sector)),
).map((sector) => `${sector} estate.`);

export function ContactCta() {
  return (
    <section className="border-t border-rule py-24 sm:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-24">
          <Reveal>
            <p className="eyebrow">Get in touch</p>
            {/*
              The rotating half is real: every phrase is a sector HPE actually
              has a published engagement in, read from `caseStudies` rather than
              typed in here, so the claim cannot drift from the case studies
              two sections up. "estate" is the section's own word — the lede
              below already says "Send us the estate".
            */}
            <h2 className="display-2 mt-5">
              Let us support your{" "}
              <Typewriter
                phrases={sectorPhrases}
                className="text-brand"
                screenReaderText="banking, retail, telecommunications, media, aviation, oil and gas and government estate, nationwide."
              />
            </h2>
            <p className="lede mt-6 max-w-xl">
              Send us the estate — sites, node count, the hours that matter —
              and we will come back with a coverage model and a response time
              you can hold us to.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/contact">Start a conversation</ButtonLink>
              <ButtonLink
                href={`tel:${contact.phoneDial}`}
                variant="ghost"
                external
              >
                {contact.phoneDisplay}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <dl className="border-t border-rule">
              <div className="flex gap-5 border-b border-rule py-6">
                <dt className="shrink-0 pt-0.5 text-brand">
                  <DrawIcon>
                    <MapPin size={19} strokeWidth={1.75} aria-hidden="true" />
                  </DrawIcon>
                  <span className="sr-only">Office</span>
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
                  <DrawIcon delay={110}>
                    <Phone size={19} strokeWidth={1.75} aria-hidden="true" />
                  </DrawIcon>
                  <span className="sr-only">Telephone</span>
                </dt>
                <dd>
                  <a
                    href={`tel:${contact.phoneDial}`}
                    className="text-ink transition-colors hover:text-brand"
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
                    {/* Three of these render, so they share one offset. */}
                    <DrawIcon delay={220}>
                      <Mail size={19} strokeWidth={1.75} aria-hidden="true" />
                    </DrawIcon>
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
        </div>
      </Container>
    </section>
  );
}
