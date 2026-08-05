import type { ReactNode } from "react";
import { Media } from "@/components/media";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { AnimatedText } from "./animated-text";
import { Parallax } from "./parallax";
import { Reveal } from "./reveal";
import { Container } from "./ui";

export type Crumb = { label: string; href?: string };

/** Masthead shared by every inner page: parallax photo, breadcrumb, title. */
export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  imageAlt,
  crumbs = [],
  backdrop,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  image: string;
  imageAlt: string;
  crumbs?: Crumb[];
  /**
   * Replaces the drifting photograph with something else behind the tint.
   *
   * `image` and `imageAlt` stay required either way: a backdrop is decoration
   * and carries no alt text, so the page still has to name a photograph for
   * the metadata and for the no-script case. One page uses this — see
   * `app/case-study/page.tsx` — and it should stay that way. A masthead that
   * differs per page stops being a masthead.
   */
  backdrop?: ReactNode;
}) {
  return (
    <section
      data-site-hero
      className="relative isolate overflow-hidden bg-paper-deep"
    >
      {backdrop ? (
        <div className="absolute inset-0 -z-10">{backdrop}</div>
      ) : (
        <Parallax speed={100} className="absolute inset-x-0 -z-10">
          <Media
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </Parallax>
      )}
      {/* Shared with the home hero; see `.masthead-tint` in globals.css. */}
      <div className="masthead-tint absolute inset-0 -z-10" aria-hidden="true" />

      {/*
        Deliberately one step shorter at the top than the home hero's
        pt-24/32/40: the breadcrumb row and its mt-12 sit above the eyebrow
        here and the home hero has neither, so equal padding would push the
        title noticeably further down on inner pages. These numbers land the
        eyebrow at roughly the same height on both. The `lg:` step exists so
        inner pages scale with the viewport the way the home page already did;
        without it they stopped growing at `sm` and looked cramped on a wide
        screen next to the home page.
      */}
      <Container className="pb-20 pt-16 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.8rem] text-white/50">
              <li>
                <Link href="/" className="transition-colors hover:text-brand">
                  Home
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-1.5">
                  <ChevronRight size={13} aria-hidden="true" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="transition-colors hover:text-brand"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-white/80">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

        {/*
          Same rhythm and the same headline treatment as the home hero: the two
          mastheads are the same component in the visitor's mind, and a title
          that staggered word-by-word on the home page but merely faded in here
          made every navigation feel like a different site. Gaps, lede opacity
          and stagger timings are matched to `sections/hero.tsx` deliberately;
          change them together or not at all.
        */}
        <div className="mt-12 max-w-4xl">
          <Reveal>
            <p className="eyebrow eyebrow-light">{eyebrow}</p>
          </Reveal>

          {/* Not wrapped in <Reveal>: AnimatedText carries its own observer. */}
          <AnimatedText
            as="h1"
            text={title}
            className="display-1 mt-7 text-white"
            delay={80}
            stagger={48}
          />

          {lede && (
            <Reveal delay={160}>
              <p className="lede mt-8 max-w-2xl text-white/72">{lede}</p>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
