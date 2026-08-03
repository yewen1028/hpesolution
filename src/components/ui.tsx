import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Headset,
  Network,
  ServerCog,
  ShieldCheck,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/site";
import { Parallax } from "./parallax";

const icons: Record<IconName, LucideIcon> = {
  ServerCog,
  Boxes,
  Headset,
  Users,
  ShieldCheck,
  Network,
  Wrench,
};

export function ServiceIcon({
  name,
  size = 22,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Icon = icons[name];
  return (
    <Icon size={size} strokeWidth={1.5} className={className} aria-hidden="true" />
  );
}

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
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"
      }
    >
      <p className={`eyebrow ${tone === "light" ? "eyebrow-light" : ""}`}>
        {eyebrow}
      </p>
      <h2
        className={`display-2 mt-5 ${tone === "light" ? "text-white" : ""}`}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={`lede mt-6 ${
            tone === "light" ? "text-white/70" : ""
          } ${align === "center" ? "mx-auto" : ""}`}
        >
          {lede}
        </p>
      )}
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
    primary: "bg-brand text-white hover:bg-brand-strong",
    ghost: "border border-rule-strong text-ink hover:border-ink hover:bg-paper-warm",
    light: "bg-white text-ink hover:bg-brand hover:text-white",
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

  if (external) {
    return (
      <a href={href} className={`${base} ${styles}`}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} className={`${base} ${styles}`}>
      {inner}
    </Link>
  );
}

/**
 * Full-bleed photographic band with a parallax layer behind the content.
 * The photo is always tinted so type keeps its contrast regardless of the
 * image underneath it.
 */
export function ParallaxBand({
  image,
  alt,
  speed = 110,
  className = "",
  overlay = "linear-gradient(180deg, rgb(16 21 27 / 0.86), rgb(16 21 27 / 0.74))",
  eager = false,
  children,
}: {
  image: string;
  alt: string;
  speed?: number;
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
      <Parallax speed={speed} className="absolute inset-x-0 -z-10">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="100vw"
          loading={eager ? "eager" : "lazy"}
          className="object-cover"
        />
      </Parallax>
      <div
        className="absolute inset-0 -z-10"
        style={{ background: overlay }}
        aria-hidden="true"
      />
      {children}
    </section>
  );
}
