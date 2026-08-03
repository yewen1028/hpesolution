"use client";

/**
 * Last-resort boundary: catches errors thrown by the root layout itself.
 *
 * This *replaces* the root layout, so nothing it normally provides exists here
 * — no `globals.css`, no `next/font` variables, no header or footer. Every
 * style below is therefore inline and every value is literal rather than a
 * token, because the token definitions live in a stylesheet that is not loaded
 * on this screen. That is not a shortcut; referencing `var(--color-brand)` here
 * would silently render as nothing.
 *
 * It has to render its own <html> and <body> for the same reason.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-MY">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#ffffff",
          color: "#3f464f",
          fontFamily:
            '"Segoe UI", system-ui, -apple-system, Helvetica, Arial, sans-serif',
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <main style={{ maxWidth: "34rem" }}>
          {/* The eyebrow's orange rule, rebuilt without the stylesheet. */}
          <p
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: 0,
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6d7480",
            }}
          >
            <span
              style={{
                width: "1.75rem",
                height: "2px",
                background: "#f26f21",
                display: "inline-block",
              }}
            />
            Service interrupted
          </p>

          <h1
            style={{
              margin: "1.5rem 0 0",
              fontSize: "clamp(2rem, 1.4rem + 2.6vw, 3rem)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              fontWeight: 600,
              color: "#14181d",
            }}
          >
            The site failed to start.
          </h1>

          <p
            style={{
              margin: "1.5rem 0 0",
              fontSize: "1.0625rem",
              lineHeight: 1.65,
            }}
          >
            This is a fault at our end. Reloading will usually clear it. If it
            persists, call{" "}
            <a
              href="tel:+60358889817"
              style={{ color: "#14181d", fontWeight: 600 }}
            >
              +60.3.5888.9817
            </a>{" "}
            and we will pick it up directly.
          </p>

          <div style={{ marginTop: "2.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
                cursor: "pointer",
                background: "#f26f21",
                color: "#ffffff",
                padding: "0.875rem 1.5rem",
                fontSize: "0.925rem",
                fontWeight: 600,
                fontFamily: "inherit",
              }}
            >
              Try again
            </button>

            {/*
              A real anchor, not next/link, and the lint rule is wrong here
              specifically: the root layout has thrown, so a client-side
              navigation would re-enter the same broken tree. This has to be a
              document request that reloads the app from scratch.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                border: "1px solid #d3cec7",
                color: "#14181d",
                padding: "0.875rem 1.5rem",
                fontSize: "0.925rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to home
            </a>
          </div>

          {error.digest && (
            <p
              style={{
                marginTop: "2.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #e7e3de",
                fontSize: "0.85rem",
                color: "#6d7480",
              }}
            >
              Reference{" "}
              <span style={{ fontVariantNumeric: "tabular-nums", color: "#14181d", fontWeight: 600 }}>
                {error.digest}
              </span>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
