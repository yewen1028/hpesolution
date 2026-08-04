"use client";

import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Send } from "lucide-react";
import { SuccessCheck } from "@/components/success-check";
import { submitEnquiry } from "@/app/actions/enquiry";
import {
  ENQUIRY_TO,
  initialEnquiryState,
  type EnquiryState,
} from "@/lib/enquiry";
import { services } from "@/lib/site";

/**
 * One field: floating label, and a brand rule that draws in from the left on
 * focus. Styling lives in `.field` in globals.css.
 *
 * `placeholder=" "` is required, not decorative — the float is driven by
 * `:placeholder-shown`, which only reports empty when a placeholder exists. It
 * is a single space so nothing is announced or painted.
 *
 * The <label> stays a real label bound by `for`/`id`; the float is visual only,
 * so the accessible name is unchanged from the version this replaces.
 */
function Field({
  id,
  label,
  required = false,
  staticLabel = false,
  error,
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  /** For controls with no `:placeholder-shown` state, i.e. <select>. */
  staticLabel?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`field ${className}`}
      data-static-label={staticLabel ? "" : undefined}
      data-invalid={error ? "" : undefined}
    >
      {children}
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <span className="field__line" aria-hidden="true" />
      {/*
        Below the input, tied to it with `aria-describedby` at the call site.
        Not a `title` and not a placeholder: both vanish exactly when the
        person needs to read them.
      */}
      {error && (
        <p id={`${id}-error`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Split out so it can call `useFormStatus`, which only reports the state of
 * the nearest enclosing <form> from inside it.
 */
function SubmitButton({ state }: { state: EnquiryState }) {
  const { pending } = useFormStatus();
  const sent = state.status === "sent";

  return (
    <button
      type="submit"
      data-press={pending ? undefined : "cta"}
      data-status={pending ? "opening" : sent ? "sent" : "idle"}
      disabled={pending}
      className="submit-button btn-fill group inline-flex items-center gap-2.5 bg-brand px-7 py-3.5 text-[0.925rem] font-semibold text-white disabled:cursor-default"
    >
      {pending && (
        <>
          Sending enquiry
          <span className="submit-spinner" aria-hidden="true" />
        </>
      )}

      {!pending && sent && (
        <span className="submit-state--sent inline-flex items-center gap-2.5">
          Enquiry sent
          <SuccessCheck size={18} />
        </span>
      )}

      {!pending && !sent && (
        <>
          Send enquiry
          <Send
            size={16}
            strokeWidth={2.25}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </>
      )}
    </button>
  );
}

/**
 * Posts the enquiry to `submitEnquiry`, which mails it from the server.
 *
 * The form works with scripting off: `action` takes the server action
 * directly, so a submit without JavaScript is an ordinary POST and still
 * sends. `useActionState` only adds the in-page result.
 *
 * Delivery is never a dead end. If the server has no SMTP credentials, or the
 * mail host refuses, the visitor is offered the old `mailto:` hand-off with
 * the same structured body, so an enquiry is never silently swallowed.
 */
export function EnquiryForm() {
  const [state, formAction] = useActionState(
    submitEnquiry,
    initialEnquiryState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  const failed = state.status === "error" || state.status === "unconfigured";

  /**
   * Builds the `mailto:` from whatever is in the form right now. Read at click
   * time rather than from `state`, so it still carries the visitor's text if
   * they edited anything after the failed attempt.
   */
  function mailtoHref() {
    const data = new FormData(formRef.current ?? undefined);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    const body = [
      `Name: ${get("name")}`,
      `Company: ${get("company") || "-"}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone") || "-"}`,
      `Service of interest: ${get("service") || "-"}`,
      "",
      "Enquiry:",
      get("message"),
    ].join("\n");

    const subject = `Website enquiry · ${get("service") || "General"} · ${get("name")}`;

    return `mailto:${ENQUIRY_TO}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  }

  const v = state.values;

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-6 sm:grid-cols-2"
    >
      {/*
        Honeypot. Hidden from sight, from the tab order and from assistive
        tech, and named like a field a scraper would want to fill. Any value
        here means a bot, and the action answers those with the success state
        rather than an explanation.
      */}
      <div className="hidden" aria-hidden="true">
        <label htmlFor="company_website">Company website</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Field id="name" label="Name" required error={state.errors?.name}>
        <input
          id="name"
          name="name"
          required
          defaultValue={v?.name}
          autoComplete="name"
          placeholder=" "
          aria-invalid={state.errors?.name ? true : undefined}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          className="field__input"
        />
      </Field>

      <Field id="company" label="Company">
        <input
          id="company"
          name="company"
          defaultValue={v?.company}
          autoComplete="organization"
          placeholder=" "
          className="field__input"
        />
      </Field>

      <Field id="email" label="Email" required error={state.errors?.email}>
        <input
          id="email"
          name="email"
          type="email"
          required
          defaultValue={v?.email}
          autoComplete="email"
          placeholder=" "
          aria-invalid={state.errors?.email ? true : undefined}
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          className="field__input"
        />
      </Field>

      <Field id="phone" label="Phone">
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={v?.phone}
          autoComplete="tel"
          placeholder=" "
          className="field__input"
        />
      </Field>

      {/* A <select> always has a value, so its label cannot float on demand. */}
      <Field
        id="service"
        label="Service of interest"
        staticLabel
        className="sm:col-span-2"
      >
        <select
          id="service"
          name="service"
          defaultValue={v?.service ?? ""}
          className="field__input"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.slug} value={service.title}>
              {service.title}
            </option>
          ))}
          <option value="Other">Something else</option>
        </select>
      </Field>

      {/*
        The hint used to be the placeholder, which vanished the moment anyone
        started typing — exactly when it was still needed. A floating label
        needs `placeholder=" "` anyway, so it becomes persistent helper text
        and is bound to the control with `aria-describedby`.
      */}
      <div className="sm:col-span-2">
        <Field
          id="message"
          label="How can we help?"
          required
          error={state.errors?.message}
        >
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            defaultValue={v?.message}
            placeholder=" "
            aria-invalid={state.errors?.message ? true : undefined}
            aria-describedby={
              state.errors?.message ? "message-error" : "message-hint"
            }
            className="field__input"
          />
        </Field>
        <p id="message-hint" className="mt-2 text-[0.85rem] text-ink-muted">
          Number of sites, node count, the hours that matter, and the response
          time you need.
        </p>
      </div>

      <div className="sm:col-span-2">
        <div className="flex flex-wrap items-center gap-4">
          <SubmitButton state={state} />

          {/*
            A button, not a link with an href: the address has to be built from
            what is in the fields at the moment it is clicked, not at the
            moment this rendered. Someone who fixes a typo after a failed send
            must get the corrected text, and reading the form during render
            would freeze the old copy into the href.
          */}
          {failed && (
            <button
              type="button"
              onClick={() => {
                window.location.href = mailtoHref();
              }}
              className="inline-flex items-center gap-2 border border-rule-strong px-5 py-3 text-[0.9rem] font-semibold text-ink transition-colors hover:border-ink hover:bg-paper-warm"
            >
              Open your mail client instead
            </button>
          )}
        </div>

        {/*
          The live region is a sibling of the button and holds only text. The
          checkmark is `aria-hidden` inside the button, so the outcome is
          announced once, in words, rather than as a graphic.
        */}
        <p aria-live="polite" className="mt-4 text-[0.875rem] text-ink-muted">
          {state.status === "idle" &&
            "We reply to enquiries within one business day."}
          {state.status === "sent" &&
            "Thank you. Your enquiry is on its way, and we will reply within one business day."}
          {state.status === "invalid" && state.message}
          {state.status === "error" &&
            `${state.message} Please use the button above to send it from your own mail client, or email ${ENQUIRY_TO} directly.`}
          {state.status === "unconfigured" &&
            `This site is not yet set up to send mail directly. Use the button above to send the same enquiry from your mail client, or email ${ENQUIRY_TO}.`}
        </p>
      </div>
    </form>
  );
}
