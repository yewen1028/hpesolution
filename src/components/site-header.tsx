"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
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
        <Link
          href="/"
          className="shrink-0"
          aria-label={`${"HPE Solutions"} — home`}
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

                  {servicesOpen && (
                    <div className="absolute right-0 top-[calc(100%+0.75rem)] w-88 border border-rule bg-paper p-2 shadow-[0_24px_60px_-24px_rgb(20_24_29/0.28)]">
                      <Link
                        href="/services"
                        className="block px-4 py-3 text-[0.9rem] font-semibold text-ink hover:bg-paper-warm"
                      >
                        All services
                      </Link>
                      <div className="my-1 h-px bg-rule" />
                      {services.map((service) => (
                        <Link
                          key={service.slug}
                          href={`/services/${service.slug}`}
                          className="block px-4 py-2.5 hover:bg-paper-warm"
                        >
                          <span className="block text-[0.9rem] font-medium text-ink">
                            {service.title}
                          </span>
                          <span className="mt-0.5 block text-[0.8rem] leading-snug text-ink-muted">
                            {service.short}
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

        <ThemeToggle className="ml-auto hidden lg:ml-4 lg:inline-flex" />

        <a
          href={`tel:${contact.phoneDial}`}
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

            <a
              href={`tel:${contact.phoneDial}`}
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
