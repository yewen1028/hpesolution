import { Reveal } from "@/components/reveal";
import { BackgroundVideo } from "@/components/video-band";
import { ButtonLink, Container } from "@/components/ui";
import { principles } from "@/lib/site";

const tiers = [
  { name: "Elite", coverage: "24 × 7", response: "4-hour response" },
  { name: "Premium", coverage: "8 × 5", response: "4-hour response" },
  { name: "Standard", coverage: "8 × 5", response: "Next business day" },
  { name: "Remote", coverage: "8 × 5", response: "Scheduled or ad-hoc" },
];

export function OperationsBand() {
  return (
    <section className="relative isolate overflow-hidden bg-paper-deep">
      <BackgroundVideo
        src="/media/about-operations.mp4"
        poster="/media/svc-helpdesk.jpg"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(100deg, rgb(16 21 27 / 0.95) 0%, rgb(16 21 27 / 0.88) 52%, rgb(16 21 27 / 0.7) 100%)",
        }}
      />

      <Container className="py-24 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <Reveal>
              <p className="eyebrow eyebrow-light">Service Level Assurance</p>
              <h2 className="display-2 mt-5 text-white">
                Support coverage built around your operating hours.
              </h2>
              <p className="lede mt-6 text-white/70">
                {principles.commitment} Coverage is written into the contract
                before work starts, so escalation is a procedure rather than a
                negotiation.
              </p>
            </Reveal>

            <Reveal delay={120}>
              <div className="mt-10">
                <ButtonLink href="/services/it-managed-services" variant="light">
                  How the contract runs
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={80}>
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Support tiers, coverage windows and response commitments
              </caption>
              <thead>
                <tr className="border-b border-white/20">
                  <th
                    scope="col"
                    className="pb-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/50"
                  >
                    Tier
                  </th>
                  <th
                    scope="col"
                    className="pb-4 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/50"
                  >
                    Coverage
                  </th>
                  <th
                    scope="col"
                    className="pb-4 text-right text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white/50"
                  >
                    Response
                  </th>
                </tr>
              </thead>
              <tbody>
                {tiers.map((tier) => (
                  <tr key={tier.name} className="border-b border-white/10">
                    <th
                      scope="row"
                      className="py-5 font-display text-lg font-semibold text-white"
                    >
                      {tier.name}
                    </th>
                    <td className="py-5 text-[0.95rem] tabular text-white/70">
                      {tier.coverage}
                    </td>
                    <td className="py-5 text-right text-[0.95rem] text-white/70">
                      {tier.response}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
