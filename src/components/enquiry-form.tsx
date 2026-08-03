"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { services } from "@/lib/site";

const SALES = "sales@hpe.com.my";

const inputClass =
  "w-full border border-rule bg-paper px-4 py-3 text-[0.95rem] text-ink transition-colors placeholder:text-ink-muted focus:border-brand focus:outline-none";

const labelClass =
  "block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-ink-muted";

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
      <div>
        <label className={labelClass} htmlFor="name">
          Name <span className="text-brand">*</span>
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className={`${inputClass} mt-2.5`}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="company">
          Company
        </label>
        <input
          id="company"
          name="company"
          autoComplete="organization"
          className={`${inputClass} mt-2.5`}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="email">
          Email <span className="text-brand">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={`${inputClass} mt-2.5`}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="phone">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={`${inputClass} mt-2.5`}
        />
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="service">
          Service of interest
        </label>
        <select
          id="service"
          name="service"
          defaultValue=""
          className={`${inputClass} mt-2.5`}
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.slug} value={service.title}>
              {service.title}
            </option>
          ))}
          <option value="Other">Something else</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <label className={labelClass} htmlFor="message">
          How can we help? <span className="text-brand">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          placeholder="Number of sites, node count, the hours that matter, and the response time you need."
          className={`${inputClass} mt-2.5 resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="group inline-flex items-center gap-2.5 bg-brand px-7 py-3.5 text-[0.925rem] font-semibold text-white transition-colors hover:bg-brand-strong"
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
