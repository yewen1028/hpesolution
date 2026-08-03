"use client";

import { useEffect } from "react";
import { RotateCw } from "lucide-react";
import { ButtonLink, Container } from "@/components/ui";
import { contact } from "@/lib/site";

/**
 * Route-level error boundary. Without this, an uncaught render error inside any
 * page shows Next's stock "Application error: a client-side exception has
 * occurred" — the one screen on the site not written by anyone.
 *
 * Keeps the site chrome: header, footer and nav still render, because this
 * replaces only the page below the layout. Someone who hits it is one click
 * from anywhere rather than stranded.
 *
 * Voice matches `not-found.tsx` — plain, specific, no apology theatre. This is
 * a company that sells fault escalation; the error page should read like they
 * know what a fault is.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // No telemetry on this site, so the console is the only sink. If one is
    // added later, this is the hook — the digest is what correlates a report
    // to a server-side stack trace.
    console.error("Route error:", error);
  }, [error]);

  return (
    <section className="py-32 sm:py-48">
      <Container>
        <div className="max-w-2xl">
          <p className="eyebrow">Something went wrong</p>

          <h1 className="display-1 mt-6">This page failed to load.</h1>

          <p className="lede mt-7">
            The fault is on our side, not yours. Reloading usually clears it. If
            it does not, the rest of the site is unaffected and our team can be
            reached directly.
          </p>

          <div className="mt-11 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={reset}
              className="btn-fill group inline-flex items-center gap-2.5 bg-brand px-6 py-3.5 text-[0.925rem] font-semibold text-white"
            >
              Try again
              <RotateCw
                size={16}
                strokeWidth={2.25}
                aria-hidden="true"
                className="transition-transform duration-500 group-hover:rotate-180"
              />
            </button>

            <ButtonLink href="/" variant="ghost">
              Back to home
            </ButtonLink>
          </div>

          <p className="mt-10 border-t border-rule pt-6 text-[0.9rem] text-ink-muted">
            Need this resolved now? Call{" "}
            <a
              href={`tel:${contact.phoneDial}`}
              className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4"
            >
              {contact.phoneDisplay}
            </a>
            .
            {error.digest && (
              <>
                {" "}
                Quote reference{" "}
                <span className="tabular font-semibold text-ink">
                  {error.digest}
                </span>
                .
              </>
            )}
          </p>
        </div>
      </Container>
    </section>
  );
}
