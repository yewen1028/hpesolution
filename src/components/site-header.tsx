"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Menu,
  Phone,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MotionToggle } from "@/components/motion-toggle";
import { ServiceIcon } from "@/components/service-icon";
import { TopBar } from "@/components/top-bar";
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
      /*
       * The header's **resting** height, summed from its two rows rather than
       * read off `--header-h`. That token is a `calc()` of the two now, so
       * `getPropertyValue` hands back the unresolved expression and
       * `parseFloat` makes `NaN` of it. Measuring the element instead would
       * resolve, but it reports 60px whenever this re-runs while the bar is
       * already shrunk — and a threshold that moves with the state it controls
       * is how a header ends up flickering at the boundary.
       */
      const root = getComputedStyle(document.documentElement);
      const px = (name: string, fallback: number) =>
        parseFloat(root.getPropertyValue(name)) || fallback;
      const headerH = px("--nav-h", 76) + px("--topbar-h", 36);

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
      {/*
        Steps the page back while the flyout is open, so the panel reads as the
        layer in focus rather than a box floating on a fully lit page.

        **Outside the <li> that `servicesRef` points at, deliberately.** The
        dismiss handler closes the menu when a pointerdown lands outside that
        ref; with the scrim inside it, every click on the dimmed page would have
        counted as a click inside the menu and the thing would not shut. Out
        here it is ordinary outside-click territory and needs no handler of its
        own.

        Still inside <header>, so it inherits the header's stacking context and
        can never cover the bar — and it starts at `--header-h` for the same
        reason.
      */}
      {servicesOpen && <div className="svc-scrim" aria-hidden="true" />}

      {/*
        The contact strip. Inside <header> rather than above it in the layout,
        because the header is fixed — a sibling before it would scroll away
        under the bar. Being a child is also what gets it `data-shrunk` for
        free, so it folds on the same threshold the rest of the header uses.
      */}
      <TopBar />

      <div className="site-header__bar mx-auto flex max-w-[88rem] items-center gap-4 px-5 sm:px-8">
        {/*
          `flex items-center` rather than the default inline box: an <img> in
          an inline anchor sits on a text baseline, so the anchor was a few
          pixels taller than the logo with dead space under it.

          `-m-2 p-2` adds 8px of hit area on every side without moving anything
          in the layout. The logo is 40px tall on a phone and 48px from `sm`,
          dropping to 36px once the header shrinks past the hero; the padding
          takes the target to 56px, 64px and 52px respectively, all clear of
          every tap-target guideline going.

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

        {/*
          `xl`, not `lg`, and the arithmetic decides it rather than taste.

          At 1024px the bar has 960px to work with. The logo is 156px, the six
          nav items 659px, the two toggles 204px and the phone number 183px —
          over 1200px of content. It never fitted: the links were being shrunk
          by flexbox until "Business Partner" broke onto a second line inside a
          40px-tall box. Below `xl` the whole set moves into the panel behind
          the menu button, which holds all of it including the theme and
          animation controls.

          `ml-auto` appears exactly once in this row, here. With a second one on
          the toggles the free space was split between the two, leaving the nav
          stranded mid-bar; one puts every control after it flush right, and the
          logo — first in the row, before the auto margin — does not move.
        */}
        <nav aria-label="Main" className="ml-auto hidden xl:block">
          {/*
            `relative` here rather than on the Services <li>, so the flyout
            hangs off the **nav's** right edge instead of the trigger's. The
            trigger sits fourth from the left of six, so a panel this wide
            anchored to it would hang off the left of the viewport at the
            narrow end of `lg`. The panel stays inside the <li> in the DOM —
            `position` resolves against the nearest positioned ancestor, while
            the outside-click check walks the DOM tree — so `servicesRef`
            still contains it and dismissal is unaffected.
          */}
          <ul className="relative flex items-center gap-2">
            {navigation.map((item) => {
              if (item.href !== "/services") {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      data-active={isActive(item.href) ? "" : undefined}
                      /*
                        Same press feedback the Services trigger has. Safe on
                        `.nav-link` because its underline is drawn *inside* the
                        padding box, so the `overflow: hidden` that
                        `[data-ripple]` brings with it has nothing to clip.
                      */
                      data-ripple=""
                      className={`nav-link rounded px-3 py-2 text-[0.9rem] font-medium transition-colors ${
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
                <li key={item.href} ref={servicesRef}>
                  <button
                    type="button"
                    onClick={() => setServicesOpen((v) => !v)}
                    aria-expanded={servicesOpen}
                    aria-controls="services-menu"
                    data-ripple=""
                    data-active={isActive(item.href) ? "" : undefined}
                    data-open={servicesOpen ? "" : undefined}
                    className={`nav-link flex items-center gap-1.5 rounded px-3 py-2 text-[0.9rem] font-medium transition-colors ${
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
                      /* Steps up only once there is room for it to. */
                      className="svc-menu absolute right-0 top-[calc(100%+0.75rem)] z-10 w-[34rem] max-w-[calc(100vw-2.5rem)] border border-rule bg-paper shadow-[0_28px_70px_-28px_rgb(20_24_29/0.34)] xl:w-[40rem]"
                    >
                      {/*
                        A titled strip rather than a bare list edge: the panel
                        is wide enough now to read as a section of the site, so
                        it gets the same eyebrow marker a section would.
                      */}
                      <div
                        style={{ "--i": 0 } as CSSProperties}
                        className="svc-menu__item flex items-center justify-between border-b border-rule px-5 py-3"
                      >
                        <span className="eyebrow">Services</span>
                        <span className="text-[0.75rem] text-ink-muted">
                          {services.length} service lines
                        </span>
                      </div>

                      {/*
                        Hairlines by `gap-px` over a ruled background, not the
                        container-supplies-top-left rule the page grids use:
                        inside a panel that already has its own border, that
                        pattern doubles the frame down the right edge and along
                        the bottom. This draws the internal lines only.

                        Seven services plus the closing panel fill four rows of
                        two exactly — the same "fill a ragged row" move as
                        `sections/services-grid.tsx`.
                      */}
                      <ul className="grid grid-cols-2 gap-px bg-rule">
                        {services.map((service, i) => {
                          const href = `/services/${service.slug}`;
                          const current = pathname === href;

                          return (
                            <li key={service.slug} className="bg-paper">
                              <Link
                                href={href}
                                aria-current={current ? "page" : undefined}
                                data-current={current ? "" : undefined}
                                style={{ "--i": i + 1 } as CSSProperties}
                                data-ripple=""
                                /*
                                  The same cursor wash the services grid cards
                                  use — one delegated pointermove listener in
                                  `spotlight.tsx` writes --spot-x/--spot-y, and
                                  `[data-spotlight]::before` draws from them.
                                  Scoped down to a 9rem circle for a cell this
                                  size in globals.css; the current-page rule
                                  moved to `::after` so the two can coexist.
                                */
                                data-spotlight=""
                                className="svc-menu__item svc-menu__cell group flex h-full items-start gap-3 p-4 transition-colors duration-300 hover:bg-paper-warm"
                              >
                                {/*
                                  The same bordered glyph the services grid
                                  uses, at two thirds the size. The menu and the
                                  grid are two views of one list and should look
                                  like it.
                                */}
                                <span className="svc-menu__glyph mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-rule text-brand transition-colors duration-300 group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                                  <ServiceIcon name={service.icon} size={15} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[0.875rem] font-medium leading-snug text-ink">
                                    {service.title}
                                  </span>
                                  <span className="mt-1 block text-[0.775rem] leading-snug text-ink-muted">
                                    {service.short}
                                  </span>
                                </span>
                                {/*
                                  Arrives on hover rather than sitting there:
                                  seven permanent arrows would be seven marks
                                  competing with the one that says where you
                                  are.
                                */}
                                <ArrowUpRight
                                  size={14}
                                  strokeWidth={2.25}
                                  aria-hidden="true"
                                  className="mt-0.5 shrink-0 -translate-x-1 text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                                />
                              </Link>
                            </li>
                          );
                        })}

                        <li className="bg-paper">
                          <Link
                            href="/services"
                            style={
                              {
                                "--i": services.length + 1,
                              } as CSSProperties
                            }
                            data-ripple=""
                            className="svc-menu__item group flex h-full flex-col justify-between gap-4 bg-paper-warm p-4 transition-colors duration-300 hover:bg-brand-tint"
                          >
                            <span className="text-[0.875rem] font-semibold text-ink">
                              All services
                            </span>
                            <span className="flex items-center gap-2 text-[0.775rem] text-ink-muted">
                              The full list, with what each one covers
                              <ArrowRight
                                size={14}
                                strokeWidth={2.25}
                                aria-hidden="true"
                                className="shrink-0 text-brand transition-transform duration-300 group-hover:translate-x-1"
                              />
                            </span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <MotionToggle className="hidden xl:ml-4 xl:inline-flex" />
        <ThemeToggle className="hidden xl:ml-2 xl:inline-flex" />

        <a
          href={`tel:${contact.phoneDial}`}
          data-press="cta"
          data-ripple=""
          /* `lg:h-10` is `--header-control-h`: this sits in the same row as the
             nav links and the toggles and has to share their edges. */
          className="hidden items-center gap-2 bg-brand px-5 py-2.5 text-[0.9rem] font-semibold text-white transition-colors hover:bg-brand-strong min-[1440px]:ml-3 min-[1440px]:flex min-[1440px]:h-10"
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
          className="ml-auto flex h-11 w-11 items-center justify-center text-ink xl:hidden"
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
          /* `top` is in CSS (`.site-header__mobile`), not inline: it has to
             track the bar's current height, and an inline value cannot. */
          className="site-header__mobile fixed inset-x-0 bottom-0 overflow-y-auto border-t border-rule bg-paper xl:hidden"
        >
          <nav aria-label="Main" className="px-5 py-6 sm:px-8">
            <ul className="divide-y divide-rule">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-ripple=""
                    className="flex items-center justify-between py-4 text-lg font-medium text-ink"
                  >
                    {item.label}
                  </Link>
                  {item.href === "/services" && (
                    /*
                      The same list as the desktop flyout, so it carries the
                      same two marks: the service's glyph, and the current page
                      called out rather than left for the visitor to work out.
                      Laid out as rows instead of a grid — at this width a
                      second column would be two cramped columns.
                    */
                    <ul className="-mt-1 mb-4 border-l border-rule">
                      {services.map((service) => {
                        const href = `/services/${service.slug}`;
                        const current = pathname === href;

                        return (
                          <li key={service.slug}>
                            <Link
                              href={href}
                              aria-current={current ? "page" : undefined}
                              data-current={current ? "" : undefined}
                              data-ripple=""
                              className="svc-menu__cell flex items-center gap-3 py-2.5 pl-4 text-[0.95rem] text-ink-soft"
                            >
                              <span className="svc-menu__glyph flex h-7 w-7 shrink-0 items-center justify-center border border-rule text-brand">
                                <ServiceIcon name={service.icon} size={13} />
                              </span>
                              {service.title}
                            </Link>
                          </li>
                        );
                      })}
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
