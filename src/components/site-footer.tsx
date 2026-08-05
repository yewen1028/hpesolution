import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { company, contact, navigation, regions, services } from "@/lib/site";

const totalCentres = regions.reduce((n, r) => n + r.centres.length, 0);

/*
 * The last band on every page, and the one most easily left as a directory.
 *
 * Three decisions carry it:
 *
 *  1. **It is drawn with hairlines, like the rest of the site.** The columns
 *     used to float in a gap grid, which made this the one layout here that did
 *     not follow the container-supplies-top-left, cell-supplies-right-bottom
 *     rule the page grids use. Ruling them ties the footer to everything above
 *     it and gives the link lists an edge to sit against instead of drifting.
 *
 *  2. **The helpdesk number is set as display type, not as a list item.** This
 *     is a support company; at the bottom of the page that number is the
 *     product, and it was previously the same size as a nav link with an icon
 *     beside it. Everything else in its column is subordinate to it now.
 *
 *  3. **Nothing decorative was added.** No newsletter nobody asked for, no
 *     social row for accounts the site never links, no oversized watermark —
 *     `sections/coverage.tsx` already spends that device once, and a second
 *     would make it a motif rather than a moment.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-paper-deep text-white/72">
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
        {/*
          Masthead row: the mark, and the one fact worth restating at sign-off —
          what the company is and how far it reaches. The count is read from
          `regions`, so it cannot drift from the coverage map.
        */}
        <div className="flex flex-col gap-8 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <Image
            src="/hpe-logo.png"
            alt="HPE Solutions"
            width={390}
            height={120}
            className="h-11 w-auto"
          />
          <p className="max-w-xl text-[0.95rem] leading-relaxed text-white/70 lg:text-right">
            {company.tagline}, supporting corporate and principal clients from{" "}
            {totalCentres} service centres across Peninsular and East Malaysia.
          </p>
        </div>

        {/*
          The house grid: the container draws the top and left, every cell draws
          its own right and bottom. No nth-child arithmetic, so the frame is
          correct at one, two or three columns.
        */}
        <div className="grid border-l border-t border-white/10 md:grid-cols-2 lg:grid-cols-3">
          <nav
            aria-labelledby="footer-services"
            className="border-b border-r border-white/10 p-8 lg:p-10"
          >
            <h2 id="footer-services" className="site-footer-heading eyebrow eyebrow-light">
              Services
            </h2>
            <ul className="mt-6 space-y-3">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="footer-link"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-company"
            className="border-b border-r border-white/10 p-8 lg:p-10"
          >
            <h2 id="footer-company" className="site-footer-heading eyebrow eyebrow-light">
              Company
            </h2>
            <ul className="mt-6 space-y-3">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="footer-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-b border-r border-white/10 p-8 md:col-span-2 lg:col-span-1 lg:p-10">
            <h2 className="site-footer-heading eyebrow eyebrow-light">Helpdesk</h2>

            {/*
              The primary action in this band, so it is sized like one.
              `tabular` holds the digits on a fixed pitch — a phone number set
              in proportional figures wobbles.
            */}
            <a
              href={`tel:${contact.phoneDial}`}
              className="tabular mt-5 block font-display text-[1.6rem] font-semibold leading-none tracking-[-0.02em] text-white transition-colors hover:text-brand"
            >
              {contact.phoneDisplay}
            </a>
            <p className="mt-2.5 text-[0.8rem] text-white/45">
              24 × 7, nationwide
            </p>

            <address className="mt-7 text-[0.9rem] not-italic leading-relaxed text-white/70">
              {contact.addressLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>

            {/*
              Label and address on one line, aligned to their baselines and
              pushed apart. A stacked label-over-address pattern would have made
              three mailboxes read as three paragraphs.
            */}
            <ul className="mt-7 space-y-3 border-t border-white/10 pt-6">
              {contact.emails.map((email) => (
                <li
                  key={email.address}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                >
                  <span className="text-[0.72rem] uppercase tracking-[0.14em] text-white/40">
                    {email.label}
                  </span>
                  <a href={`mailto:${email.address}`} className="footer-link">
                    {email.address}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Colophon. Quiet by design: it is the one line here nobody reads. */}
        <div className="mt-10 flex flex-col gap-4 text-[0.8rem] text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {company.copyrightFrom}–{year} {company.legalName}. All rights
            reserved.
          </p>
          <a
            href={contact.privacyNoticeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
          >
            Privacy Notice
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
