import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  image: string;
  imageAlt: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-paper-deep">
      <Parallax speed={100} className="absolute inset-x-0 -z-10">
        <Image
          src={image}
          alt={imageAlt}
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
            "linear-gradient(105deg, rgb(16 21 27 / 0.94) 0%, rgb(16 21 27 / 0.85) 50%, rgb(16 21 27 / 0.66) 100%)",
        }}
      />

      <Container className="pb-20 pt-16 sm:pb-28 sm:pt-20">
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

        <div className="mt-12 max-w-4xl">
          <Reveal>
            <p className="eyebrow eyebrow-light">{eyebrow}</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="display-1 mt-6 text-white">{title}</h1>
          </Reveal>
          {lede && (
            <Reveal delay={160}>
              <p className="lede mt-7 max-w-2xl text-white/70">{lede}</p>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
