/**
 * The assistant's knowledge, and the matcher that picks an answer.
 *
 * **This is a scripted assistant, not a language model.** The site has no
 * backend beyond the enquiry mailer and every route prerenders; wiring a live
 * model in would mean an API key, a streaming endpoint and a per-message bill
 * for what is, on a seven-service marketing site, a finite set of questions.
 * So the bot answers from `site.ts` — the same single source of truth the
 * pages render from, which means an answer can never drift from the page it
 * points at.
 *
 * Two rules follow from that, and both matter more than the matcher:
 *
 *   1. **It never invents.** Every figure here is read from `site.ts` rather
 *      than typed out, so there is no second copy to fall out of date.
 *   2. **It never dead-ends.** Anything it cannot answer hands over to a
 *      human — the phone number, the right mailbox, or the enquiry form — in
 *      the same turn. A chat widget that says "I don't understand" and stops
 *      is worse for a visitor than no chat widget at all.
 *
 * To put a real model behind it later, keep `Reply` as the response shape and
 * replace `answer()` with a call to your endpoint; the widget only knows about
 * this module's types.
 */

import {
  allCentres,
  company,
  contact,
  regions,
  services,
  stats,
  supportTiers,
} from "@/lib/site";

/** A suggested next question. The label is what the visitor sees on the chip. */
export type Suggestion = { label: string; intent: string };

/** A link out of the conversation and into the page that actually covers it. */
export type ReplyLink = { label: string; href: string };

export type Reply = {
  /** Paragraphs. Kept short — a chat bubble is not a page. */
  body: string[];
  links?: ReplyLink[];
  suggestions?: Suggestion[];
};

type Intent = {
  id: string;
  /**
   * Matched against the normalised message. Multi-word phrases score higher
   * than single words, so "service centre" beats a bare "service".
   */
  keywords: string[];
  reply: () => Reply;
};

const centreCount = allCentres.length;
const engineerStat = stats.find((s) => s.label === "Full-time engineers");
const nodeStat = stats.find((s) => s.label === "Customer nodes managed");
const salesEmail =
  contact.emails.find((e) => e.label.startsWith("Sales"))?.address ??
  contact.emails[0].address;
const supportEmail =
  contact.emails.find((e) => e.label.startsWith("Technical"))?.address ??
  contact.emails[0].address;
const hrEmail =
  contact.emails.find((e) => e.label.startsWith("Careers"))?.address ??
  contact.emails[0].address;

/** Offered under most answers, so there is always a way forward. */
const CLOSING: Suggestion[] = [
  { label: "Talk to someone", intent: "contact" },
  { label: "Where are you located?", intent: "coverage" },
];

export const GREETING: Reply = {
  body: [
    `Hello — you're speaking to the ${company.name} assistant.`,
    "I can walk you through our services, coverage and response times, or put you in touch with the team. What do you need?",
  ],
  suggestions: [
    { label: "What do you do?", intent: "services" },
    { label: "Response times", intent: "sla" },
    { label: "Service centres", intent: "coverage" },
    { label: "Get a quote", intent: "quote" },
  ],
};

