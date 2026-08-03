import type { Metadata } from "next";
import { Archivo, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SplashScreen, splashBootScript } from "@/components/splash-screen";
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
    default: `${company.name} — ${company.tagline}`,
    template: `%s — ${company.name}`,
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
    title: `${company.name} — ${company.tagline}`,
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
      // `splashBootScript` adds `splash-pending` to this element before
      // hydration, so its className legitimately differs from the SSR output.
      suppressHydrationWarning
    >
      <head>
        {/* Runs before paint so returning visitors never see the splash flash. */}
        <script dangerouslySetInnerHTML={{ __html: splashBootScript }} />
      </head>
      <body className="flex min-h-full flex-col bg-paper">
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}.splash{display:none!important}`}</style>
        </noscript>

        <SplashScreen />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:bg-brand focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        <SiteHeader />

        <main id="main" className="flex-1" style={{ paddingTop: "var(--header-h)" }}>
          {children}
        </main>

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
