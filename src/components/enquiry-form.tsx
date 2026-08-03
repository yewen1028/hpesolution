"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { services } from "@/lib/site";

const SALES = "sales@hpe.com.my";

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
  className = "",
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  /** For controls with no `:placeholder-shown` state, i.e. <select>. */
  staticLabel?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`field ${className}`}
      data-static-label={staticLabel ? "" : undefined}
    >
      {children}
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="text-brand"> *</span>}
      </label>
      <span className="field__line" aria-hidden="true" />
    </div>
  );
}

/**
 * There is no backend on this site, so the form composes a structured message
 * and hands it to the visitor's mail client. Nothing is silently dropped, and
 * the visitor keeps a copy of what they sent.
 */
export function EnquiryForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const get = (key: string) => String(data.get(key) ?? "").trim();

    const body = [
      `Name: ${get("name")}`,
      `Company: ${get("company") || "—"}`,
      `Email: ${get("email")}`,
      `Phone: ${get("phone") || "—"}`,
      `Service of interest: ${get("service") || "—"}`,
      "",
      "Enquiry:",
      get("message"),
    ].join("\n");

    const subject = `Website enquiry — ${get("service") || "General"} — ${get("name")}`;

    window.location.href = `mailto:${SALES}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setSent(true);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
      <Field id="name" label="Name" required>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          placeholder=" "
          className="field__input"
        />
      </Field>

      <Field id="company" label="Company">
        <input
          id="company"
          name="company"
          autoComplete="organization"
          placeholder=" "
          className="field__input"
        />
      </Field>

      <Field id="email" label="Email" required>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder=" "
          className="field__input"
        />
      </Field>

      <Field id="phone" label="Phone">
        <input
          id="phone"
          name="phone"
          type="tel"
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
          defaultValue=""
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
        <Field id="message" label="How can we help?" required>
          <textarea
            id="message"
            name="message"
            required
            rows={6}
            placeholder=" "
            aria-describedby="message-hint"
            className="field__input"
          />
        </Field>
        <p id="message-hint" className="mt-2 text-[0.85rem] text-ink-muted">
          Number of sites, node count, the hours that matter, and the response
          time you need.
        </p>
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          data-press="cta"
          className="btn-fill group inline-flex items-center gap-2.5 bg-brand px-7 py-3.5 text-[0.925rem] font-semibold text-white"
        >
          Send enquiry
          <Send
            size={16}
            strokeWidth={2.25}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </button>

        <p aria-live="polite" className="mt-4 text-[0.875rem] text-ink-muted">
          {sent
            ? `Your mail client should now be open with the enquiry ready to send to ${SALES}. If nothing happened, email us directly.`
            : `Submitting opens your mail client with the enquiry addressed to ${SALES}.`}
        </p>
      </div>
    </form>
  );
}
