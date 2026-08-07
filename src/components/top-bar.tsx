import { Mail, Phone } from "lucide-react";
import { contact, supportTiers } from "@/lib/site";

/**
 * The utility strip above the nav row.
 *
 * It lives **inside** `<header>` rather than above it in `layout.tsx`, because
 * the header is `position: fixed` — a sibling placed before it would scroll
 * away underneath it and leave the bar floating over the page. Being a child
 * also means it inherits the header's `data-shrunk` state for free: past the
 * hero the strip folds to nothing and the bar returns to the 60px it has
 * always shrunk to, so the contact details are on offer while a visitor is
 * deciding and out of the way once they are reading. See `.topbar` in
 * globals.css.
 *
 * Near-black (`--color-paper-deep`) against the white nav row below it. Both
 * are themed tokens, so the strip inverts with the page and orange stays what
 * it is everywhere else here — an accent on the glyphs, not a background wash.
 *
 * No state, no handlers: a server component that happens to be rendered by a
 * client one, which costs the bundle the two glyphs and nothing else.
 */
export function TopBar() {
  // The enquiry mailbox. This is a call to action, so it is the address that
  // starts work — `sales@` — rather than the one that continues it; support
  // and HR are listed in full in the footer and on /contact.
  const email = contact.emails[0];
  const top = supportTiers[0];

  return (
    <div className="topbar">
      <div className="mx-auto flex h-full max-w-[88rem] items-center gap-4 px-5 sm:px-8">
        {/*
          Read off `supportTiers` rather than typed out, so the strongest claim
          on the site cannot drift from the table on the SLA band that has to
          honour it. Dropped below `sm`, where the contact details are the only
          thing worth 36px of a phone screen.
        */}
        <p className="topbar__note hidden sm:block">
          {top.coverage} support · {top.response} · nationwide Malaysia
        </p>

        <div className="ml-auto flex items-center gap-1">
          <a
            href={`mailto:${email.address}`}
            data-ripple=""
            className="topbar__link"
          >
            <Mail size={13} strokeWidth={2.25} aria-hidden="true" />
            <span className="topbar__label">{email.address}</span>
          </a>

          <span className="topbar__sep" aria-hidden="true" />

          <a
            href={`tel:${contact.phoneDial}`}
            data-ripple=""
            className="topbar__link"
          >
            <Phone size={13} strokeWidth={2.25} aria-hidden="true" />
            <span className="topbar__label">{contact.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
