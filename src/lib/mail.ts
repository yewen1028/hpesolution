import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

import { ENQUIRY_TO as DEFAULT_TO, type Enquiry } from "@/lib/enquiry";

export type { Enquiry };

/**
 * The site's only server-side dependency.
 *
 * Everything else here prerenders; this module exists so the enquiry form can
 * actually deliver instead of handing the visitor a `mailto:`. It is imported
 * only from `src/app/actions/enquiry.ts`, which is a server action, and
 * `server-only` makes that a build error rather than a leaked credential if
 * anyone ever imports it from a client component.
 */

/**
 * Where enquiries land. Server-side `ENQUIRY_TO` wins so staging can point
 * somewhere harmless without touching the client bundle; otherwise it is the
 * one address shared with the form's `mailto:` fallback.
 */
export const ENQUIRY_TO = process.env.ENQUIRY_TO ?? DEFAULT_TO;

/**
 * The envelope sender. This must be an address the SMTP account is allowed to
 * send as, which for Gmail means the account's own address; setting it to the
 * visitor's address would be a forgery and gets the message spam-filed or
 * rejected outright. The visitor's address goes in `Reply-To` instead, so
 * hitting reply in the inbox still answers them directly.
 */
const FROM = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? ENQUIRY_TO;

export class MailNotConfiguredError extends Error {
  constructor() {
    super("SMTP is not configured");
    this.name = "MailNotConfiguredError";
  }
}

/*
 * Built once per server process, not per request: every enquiry otherwise pays
 * a fresh TCP and TLS handshake to the mail host. `pool` keeps the connection
 * open between sends.
 *
 * Deliberately lazy. Reading and validating env at module scope would run
 * during `next build`, where these variables are not set, and would fail the
 * build of nineteen static pages over a credential none of them need.
 */
let cached: Transporter | null = null;

function transporter(): Transporter {
  if (cached) return cached;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) throw new MailNotConfiguredError();

  // 465 is implicit TLS; 587 upgrades with STARTTLS. Getting `secure` wrong
  // for the port is the single most common cause of a hanging connection.
  const port = Number(process.env.SMTP_PORT ?? 587);

  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
    // Fail loudly and quickly. Without these an unreachable host leaves the
    // visitor watching a spinner until the platform's own request timeout.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return cached;
}

/** Header injection guard: strip anything that could open a new header line. */
const oneLine = (value: string) => value.replace(/[\r\n]+/g, " ").trim();

/** Minimal HTML escape for the formatted copy of the message. */
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ROWS: [label: string, key: keyof Enquiry][] = [
  ["Name", "name"],
  ["Company", "company"],
  ["Email", "email"],
  ["Phone", "phone"],
  ["Service of interest", "service"],
];

/**
 * Sends one enquiry. Throws `MailNotConfiguredError` when no SMTP credentials
 * are present, which the caller turns into the `mailto:` fallback rather than
 * an error, and rethrows anything else.
 */
export async function sendEnquiry(enquiry: Enquiry) {
  const text = [
    ...ROWS.map(([label, key]) => `${label}: ${enquiry[key] || "-"}`),
    "",
    "Enquiry:",
    enquiry.message,
  ].join("\n");

  const html = [
    `<table style="border-collapse:collapse;font:14px/1.6 system-ui,sans-serif">`,
    ...ROWS.map(
      ([label, key]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#6d7480">${label}</td>` +
        `<td style="padding:4px 0"><strong>${escapeHtml(enquiry[key]) || "-"}</strong></td></tr>`,
    ),
    `</table>`,
    `<p style="font:14px/1.6 system-ui,sans-serif;white-space:pre-wrap">`,
    escapeHtml(enquiry.message),
    `</p>`,
  ].join("");

  await transporter().sendMail({
    from: `"HPE Solutions website" <${FROM}>`,
    to: ENQUIRY_TO,
    // Reply goes to the person who filled the form, not to the site's mailbox.
    replyTo: `"${oneLine(enquiry.name)}" <${oneLine(enquiry.email)}>`,
    subject: oneLine(
      `Website enquiry · ${enquiry.service || "General"} · ${enquiry.name}`,
    ),
    text,
    html,
  });
}
