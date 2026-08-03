import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { company, contact, navigation, services } from "@/lib/site";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-paper-deep text-white/70">
      <div className="mx-auto max-w-[88rem] px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr_1fr_1.2fr]">
          <div>
            <Image
              src="/hpe-logo.png"
              alt="HPE Solutions"
              width={390}
              height={120}
              className="h-9 w-auto"
            />
            <p className="mt-6 max-w-xs text-[0.925rem] leading-relaxed">
              {company.tagline}, supporting corporate and principal clients from
              18 centres across Peninsular and East Malaysia.
            </p>
          </div>

          <nav aria-labelledby="footer-services">
            <h2
              id="footer-services"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white"
            >
              Services
            </h2>
            <ul className="mt-5 space-y-2.5">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-[0.9rem] transition-colors hover:text-brand"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2
              id="footer-company"
              className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white"
            >
              Company
            </h2>
            <ul className="mt-5 space-y-2.5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[0.9rem] transition-colors hover:text-brand"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-white">
              Get in touch
            </h2>
            <ul className="mt-5 space-y-4 text-[0.9rem]">
              <li className="flex gap-3">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <address className="not-italic leading-relaxed">
                  {contact.addressLines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${contact.phoneDial}`}
                  className="transition-colors hover:text-brand"
                >
                  {contact.phoneDisplay}
                </a>
              </li>
              {contact.emails.map((email) => (
                <li key={email.address} className="flex gap-3">
                  <Mail
                    size={17}
                    className="mt-0.5 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <span>
                    <span className="block text-[0.75rem] uppercase tracking-[0.12em] text-white/45">
                      {email.label}
                    </span>
                    <a
                      href={`mailto:${email.address}`}
                      className="transition-colors hover:text-brand"
                    >
                      {email.address}
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-[0.8rem] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {company.copyrightFrom}–{year} {company.legalName}. All rights
            reserved.
          </p>
          <a
            href={contact.privacyNoticeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-brand"
          >
            Privacy Notice
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  );
}
