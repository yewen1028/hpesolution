"use server";

import { headers } from "next/headers";
import { MailNotConfiguredError, sendEnquiry } from "@/lib/mail";
import type { Enquiry, EnquiryState } from "@/lib/enquiry";

/**
 * The enquiry form's submit handler.
 *
 * A server action is a public POST endpoint. Anything reachable from the open
 * internet that sends mail will be found and abused, so validation, a honeypot
 * and a rate limit are part of the feature rather than hardening to add later.
 *
 * `submitEnquiry` is the only export, and must stay that way: every export
 * from a `"use server"` file is exposed as a callable endpoint, so Next
 * rejects any that is not an async function. The types and the initial state
 * live in `lib/enquiry.ts` for exactly that reason.
 */

/** Generous caps. Long enough for a real brief, short enough to bound a payload. */
const LIMITS: Record<keyof Enquiry, number> = {
  name: 120,
  company: 160,
  email: 254, // RFC 5321 maximum
  phone: 40,
  service: 120,
  message: 5000,
};

/*
 * Deliberately simple: one `@`, something either side, a dot in the domain.
 * Anything stricter rejects addresses that are legitimately deliverable, and
 * the only authoritative test of an address is sending to it.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/*
 * In-memory, per-IP, fixed window. This is a single-process guard, so it does
 * not survive a restart and does not coordinate across instances. That is
 * enough to stop a script hammering the endpoint; it is not a substitute for
 * a platform rate limit or a WAF if this ever sees real abuse.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic sweep so a long-lived process does not accumulate every IP
  // that ever submitted.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > MAX_PER_WINDOW;
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  /*
   * Honeypot. `company_website` is hidden from sight and from assistive tech,
   * and no human ever fills it. Bots fill every field they find, so a value
   * here is a bot. It is answered with the success state on purpose: telling a
   * spammer why they were rejected is telling them how to get through.
   */
  if (String(formData.get("company_website") ?? "")) {
    return { status: "sent" };
  }

  const read = (key: keyof Enquiry) =>
    String(formData.get(key) ?? "")
      .trim()
      .slice(0, LIMITS[key]);

  const enquiry: Enquiry = {
    name: read("name"),
    company: read("company"),
    email: read("email"),
    phone: read("phone"),
    service: read("service"),
    message: read("message"),
  };

  const errors: EnquiryState["errors"] = {};
  if (!enquiry.name) errors.name = "Please tell us your name.";
  if (!enquiry.email) errors.email = "We need an email address to reply to.";
  else if (!EMAIL.test(enquiry.email))
    errors.email = "That does not look like an email address.";
  if (!enquiry.message) errors.message = "Please tell us what you need.";

  if (Object.keys(errors).length > 0) {
    return {
      status: "invalid",
      errors,
      message: "Please check the highlighted fields.",
      values: enquiry,
    };
  }

  const forwarded = (await headers()).get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  if (rateLimited(ip)) {
    return {
      status: "error",
      message:
        "That is a lot of enquiries in a short time. Please wait a few minutes, or email us directly.",
      values: enquiry,
    };
  }

  try {
    await sendEnquiry(enquiry);
    return { status: "sent" };
  } catch (error) {
    if (error instanceof MailNotConfiguredError) {
      // No credentials on this deployment. The client falls back to `mailto:`
      // so the enquiry is still deliverable rather than silently lost.
      return { status: "unconfigured", values: enquiry };
    }

    // Never surface the transport error to the visitor: SMTP failures quote
    // the host and sometimes the username.
    console.error("[enquiry] send failed:", error);
    return {
      status: "error",
      message: "We could not send that from here.",
      values: enquiry,
    };
  }
}