const INTENTS: Intent[] = [
  {
    id: "services",
    keywords: [
      "what do you do",
      "what services",
      "your services",
      "services",
      "service list",
      "offer",
      "provide",
      "capabilities",
      "solutions",
    ],
    reply: () => ({
      body: [
        `We run ${services.length} service lines, all of them IT support and delivery for corporate customers:`,
        services.map((s) => `• ${s.title} — ${s.short}`).join("\n"),
        "Ask me about any one of them and I'll go into detail.",
      ],
      links: [{ label: "All services", href: "/services" }],
      suggestions: [
        { label: "Managed services", intent: "it-managed-services" },
        { label: "IT helpdesk", intent: "it-helpdesk" },
        { label: "Warranty", intent: "authorised-warranty-provider" },
      ],
    }),
  },
  {
    id: "sla",
    keywords: [
      "sla",
      "response time",
      "how fast",
      "how quickly",
      "turnaround",
      "uptime",
      "24/7",
      "24 7",
      "support hours",
      "service level",
      "tier",
    ],
    reply: () => ({
      body: [
        "Support is contracted against one of four tiers, written around your operating hours rather than ours:",
        supportTiers
          .map((t) => `• ${t.name} — ${t.coverage}, ${t.response}`)
          .join("\n"),
        "Which tier fits usually comes down to what the system costs you per hour when it is down. The team can size that with you.",
      ],
      links: [
        { label: "IT Support & Managed Services", href: "/services/it-managed-services" },
        { label: "Request a proposal", href: "/contact" },
      ],
      suggestions: CLOSING,
    }),
  },
  {
    id: "coverage",
    keywords: [
      "coverage",
      "service centre",
      "service center",
      "where are you",
      "location",
      "locations",
      "branch",
      "branches",
      "nationwide",
      "east malaysia",
      "sabah",
      "sarawak",
      "office",
      "address",
      "map",
    ],
    reply: () => ({
      body: [
        // Region names contain their own commas ("Sabah, Sarawak & Labuan"),
        // so they are counted rather than listed — a comma-joined list of them
        // reads as more regions than there are.
        `${centreCount} service centres, each stocked for parts replacement: ${regions
          .map((r) => `${r.centres.length} in ${r.name}`)
          .join("; ")}.`,
        `Head office is at ${contact.addressLines.join(", ")}.`,
        `${engineerStat?.value ?? 70} full-time engineers are deployed from those centres, so an onsite dispatch is not a subcontractor. The phone helpdesk and nationwide service and support both run 24 × 7.`,
      ],
      links: [
        { label: "Coverage map", href: "/service-centre/map" },
        { label: "Centre directory", href: "/service-centre" },
      ],
      suggestions: [
        { label: "Response times", intent: "sla" },
        { label: "Talk to someone", intent: "contact" },
      ],
    }),
  },
  {
    id: "contact",
    keywords: [
      "contact",
      "talk to",
      "speak to",
      "call",
      "phone",
      "email",
      "reach you",
      "human",
      "someone",
      "sales",
      "enquiry",
      "inquiry",
    ],
    reply: () => ({
      body: [
        "Happiest to hand you to a person:",
        [
          `• Phone — ${contact.phoneDisplay}`,
          `• Sales — ${salesEmail}`,
          `• Technical support — ${supportEmail}`,
        ].join("\n"),
        "Or leave your details on the contact form and the right person picks it up.",
      ],
      links: [
        { label: "Contact form", href: "/contact" },
        { label: `Call ${contact.phoneDisplay}`, href: `tel:${contact.phoneDial}` },
      ],
    }),
  },
  {
    id: "quote",
    keywords: [
      "quote",
      "quotation",
      "proposal",
      "price",
      "pricing",
      "cost",
      "how much",
      "budget",
      "rate",
      "fee",
    ],
    reply: () => ({
      body: [
        "Pricing is per contract — it moves with the tier you need, the node count and how far the sites are spread, so there is no list price I can quote you honestly.",
        `Send us the scope and you'll get a written proposal back. ${salesEmail} reaches sales directly, or use the form and it lands in the same place.`,
      ],
      links: [
        { label: "Request a proposal", href: "/contact" },
        { label: "Response tiers", href: "/services/it-managed-services" },
      ],
      suggestions: [{ label: "Response times", intent: "sla" }],
    }),
  },
  {
    id: "about",
    keywords: [
      "about",
      "who are you",
      "company",
      "history",
      "how long",
      "experience",
      "years",
      "size",
      "how many engineers",
      "background",
    ],
    reply: () => ({
      body: [
        `${company.legalName} has been in IT support since ${company.copyrightFrom}. ${company.tagline}, in the company's own words.`,
        `Today: ${centreCount} service centres, ${engineerStat?.value ?? 70} full-time engineers, and around ${(nodeStat?.value ?? 50000).toLocaleString("en-MY")}+ customer nodes under contract.`,
      ],
      links: [
        { label: "About us", href: "/about-us" },
        { label: "Case studies", href: "/case-study" },
      ],
      suggestions: CLOSING,
    }),
  },
  {
    id: "partners",
    keywords: [
      "partner",
      "partners",
      "brand",
      "brands",
      "principal",
      "vendor",
      "authorised",
      "authorized",
      "certified",
      "hardware",
    ],
    reply: () => ({
      body: [
        "We're an authorised partner to the principals whose kit we support, which is what lets us raise warranty claims on your behalf rather than leaving you to chase them.",
        "The full list is on the business partner page.",
      ],
      links: [
        { label: "Business partners", href: "/business-partner" },
        { label: "Warranty fulfilment", href: "/services/authorised-warranty-provider" },
      ],
      suggestions: CLOSING,
    }),
  },
  {
    id: "careers",
    keywords: [
      "career",
      "careers",
      "job",
      "jobs",
      "hiring",
      "vacancy",
      "vacancies",
      "recruit",
      "apply",
      "resume",
      "cv",
      "internship",
    ],
    reply: () => ({
      body: [
        `Careers and HR go to ${hrEmail} — send your CV there and mention the role or discipline you're after.`,
        `We hire engineers into all ${centreCount} centres, not only Puchong.`,
      ],
      links: [{ label: "About us", href: "/about-us" }],
    }),
  },
  {
    id: "casestudy",
    keywords: [
      "case study",
      "case studies",
      "reference",
      "customer",
      "client",
      "example",
      "portfolio",
      "track record",
      "who do you work with",
    ],
    reply: () => ({
      body: [
        "There are written engagements on the case study page covering deployment, managed support and warranty work.",
      ],
      links: [{ label: "Case studies", href: "/case-study" }],
      suggestions: CLOSING,
    }),
  },
  {
    id: "hours",
    keywords: [
      "open",
      "opening hours",
      "business hours",
      "working hours",
      "what time",
      "weekend",
      "public holiday",
    ],
    reply: () => ({
      body: [
        // hpe.com.my advertises a 24 × 7 phone helpdesk and 24 × 7 nationwide
        // service and support on its service-centre page. Saying "standard
        // business hours" here contradicted the company's own headline claim.
        "The phone helpdesk runs 24 × 7, and service and support is 24 × 7 nationwide.",
        `What that means contractually depends on your tier — Elite is 24 × 7, the others are 8 × 5. ${contact.phoneDisplay} reaches the helpdesk, ${supportEmail} the support mailbox.`,
      ],
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Coverage map", href: "/service-centre/map" },
      ],
      suggestions: [{ label: "Response times", intent: "sla" }],
    }),
  },
];

