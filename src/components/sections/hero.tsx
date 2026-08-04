import { Media } from "@/components/media";
import { Parallax } from "@/components/parallax";
import { Reveal } from "@/components/reveal";
import { AnimatedText } from "@/components/animated-text";
import { Magnetic } from "@/components/magnetic";
import { ButtonLink, Container } from "@/components/ui";
import { stats } from "@/lib/site";
import { Counter } from "@/components/counter";

export function Hero() {
  return (
    <section
      data-site-hero
      className="relative isolate overflow-hidden bg-paper-deep"
    >
      <Parallax speed={130} className="absolute inset-x-0 -z-10">
        <Media
          src="/media/hero-datacentre.jpg"
          alt="Server hardware and structured cabling inside a datacentre"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </Parallax>

      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(105deg, rgb(16 21 27 / 0.94) 0%, rgb(16 21 27 / 0.86) 46%, rgb(16 21 27 / 0.6) 100%)",
        }}
      />

      <Container className="pb-20 pt-24 sm:pb-28 sm:pt-32 lg:pb-32 lg:pt-40">
        <div className="max-w-4xl">
          <Reveal>
            <p className="eyebrow eyebrow-light">
              IT support &amp; managed services · Nationwide Malaysia
            </p>
          </Reveal>

          {/*
            Not wrapped in <Reveal>: AnimatedText carries its own observer, and
            fading the block in while the words also stagger reads as two
            competing animations on the first thing the visitor sees.
          */}
          <AnimatedText
            as="h1"
            text={"Malaysia's established\nIT support service provider."}
            className="display-1 mt-7 text-white"
            delay={80}
            stagger={48}
          />

          <Reveal delay={160}>
            <p className="lede mt-8 max-w-2xl text-white/72">
              HPE Solutions has spent over a decade keeping Malaysian
              infrastructure running: 70 full-time engineers, 18 service
              centres, and more than 50,000 customer nodes under contract.
              Support is delivered against a written SLA, not a best effort.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              {/* The one primary action in this view gets the magnet. */}
              <Magnetic>
                <ButtonLink href="/services">Explore our services</ButtonLink>
              </Magnetic>
              <ButtonLink href="/contact" variant="light">
                Talk to our team
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </Container>

      {/* Figure strip anchored to the base of the hero. */}
      <div className="border-t border-white/12 bg-black/25 backdrop-blur-sm">
        <Container>
          <dl className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 90}
                className={`px-1 py-8 sm:py-10 ${
                  i % 2 === 1 ? "border-l border-white/12 pl-6" : ""
                } ${i >= 2 ? "border-t border-white/12 lg:border-t-0" : ""} ${
                  i === 2 ? "lg:border-l lg:border-white/12 lg:pl-6" : ""
                } ${i === 3 ? "lg:pl-6" : ""}`}
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="display-2 block font-display font-semibold text-white">
                    <Counter
                      value={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </span>
                  <span className="mt-2.5 block text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-brand">
                    {stat.label}
                  </span>
                  <span className="mt-2 block max-w-[26ch] text-[0.85rem] leading-relaxed text-white/55">
                    {stat.note}
                  </span>
                </dd>
              </Reveal>
            ))}
          </dl>
        </Container>
      </div>
    </section>
  );
}
