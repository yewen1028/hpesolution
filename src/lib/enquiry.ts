/**
 * Shared shapes for the enquiry form. Deliberately its own module, imported by
 * the client form, the server action and the mail transport alike.
 *
 * It cannot live in `app/actions/enquiry.ts`: a `"use server"` file may only
 * export async functions, because every export becomes a callable RPC endpoint.
 * Exporting a plain object from one builds and typechecks cleanly and then
 * throws "A 'use server' file can only export async functions" the first time
 * the action is invoked.
 *
 * It cannot live in `lib/mail.ts` either: that imports `server-only`, and the
 * client form needs these types.
 */

/**
 * Where an enquiry goes. One constant, deliberately.
 *
 * There used to be two: the server action mailed `ENQUIRY_TO` while the
 * `mailto:` fallback in the form was hardcoded to the site's public sales
 * address. With no SMTP credentials configured, every enquiry took the
 * fallback, so in practice nothing reached the real destination and the
 * mismatch was invisible in code review. Both paths now read this.
 *
 * `NEXT_PUBLIC_` because the client half needs it too. That is not a leak: the
 * address is rendered into a `mailto:` link either way.
 */
export const ENQUIRY_TO =
  process.env.NEXT_PUBLIC_ENQUIRY_TO ?? "yewen1028@gmail.com";

export type Enquiry = {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export type EnquiryState = {
  status: "idle" | "sent" | "invalid" | "error" | "unconfigured";
  /** Field-level messages, keyed by input name. */
  errors?: Partial<Record<keyof Enquiry, string>>;
  message?: string;
  /**
   * Echoed back on anything that is not a success, so the form can repopulate.
   * React resets an uncontrolled form once its action resolves, and losing a
   * carefully written brief to a mistyped email address is the worst thing
   * this form could do to someone.
   */
  values?: Enquiry;
};

export const initialEnquiryState: EnquiryState = { status: "idle" };