/*
 * One intent per service, generated from the data. Each service's own title and
 * slug become the keywords, so adding a service to `site.ts` teaches the
 * assistant about it with no edit here.
 */
const SERVICE_INTENTS: Intent[] = services.map((service) => ({
  id: service.slug,
  keywords: [
    service.title.toLowerCase(),
    service.slug.replace(/-/g, " "),
    ...service.title
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((w) => w.length > 4),
  ],
  reply: () => ({
    body: [service.summary, `Covered under: ${service.featureHeading}.`],
    links: [
      { label: service.title, href: `/services/${service.slug}` },
      { label: "Request a proposal", href: "/contact" },
    ],
    suggestions: [
      { label: "Response times", intent: "sla" },
      { label: "Coverage", intent: "coverage" },
    ],
  }),
}));

const ALL_INTENTS = [...INTENTS, ...SERVICE_INTENTS];

/** Lowercase, strip punctuation, collapse whitespace. */
function normalise(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const GREETING_ONLY =
  /^(hi|hey|hello|yo|good (morning|afternoon|evening)|salam|helo)\b/;

/**
 * Whole-word containment, not `String.includes`.
 *
 * A raw substring test matches across word boundaries, and it is not a corner
 * case: "who are your partners" contains "who are you", so the partners
 * question scored 3 for the *about* intent and 1 for its own, and answered
 * with the company history. The same trap catches "call" inside "recall" and
 * "job" inside "jobs". Boundaries are checked against the normalised text, so
 * punctuation has already gone.
 */
function containsPhrase(text: string, phrase: string) {
  const at = text.indexOf(phrase);
  if (at === -1) return false;
  const before = at === 0 ? " " : text[at - 1];
  const after = text[at + phrase.length] ?? " ";
  return !/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after);
}

/**
 * Picks an intent by keyword overlap.
 *
 * A phrase match scores by its word count, so "service centre" (2) outranks a
 * bare "service" (1) and the visitor asking where the branches are does not get
 * the services list. Below the threshold nothing is guessed — the fallback
 * hands over instead.
 */
export function answer(message: string): Reply {
  const text = normalise(message);
  if (!text) return GREETING;

  if (GREETING_ONLY.test(text) && text.split(" ").length <= 3) return GREETING;

  let best: { intent: Intent; score: number } | null = null;

  for (const intent of ALL_INTENTS) {
    let score = 0;
    for (const keyword of intent.keywords) {
      // Whole-word matching costs the free plural that substring matching gave
      // us, so the plural is tested explicitly: "partner" still meets
      // "partners", without "job" meeting "jobseeker".
      if (!containsPhrase(text, keyword) && !containsPhrase(text, `${keyword}s`))
        continue;
      const weight = keyword.split(" ").length;
      // Longest matching keyword wins the intent, rather than the intent with
      // the most incidental single-word hits.
      score = Math.max(score, weight);
    }
    if (score > 0 && (!best || score > best.score)) best = { intent, score };
  }

  if (best) return best.intent.reply();

  return {
    body: [
      "That one is outside what I can answer from the site — I'd rather hand you to someone than guess.",
      `${contact.phoneDisplay} reaches the office, ${salesEmail} reaches sales, and the contact form goes to whoever is the right fit.`,
    ],
    links: [
      { label: "Contact form", href: "/contact" },
      { label: `Call ${contact.phoneDisplay}`, href: `tel:${contact.phoneDial}` },
    ],
    suggestions: [
      { label: "What do you do?", intent: "services" },
      { label: "Service centres", intent: "coverage" },
    ],
  };
}

/** Runs a suggestion chip. Chips carry an intent id, so they never misfire. */
export function answerIntent(id: string): Reply {
  const intent = ALL_INTENTS.find((i) => i.id === id);
  return intent ? intent.reply() : answer(id);
}
