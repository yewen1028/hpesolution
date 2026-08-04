import { Media } from "@/components/media";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Parallax, ParallaxWindow } from "./parallax";
import { Reveal } from "./reveal";
import { AnimatedText } from "./animated-text";

// Lives in its own module so client components can take the glyphs without
// pulling this file's parallax and reveal tree with them. Re-exported so every
// existing `import { ServiceIcon } from "@/components/ui"` keeps working.
export { ServiceIcon } from "./service-icon";

/** Page-width container. One horizontal rhythm across the whole site. */
export function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[88rem] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = "left",
  tone = "dark",
  animate = false,
  underline = false,
}: {
  /**
   * Optional, and it should stay rare.
   *
   * An eyebrow above every section heading produces a templated rhythm: the
   * reader stops seeing the labels and starts seeing the pattern. The rule
   * this site now follows is roughly one per three sections, and the test is
   * whether the eyebrow carries something the headline does not. "Our
   * services" over "Seven service lines, one support partner" fails it.
   * "Service Level Assurance" over "Support coverage built around your
   * operating hours" passes: SLA is the contractual term, and the headline
   * never says it.
   *
   * Where a section sits on the page already tells the reader what kind of
   * section it is. Most of the time the honest answer is no label at all.
   */
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  /**
   * Splits the title into words and staggers them in on scroll.
   *
   * Opt-in, and deliberately not the default: most section headings are
   * already inside a `<Reveal>`, and a block that fades up while its words
   * also stagger reads as two animations fighting. A caller that passes
   * `animate` must drop its own `<Reveal>` wrapper — this component then
   * reveals the eyebrow and lede itself.
   */
  animate?: boolean;
  /** Wipes the brand rule in under the title once the words have landed. */
  underline?: boolean;
}) {
  const wrapper =
    align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl";
  // No eyebrow means no gap to close above the title.
  const titleClass = `display-2 ${eyebrow ? "mt-5" : ""} ${
    tone === "light" ? "text-white" : ""
  }`;
  const ledeClass = `lede mt-6 ${tone === "light" ? "text-white/70" : ""} ${
    align === "center" ? "mx-auto" : ""
  }`;
  const eyebrowClass = `eyebrow ${tone === "light" ? "eyebrow-light" : ""}`;

  if (animate) {
    return (
      <div className={wrapper}>
        {eyebrow && (
          <Reveal as="p" className={eyebrowClass}>
            {eyebrow}
          </Reveal>
        )}
        <AnimatedText
          as="h2"
          text={title}
          className={titleClass}
          underline={underline}
          stagger={44}
        />
        {lede && (
          <Reveal as="p" delay={220} className={ledeClass}>
            {lede}
          </Reveal>
        )}
      </div>
    );
  }

  return (
    <div className={wrapper}>
      {eyebrow && <p className={eyebrowClass}>{eyebrow}</p>}
      <h2 className={titleClass}>{title}</h2>
      {lede && <p className={ledeClass}>{lede}</p>}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "light";
  external?: boolean;
}) {
  const base =
    "group inline-flex items-center gap-2.5 px-6 py-3.5 text-[0.925rem] font-semibold transition-colors";
  const styles = {
    // `btn-fill` wipes --color-brand-strong across from the entry edge; the
    // colour swap it replaces was instant.
    primary: "btn-fill btn-shine bg-brand text-white",
    ghost: "border border-rule-strong text-ink hover:border-ink hover:bg-paper-warm",
    /*
     * A white chip on a band that is dark in both themes, so both of its
     * colours have to be theme-independent. `text-ink` was themed and inverted
     * to off-white in dark mode, leaving white text on a white button.
     *
     * The hover keeps the fixed ink rather than switching to white: #14181d on
     * the brand orange is 6.5:1 in the light theme and 7.7:1 in the dark one,
     * where white on the same orange is 3.0:1 and 2.4:1 and fails AA at this
     * text size in both.
     */
    light: "bg-white text-ink-fixed hover:bg-brand hover:text-ink-fixed",
  }[variant];

  const inner = (
    <>
      {children}
      <ArrowRight
        size={16}
        strokeWidth={2.25}
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </>
  );

  // Only the primary variant compresses: it is the one that reads as a
  // physical button. Ghost and light are surfaces, and scaling a hairline
  // outline looks like a rendering fault.
  const press = variant === "primary" ? "cta" : undefined;

  if (external) {
    return (
      <a
        href={href}
        data-press={press}
        data-ripple=""
        className={`${base} ${styles}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={href}
      data-press={press}
      data-ripple=""
      className={`${base} ${styles}`}
    >
      {inner}
    </Link>
  );
}

/**
 * Full-bleed photographic band with a parallax layer behind the content.
 * The photo is always tinted so type keeps its contrast regardless of the
 * image underneath it.
 *
 * Two figures are available, and a page should not spend both:
 *
 *   `drift`     the photo lags inside the moving section. This is the hero's
 *               figure, and a hero is where it belongs — it is the gentler of
 *               the two and it reads at a glance.
 *   `aperture`  the photo is pinned to the viewport and the section travels
 *               over it. Stronger, and it wants a band with enough height for
 *               the picture to be uncovered gradually.
 */
export function ParallaxBand({
  image,
  alt,
  speed = 110,
  variant = "drift",
  className = "",
  overlay = "linear-gradient(180deg, rgb(16 21 27 / 0.86), rgb(16 21 27 / 0.74))",
  eager = false,
  children,
}: {
  image: string;
  alt: string;
  /** `drift` only. */
  speed?: number;
  variant?: "drift" | "aperture";
  className?: string;
  overlay?: string;
  /**
   * Opt out of lazy loading for a band that measures as the LCP element.
   * Deliberately not `priority`: that also injects a preload link, which on a
   * slow connection competes with the hero image above it. `eager` only stops
   * the band being deferred, which is what makes it a late LCP in the first
   * place.
   */
  eager?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={`relative isolate overflow-hidden ${className}`}>
      {variant === "aperture" ? (
        <ParallaxWindow className="absolute inset-0 -z-10">
          <Media
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
        </ParallaxWindow>
      ) : (
        <Parallax speed={speed} className="absolute inset-x-0 -z-10">
          <Media
            src={image}
            alt={alt}
            fill
            sizes="100vw"
            loading={eager ? "eager" : "lazy"}
            className="object-cover"
          />
        </Parallax>
      )}
      <div
        className="absolute inset-0 -z-10"
        style={{ background: overlay }}
        aria-hidden="true"
      />
      {children}
    </section>
  );
}
