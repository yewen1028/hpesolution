"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowRight, ChevronDown, Menu, Phone, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MotionToggle } from "@/components/motion-toggle";
import { ServiceIcon } from "@/components/service-icon";
import { contact, navigation, services } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [shrunk, setShrunk] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLLIElement>(null);

  /**
   * Two thresholds, not one.
   *
   * `scrolled` (12px) is the existing hairline-and-blur change — it has to fire
   * the moment content slides under the header or the bar looks detached.
   *
   * `shrunk` fires once the hero is behind you, which is a different question
   * and cannot be a fixed number: the home hero is nearly a viewport tall and a
   * `PageHero` is roughly half that. It is measured from the element marked
   * `data-site-hero`, minus the header's own height so the change lands as the
   * hero's last pixel passes under the bar. Pages with no hero fall back to one
   * header height.
   */
  useEffect(() => {
    let shrinkAt = 160;

    const measure = () => {
      const hero = document.querySelector<HTMLElement>("[data-site-hero]");
      const headerH = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      ) || 76;

      shrinkAt = hero
        ? Math.max(headerH, hero.offsetTop + hero.offsetHeight - headerH)
        : headerH * 2;
    };

    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      setShrunk(window.scrollY > shrinkAt);
    };

    measure();
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [pathname]);

  // Close everything on navigation. Adjusting during render (rather than in an
  // effect) avoids a frame where the new page shows behind an open menu.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setServicesOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Dismiss the services flyout on outside click or Escape.
  useEffect(() => {
    if (!servicesOpen) return;

    const onPointer = (e: PointerEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) {
        setServicesOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };

    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      data-shrunk={shrunk ? "" : undefined}
      className={`site-header fixed inset-x-0 top-0 z-100 border-b transition-colors duration-300 ${
        scrolled
          ? "border-rule bg-paper/92 backdrop-blur-md"
          : "border-transparent bg-paper"
      }`}
    >
      <div className="mx-auto flex h-full max-w-[88rem] items-center gap-6 px-5 sm:px-8">
        {/*
          `flex items-center` rather than the default inline box: an <img> in
          an inline anchor sits on a text baseline, so the anchor was a few
          pixels taller than the logo with dead space under it.

          `-m-2 p-2` adds 8px of hit area on every side without moving anything
          in the layout. The logo is 32px tall, dropping to 28px once the header
          shrinks past the hero, which is under every tap-target guideline
          going; this takes it to 48px and 44px.

          `relative z-10` keeps it above anything else inside the header, the
          services flyout included.
        */}
        <Link
          href="/"
          className="relative z-10 -m-2 flex shrink-0 items-center p-2"
          aria-label={`${"HPE Solutions"} · home`}
        >
          <Image
            src="/hpe-logo.png"
            alt="HPE Solutions"
            width={390}
            height={120}
            priority
            className="site-header__logo w-auto"
          />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {navigation.map((item) => {
              if (item.href !== "/services") {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      data-active={isActive(item.href) ? "" : undefined}
                      className={`nav-link rounded px-3.5 py-2 text-[0.9rem] font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-ink"
                          : "text-ink-soft hover:text-ink"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={item.href} ref={servicesRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setServicesOpen((v) => !v)}
                    aria-expanded={servicesOpen}
                    aria-controls="services-menu"
                    data-ripple=""
                    data-active={isActive(item.href) ? "" : undefined}
                    className={`nav-link flex items-center gap-1.5 rounded px-3.5 py-2 text-[0.9rem] font-medium transition-colors ${
                      isActive(item.href)
                        ? "text-ink"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {item.label}
                    <ChevronDown
                      size={15}
                      strokeWidth={2}
                      aria-hidden="true"
                      className={`transition-transform duration-200 ${
                        servicesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/*
                    The panel unfolds around its own top edge while the rows
                    arrive behind it, later and travelling further. Two rates,
                    one gesture: that difference is the whole effect, and it is
                    why the rows are not simply faded in with the panel.

                    The stagger is a CSS cascade off `--i` rather than a timer
                    per row, so the eight delays cost nothing and cannot drift
                    out of step with the panel.
                  */}
                  {servicesOpen && (
                    <div
                      id="services-menu"
                      className="svc-menu absolute right-0 top-[calc(100%+0.75rem)] w-[27rem] border border-rule bg-paper p-2 shadow-[0_24px_60px_-24px_rgb(20_24_29/0.28)]"
                    >
                      <Link
                        href="/services"
                        style={{ "--i": 0 } as CSSProperties}
                        className="svc-menu__item group flex items-center justify-between gap-3 px-4 py-3 text-[0.9rem] font-semibold text-ink transition-colors hover:bg-paper-warm"
                      >
                        All services
                        <ArrowRight
                          size={14}
                          strokeWidth={2.25}
                          aria-hidden="true"
                          className="text-brand transition-transform duration-300 group-hover:translate-x-1"
                        />
                      </Link>

                      <div className="my-1 h-px bg-rule" />

                      {services.map((service, i) => (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          style={{ "--i": i + 1 } as CSSProperties}
                          className="svc-menu__item group flex items-start gap-3.5 px-4 py-2.5 transition-colors hover:bg-paper-warm"
                        >
                          {/*
                            The same bordered glyph the services grid uses, at
                            two thirds the size. The menu and the grid are two
                            views of one list and should look like it.
                          */}
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-rule text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                            <ServiceIcon name={service.icon} size={15} />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[0.9rem] font-medium text-ink">
                              {service.title}
                            </span>
                            <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-muted">
                              {service.short}
                            </span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <MotionToggle className="ml-auto hidden lg:ml-4 lg:inline-flex" />
        <ThemeToggle className="hidden lg:ml-2 lg:inline-flex" />

        <a
          href={`tel:${contact.phoneDial}`}
          data-press="cta"
          data-ripple=""
          className="hidden items-center gap-2 bg-brand px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-brand-strong lg:ml-3 lg:flex"
        >
          <Phone size={15} strokeWidth={2.25} aria-hidden="true" />
          {contact.phoneDisplay}
        </a>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          data-ripple=""
          className="ml-auto flex h-11 w-11 items-center justify-center text-ink lg:hidden"
        >
          <span className="sr-only">
            {mobileOpen ? "Close menu" : "Open menu"}
          </span>
          {mobileOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 bottom-0 overflow-y-auto border-t border-rule bg-paper lg:hidden"
          style={{ top: "var(--header-h)" }}
        >
          <nav aria-label="Main" className="px-5 py-6 sm:px-8">
            <ul className="divide-y divide-rule">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between py-4 text-lg font-medium text-ink"
                  >
                    {item.label}
                  </Link>
                  {item.href === "/services" && (
                    <ul className="-mt-1 mb-4 space-y-1 border-l-2 border-brand pl-4">
                      {services.map((service) => (
                        <li key={service.slug}>
                          <Link
                            href={`/services/${service.slug}`}
                            className="block py-1.5 text-[0.95rem] text-ink-soft"
                          >
                            {service.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex items-center justify-between border-t border-rule pt-6">
              <span className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Theme
              </span>
              <ThemeToggle />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Animation
              </span>
              <MotionToggle />
            </div>

            <a
              href={`tel:${contact.phoneDial}`}
              data-press="cta"
              data-ripple=""
              className="mt-6 flex items-center justify-center gap-2 bg-brand px-5 py-4 font-semibold text-white"
            >
              <Phone size={17} strokeWidth={2.25} aria-hidden="true" />
              {contact.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
