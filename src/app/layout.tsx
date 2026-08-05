import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SplashScreen, splashBootScript } from "@/components/splash-screen";
import { mapIntroBootScript } from "@/components/map-intro";
import { ScrollProgress } from "@/components/scroll-progress";
import { BackToTop } from "@/components/back-to-top";
import { ChatWidget } from "@/components/chat-widget";
import { themeBootScript } from "@/components/theme-toggle";
import { MotionScope } from "@/components/motion-toggle";
import { motionBootScript } from "@/lib/motion";
import { PressProvider } from "@/components/press";
import { SpotlightProvider } from "@/components/spotlight";
import { company, contact } from "@/lib/site";
import "./globals.css";
import "./splash.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://hpe.com.my"),
  title: {
    default: `${company.name} · ${company.tagline}`,
    template: `%s · ${company.name}`,
  },
  description:
    "HPE Solutions delivers IT support and managed services, project deployment, helpdesk, staffing and authorised warranty fulfilment from 18 service centres across Malaysia.",
  keywords: [
    "IT support Malaysia",
    "managed services",
    "IT helpdesk",
    "IT staffing",
    "authorised warranty provider",
    "project deployment",
    "Puchong",
  ],
  openGraph: {
    type: "website",
    locale: "en_MY",
    siteName: company.name,
    title: `${company.name} · ${company.tagline}`,
    description:
      "IT support and managed services, project deployment, helpdesk, staffing and warranty fulfilment, delivered nationwide under SLA.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-MY"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${inter.variable} h-full antialiased`}
      // `splashBootScript` adds `splash-pending` and `themeBootScript` adds
      // `data-theme` to this element before hydration, so its className and
      // attributes legitimately differ from the SSR output.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint so returning visitors never see the splash flash. */}
        {/*
          Must run before paint, or a dark-mode visitor gets a white flash on
          every load. Placed first so the theme is settled before anything else
          reads it.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        {/*
          Resolves `data-motion` before paint. Must precede the splash and map
          scripts below — both of them ask whether motion is allowed, and the
          answer is now this attribute rather than the media query.
        */}
        <script dangerouslySetInnerHTML={{ __html: motionBootScript }} />
        <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
        {/*
          Route-scoped, but it has to live here: a <script> rendered inside a
          page component is never executed on a client-side navigation, and
          React warns about it. The script guards on the pathname itself, and
          MapStage covers the client-navigation case in a layout effect.
        */}
        <script dangerouslySetInnerHTML={{ __html: mapIntroBootScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper">
        <noscript>
          {/*
            Second rule: with scripting off, `data-motion` is never written, so
            the attribute-scoped bail-outs in globals.css cannot match. The
            media query is the honest fallback for that case — every remaining
            effect here is CSS-only decoration, so switching all of it off is
            the whole of what those blocks would have done.
          */}
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}.split-part{opacity:1!important;transform:none!important}.split-rule{transform:scaleX(1)!important}.mask-reveal{clip-path:none!important}.mask-reveal__inner{transform:none!important}.splash{display:none!important}@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`}</style>
        </noscript>

        <SplashScreen />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:bg-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        {/* One delegated pointer listener drives every [data-press] element. */}
        <PressProvider />
        {/* And one more for the cursor spotlight on [data-spotlight] cards. */}
        <SpotlightProvider />

        <SiteHeader />
        <ScrollProgress />

        <main
          id="main"
          // Focus target for the skip link and for BackToTop, which has to move
          // focus as well as scroll or a keyboard user stays at the bottom.
          tabIndex={-1}
          className="flex-1 outline-none"
          style={{ paddingTop: "var(--header-h)" }}
        >
          <MotionScope>{children}</MotionScope>
        </main>

        <BackToTop />
        {/* Sits in the same corner as BackToTop, which stacks above it. */}
        <ChatWidget />

        <SiteFooter />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: company.legalName,
              alternateName: company.name,
              url: "https://hpe.com.my",
              description: company.tagline,
              telephone: contact.phoneDisplay,
              address: {
                "@type": "PostalAddress",
                streetAddress: "Block C 3-2, Setia Walk, Pusat Bandar Puchong",
                addressLocality: "Puchong",
                postalCode: "47160",
                addressRegion: "Selangor",
                addressCountry: "MY",
              },
              contactPoint: contact.emails.map((e) => ({
                "@type": "ContactPoint",
                contactType: e.label,
                email: e.address,
                telephone: contact.phoneDisplay,
              })),
            }),
          }}
        />
      </body>
    </html>
  );
}
