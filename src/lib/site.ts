/**
 * Single source of truth for every piece of copy and every figure on the site.
 * Factual details (services, coverage, addresses, contacts, engagement history)
 * are taken from hpe.com.my; the connective prose is written for this build.
 */

export const company = {
  legalName: "HPE Solutions (M) Sdn Bhd",
  name: "HPE Solutions",
  tagline: "Malaysia's established IT support service provider",
  copyrightFrom: 2011,
} as const;

export const contact = {
  addressLines: [
    "Block C 3-2, Setia Walk",
    "Pusat Bandar Puchong",
    "47160 Puchong, Selangor",
    "Malaysia",
  ],
  phoneDisplay: "+60.3.5888.9817",
  phoneDial: "+60358889817",
  emails: [
    { label: "Sales & Marketing", address: "sales@hpe.com.my" },
    { label: "Technical Support", address: "support@hpe.com.my" },
    { label: "Careers & HR", address: "hr@hpe.com.my" },
  ],
  privacyNoticeUrl:
    "https://hpe.com.my/wp-content/uploads/2023/05/HPE-PrivacyNotice-2023-05.pdf",
} as const;

export type Stat = {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  note: string;
};

export const stats: Stat[] = [
  {
    value: 10,
    prefix: "",
    suffix: "+",
    label: "Years in service",
    note: "Delivering IT support and maintenance contracts across Malaysia.",
  },
  {
    value: 18,
    suffix: "",
    label: "Service centres",
    note: "Peninsular and East Malaysia, stocked for parts replacement.",
  },
  {
    value: 70,
    suffix: "",
    label: "Full-time engineers",
    note: "Permanent professional support staff, deployed nationwide.",
  },
  {
    value: 50000,
    suffix: "+",
    label: "Customer nodes managed",
    note: "Servers, endpoints, network devices and peripherals under contract.",
  },
];

export type IconName =
  | "ServerCog"
  | "Boxes"
  | "Headset"
  | "Users"
  | "ShieldCheck"
  | "Network"
  | "Wrench";

export type Service = {
  slug: string;
  title: string;
  short: string;
  summary: string;
  icon: IconName;
  image: string;
  imageAlt: string;
  featureHeading: string;
  /**
   * True when `features` describe a sequence rather than a catalogue. Only
   * these render as a scroll-linked timeline — drawing a progressive line
   * through "Helpdesk models" or "Solution areas" would assert an order that
   * does not exist in the content.
   */
  featureFlow?: boolean;
  features: { title: string; body: string }[];
  benefits: { title: string; body: string }[];
  /**
   * The page's **one** parallax figure below the hero, and the only thing that
   * differentiates these seven pages structurally — they otherwise share a
   * template.
   *
   * One per page is the whole rule. The hero already drifts, so a second
   * photographic figure is the most a page can carry before the scroll stops
   * reading as depth and starts reading as noise. The figure is chosen against
   * the subject, not rotated for variety:
   *
   *   `aperture` — the photo is pinned and the section travels over it, so the
   *                picture reads as something standing still that the page
   *                passes across. It wants a tall section and a subject that is
   *                a *place*: the estate, the floor.
   *   `drift`    — the photo lags inside its own frame. Gentler, and right
   *                where the subject is an *object* or a moment rather than a
   *                standing place, and on pages whose features already render
   *                as a scroll-linked timeline.
   */
  band?: {
    image: string;
    alt: string;
    variant: "drift" | "aperture";
    eyebrow: string;
    line: string;
  };
  /** Optional ordered checklist, used where the source scope is procedural. */
  scope?: { heading: string; items: string[] }[];
  /** Optional service-tier table. */
  tiers?: { name: string; coverage: string; response: string }[];
};

/**
 * The four SLA tiers, exactly as hpe.com.my publishes them on the IT managed
 * services page. Exported because the home page's Service Level Assurance band
 * shows the same table: two copies drift, and one of them did — the remote
 * tier's commitment is "SBD/3BD/5BD", not an unspecified ad-hoc arrangement.
 */
export const supportTiers = [
  { name: "Elite", coverage: "24 × 7", response: "4-hour response" },
  { name: "Premium", coverage: "8 × 5", response: "4-hour response" },
  { name: "Standard", coverage: "8 × 5", response: "Next business day" },
  { name: "Remote", coverage: "8 × 5", response: "Same, 3 or 5 business days" },
];

export const services: Service[] = [
  {
    slug: "it-managed-services",
    title: "IT Support & Managed Services",
    short: "Contracted support for corporate network, systems and applications.",
    summary:
      "Our contracted IT management and support covers corporate network, system and application layers, delivered against a service level agreement written around your operating hours rather than ours.",
    icon: "ServerCog",
    image: "/media/svc-managed-services.jpg",
    imageAlt: "Engineer checking a tablet beside racked servers",
    /*
     * Aperture. The estate is the subject and it does not move — the contract
     * runs across it. This is also the longest of the seven pages (timeline,
     * scope, tiers, benefits), so it has the height the stronger figure wants.
     */
    band: {
      image: "/media/band-network-rack.jpg",
      alt: "A lit aisle between two rows of closed server cabinets",
      variant: "aperture",
      eyebrow: "Under contract",
      line: "Around 50,000 customer nodes sit under contract across 18 centres — servers, endpoints, network devices and peripherals, each on a defined escalation path.",
    },
    featureHeading: "How the contract runs",
    featureFlow: true,
    features: [
      {
        title: "Fault ticketing and escalation",
        body: "Every fault is logged, classified and escalated on a defined path, so nothing sits in an inbox waiting to be noticed.",
      },
      {
        title: "Phone and remote triage",
        body: "First-line troubleshooting happens over the phone or remotely, which resolves a large share of tickets before an engineer is dispatched.",
      },
      {
        title: "Principal warranty claims",
        body: "Where the fault is covered by the manufacturer, we raise and pursue the warranty claim on your behalf.",
      },
      {
        title: "Onsite engineer dispatch",
        body: "When remote triage will not close the ticket, an engineer is assigned and attends site with the right parts.",
      },
      {
        title: "Parts replacement",
        body: "Faulty components are replaced with new parts. Out-of-warranty items are quoted as chargeable before any work proceeds.",
      },
      {
        title: "Software repair and access recovery",
        body: "Software faults are resolved by reinstalling the application or reapplying its patches, and a user locked out of their account has their login credentials reassigned.",
      },
      {
        title: "Daily progress reporting",
        body: "Open tickets are reported daily, and loaner-part inventory is tracked at the service centre holding them.",
      },
    ],
    scope: [
      {
        heading: "Recurring maintenance scope",
        items: [
          "Hardware inventory reporting for audit",
          "End-user database and location records kept current",
          "Software licensing inventory management",
          "Security policy reapplied; unauthorised software removed",
          "Critical updates, patches and service packs applied",
          "Malware, virus, trojan and spyware removal",
          "Physical cleaning of equipment",
          "Asset tag verification and updates",
          "Hardware log capture for reporting",
          "Add-on hardware and software configuration",
        ],
      },
    ],
    tiers: supportTiers,
    benefits: [
      {
        title: "Cost-effective",
        body: "A contracted team costs less than carrying equivalent headcount, tooling and spares in-house.",
      },
      {
        title: "Flexible and scalable",
        body: "Coverage scales with your estate, so a new site or a seasonal peak does not require a hiring round.",
      },
      {
        title: "Continuous service improvement",
        body: "Ticket trends are reviewed rather than filed, so the recurring faults get engineered out instead of being reopened every month.",
      },
      {
        title: "Risk mitigation",
        body: "Defined escalation paths and stocked spares keep a single hardware failure from becoming an outage.",
      },
      {
        title: "Operational control",
        body: "Ticket data and SLA reporting give you a factual view of what is failing and how often.",
      },
    ],
  },
  {
    slug: "project-deployment",
    title: "Project Deployment",
    short: "Full project management from IT assessment through to rollout.",
    summary:
      "We manage IT deployments from small office refreshes to nationwide rollouts, covering network devices, servers, storage, desktops, laptops, software, systems and applications: new installations, upgrades and migrations alike.",
    icon: "Boxes",
    image: "/media/svc-project-deployment.jpg",
    imageAlt: "Technician working at a rack in a server room",
    /*
     * Drift, not aperture: this page's features already render as a
     * scroll-linked timeline, and a pinned band underneath it would be two
     * scroll figures competing over the same few hundred pixels. The subject is
     * an object — kit staged and boxed — which is what drift suits.
     */
    band: {
      image: "/media/case-audit.jpg",
      alt: "Laptops stacked on their shipping cartons",
      variant: "drift",
      eyebrow: "Off-site first",
      line: "Commissioning, imaging and testing are finished before anything reaches your floor, so the site visit is an installation rather than a build.",
    },
    featureHeading: "What a deployment looks like",
    featureFlow: true,
    features: [
      {
        title: "Project kick-start",
        body: "Planning, project charter, timeline, team assignment and defined deliverables, with risk assessed before the first box is opened.",
      },
      {
        title: "Off-site preparation",
        body: "As much as possible is completed before we reach your premises: commissioning, software installation, customised imaging and testing.",
      },
      {
        title: "On-site installation",
        body: "Shipping, installation, initialisation and testing customised to the environment the equipment is going into.",
      },
      {
        title: "Flexible scheduling",
        body: "Large rollouts can run outside working hours so the floor keeps operating while the estate changes underneath it.",
      },
      {
        title: "Dedicated installation teams",
        body: "For large-scale rollouts we stand up a dedicated team of project managers, consultants and engineers for the duration.",
      },
    ],
    benefits: [
      {
        title: "Economy of scale",
        body: "Deployment cost per unit falls as volume rises, because the preparation work is done once and repeated.",
      },
      {
        title: "Reduced risk",
        body: "ITIL-aligned practice with full documentation means the rollout is repeatable and auditable.",
      },
      {
        title: "Extra resource",
        body: "Your in-house team stays on business-as-usual instead of being consumed by the project.",
      },
      {
        title: "Committed timeline",
        body: "Regular progress meetings keep the schedule honest and surface slippage while it can still be recovered.",
      },
      {
        title: "Minimum disruption",
        body: "Off-site preparation and out-of-hours scheduling keep the impact on daily operations small.",
      },
    ],
  },
  {
    slug: "it-helpdesk",
    title: "IT Helpdesk",
    short: "Outsourced inbound and outbound helpdesk, on-site or off-site.",
    summary:
      "Outsource your helpdesk to us and keep the service quality. We run in-house inbound and outbound call handling, online troubleshooting and off-premise helpdesk operations under a measured SLA.",
    icon: "Headset",
    image: "/media/svc-helpdesk.jpg",
    imageAlt: "Helpdesk agent wearing a headset at a call centre desk",
    /* Drift. The subject is people at a moment of work, not a standing place. */
    band: {
      image: "/media/band-office.jpg",
      alt: "Two colleagues working at adjacent desks in an open office",
      variant: "drift",
      eyebrow: "24 × 7",
      line: "The phone helpdesk runs around the clock, and performance is measured against the SLA rather than asserted.",
    },
    featureHeading: "Helpdesk models",
    features: [
      {
        title: "Helpdesk management solution",
        body: "On-site helpdesk management or an off-site solution, tailored to how your organisation actually takes calls.",
      },
      {
        title: "Helpdesk resourcing",
        body: "Helpdesk agents on long-term or short-term terms, so the call centre keeps running through leave and attrition.",
      },
      {
        title: "Training services",
        body: "Courses built around your environment, with regular refreshers to keep agent knowledge current.",
      },
      {
        title: "Disaster recovery helpdesk",
        body: "A standby helpdesk that can take over call centre functionality during a disruption. The model was proven through the pandemic.",
      },
    ],
    benefits: [
      {
        title: "Cost-effective",
        body: "An established team lead and agent pool costs less than building the same capability from scratch.",
      },
      {
        title: "Manpower resolved",
        body: "Staffing gaps stop being your problem, and performance is measured against the committed SLA.",
      },
      {
        title: "Continuous training",
        body: "Agents are retrained on a schedule rather than only when something has already gone wrong.",
      },
      {
        title: "Reporting you can act on",
        body: "Telephony IVR measures abandoned calls and feeds weekly and monthly reporting.",
      },
    ],
  },
  {
    slug: "it-staffing",
    title: "IT Staffing",
    short: "Contracted IT hardware resource, matched to the skill set you need.",
    summary:
      "IT hardware support staffing on long-term or short-term contract, sourced against the skill set and years of experience the role actually requires, with backfill built in.",
    icon: "Users",
    image: "/media/svc-staffing.jpg",
    imageAlt: "Two engineers working on cabling at a network rack",
    /*
     * Aperture. Staffing is about a floor that carries on working while people
     * are placed into it — a standing place the page travels across, which is
     * exactly the figure's subject.
     */
    band: {
      image: "/media/band-workspace.jpg",
      alt: "An open-plan technical floor with several people at monitors",
      variant: "aperture",
      eyebrow: "Placed, not posted",
      line: "Resource is matched to the skill set and the years the role actually needs, with backfill arranged before it is required rather than after.",
    },
    featureHeading: "Staffing arrangements",
    features: [
      {
        title: "Dedicated IT staffing",
        body: "In-house engineers supporting daily operations, at junior through senior levels depending on the scope.",
      },
      {
        title: "Backfill staffing",
        body: "Short-term cover for medical leave, resignations and time-boxed project delivery.",
      },
      {
        title: "Prepaid staffing",
        body: "For organisations needing occasional support or scheduled maintenance, a prepaid arrangement lowers standing cost.",
      },
      {
        title: "Agency contract staffing",
        body: "We hire against your requirements, commit to the skill set and deliver the agreed service.",
      },
      {
        title: "Shift and off-site standby",
        body: "Shift-basis staffing on your premises, or off-site standby 365 days a year under contract.",
      },
    ],
    benefits: [
      {
        title: "Cost-effective",
        body: "Drawing from an existing pool of varied skill sets costs less than running your own hiring pipeline.",
      },
      {
        title: "Manpower resolved",
        body: "Gaps are filled immediately, and the recruitment cycle disappears from your workload.",
      },
      {
        title: "The right skill set",
        body: "Matching the skill set to the job scope is what keeps service quality where it was promised.",
      },
    ],
  },
  {
    slug: "authorised-warranty-provider",
    title: "Authorised Warranty Provider",
    short: "Appointed ASP fulfilling principal warranty across 18 centres.",
    summary:
      "We are an appointed Authorised Support Partner for PC, server and network manufacturers, carrying parts on their behalf and fulfilling hardware and software warranty within the committed SLA, either on-site or as a walk-in claim at any of our 18 service centres.",
    icon: "ShieldCheck",
    image: "/media/svc-warranty.jpg",
    imageAlt: "A memory module being fitted into an opened laptop chassis",
    /* Drift. A claim is a moment in a queue, not a place. */
    band: {
      image: "/media/contact-support.jpg",
      alt: "A row of server cabinets receding down a data centre aisle",
      variant: "drift",
      eyebrow: "On the principal's behalf",
      line: "Parts are carried for the manufacturers we are appointed by, so a claim is fulfilled on site or at any of the 18 centres rather than posted away.",
    },
    featureHeading: "Claim handling",
    features: [
      {
        title: "Fault ticketing and escalation",
        body: "The claim is logged and routed the moment it arrives, whether from a corporate account or a consumer walk-in.",
      },
      {
        title: "Remote troubleshooting",
        body: "Faults are diagnosed remotely first, which avoids a dispatch where none is needed.",
      },
      {
        title: "Escalation to principal",
        body: "Confirmed hardware faults are escalated to the principal to claim warranty coverage.",
      },
      {
        title: "Engineer assignment",
        body: "An engineer is assigned on-site for claims that require attendance at the customer's premises.",
      },
      {
        title: "Parts replacement",
        body: "Faulty parts are replaced with new stock held on the principal's behalf at the servicing centre.",
      },
    ],
    benefits: [
      {
        title: "Save cost",
        body: "Principals leverage a shared resource pool in strategic locations instead of building their own field force.",
      },
      {
        title: "Meet the SLA",
        body: "Performance is measured on service level assurance, so principals keep the commitment they made to end customers.",
      },
      {
        title: "Nationwide coverage",
        body: "Eighteen centres deliver faster on-site and walk-in support without new infrastructure investment.",
      },
      {
        title: "Stock management",
        body: "We hold and manage replacement parts inventory, which removes the warehouse requirement.",
      },
    ],
  },
  {
    slug: "total-solution-sourcing",
    title: "Total Solution & Sourcing",
    short: "System integration and sourcing for network, wireless and security.",
    summary:
      "Total IT solution and sourcing built on our system integration experience and our partnerships with leading technology providers, delivering tested, cost-effective integrated infrastructure.",
    icon: "Network",
    image: "/media/svc-sourcing.jpg",
    imageAlt: "Numbered ports and link LEDs across the face of a rack switch",
    /*
     * Aperture, and the boxed-kit still again — shared with project deployment,
     * where it carries the opposite figure and a different line. Sourcing is
     * where that photograph is most literally on topic: this is the page about
     * supplying the hardware in those cartons.
     */
    band: {
      image: "/media/case-audit.jpg",
      alt: "Laptops stacked on their shipping cartons",
      variant: "aperture",
      eyebrow: "Supplied and integrated",
      line: "Desktops, laptops, servers and network equipment sourced direct or by tender, tested together before any of it ships.",
    },
    featureHeading: "Solution areas",
    features: [
      {
        title: "Network solutions",
        body: "Routers, switches, load balancers, WAN optimisers and 3G/4G connectivity, specified and delivered as one build.",
      },
      {
        title: "SD-WAN",
        body: "Nationwide managed SD-WAN on Riverbed, Silver Peak, Fortinet, Sangfor and Cisco platforms.",
      },
      {
        title: "Wireless",
        body: "WiFi infrastructure designed for offices, factory floors and datacentre environments.",
      },
      {
        title: "Server and desktop",
        body: "Desktops, laptops and servers supplied by direct purchase or through tender, across HP, Dell and Lenovo.",
      },
      {
        title: "Security",
        body: "Managed security delivered on Fortinet, Check Point and Sangfor technology.",
      },
    ],
    benefits: [
      {
        title: "One accountable party",
        body: "Sourcing, integration and ongoing support sit with the same team, so nobody is left arbitrating between vendors.",
      },
      {
        title: "Tested before it ships",
        body: "Integrated solutions are validated against your requirement rather than assembled on site and hoped for.",
      },
      {
        title: "Commercial leverage",
        body: "Principal and distributor relationships give SME clients pricing they would not reach directly.",
      },
    ],
  },
  {
    slug: "value-added-service",
    title: "Value Added Service",
    short: "IMAC, ad-hoc installation, mini projects and relocation.",
    summary:
      "The work that sits alongside a support contract: installs, moves, adds and changes, ad-hoc installation, mini project implementation and office relocation.",
    icon: "Wrench",
    image: "/media/svc-value-added.jpg",
    imageAlt: "Technician tracing cabling at the back of a rack",
    /* Drift. IMAC work is a series of small moments on someone else's floor. */
    band: {
      image: "/media/band-workspace.jpg",
      alt: "An open-plan technical floor with several people at monitors",
      variant: "drift",
      eyebrow: "Alongside the contract",
      line: "Installs, moves, adds and changes, mini projects and office relocation — the work that arrives between the scheduled ones.",
    },
    featureHeading: "Where our experience sits",
    features: [
      {
        title: "Microsoft environments",
        body: "Extensive Microsoft server-client project history: Active Directory, Exchange, MSSQL and Hyper-V implementation and support.",
      },
      {
        title: "Server and storage",
        body: "24 × 7 resource for datacentre Wintel server, storage, routine backup tape handling and VMware support, warranty fulfilment included.",
      },
      {
        title: "Network and security",
        body: "Network resource supporting Cisco, Juniper, Riverbed, Fortinet, Sangfor and Peplink estates.",
      },
      {
        title: "Infrastructure",
        body: "Structured cabling in Cat5e, Cat6a and fibre, plus WiFi 6 and mesh WiFi deployments.",
      },
      {
        title: "System integration",
        body: "Working with principals and distributors on competitive hardware, software licences, Wintel products and licence renewals.",
      },
    ],
    benefits: [
      {
        title: "IMAC",
        body: "Installs, moves, adds and changes handled under the same contract as your day-to-day support.",
      },
      {
        title: "Upgrades",
        body: "System, hardware and software upgrades run periodically as the requirement emerges.",
      },
      {
        title: "Mini projects",
        body: "Off-site preparation and on-site installation, scheduled for minimum disruption to daily operations.",
      },
      {
        title: "Relocation",
        body: "Moving office is an IT project as much as a logistics one; we take the IT half of it.",
      },
    ],
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export type CaseStudy = {
  sector: string;
  title: string;
  discipline: "IT Management & Support" | "Project Management & Deployment";
  /**
   * Wording for the contact band's rotating "your ___ estate" line. The badge
   * uses hpe.com.my's own sector label, and "Bank estate" / "Telco Provider
   * estate" do not read as English. Optional, and it defaults to `sector`.
   */
  estateLabel?: string;
  body: string;
  metrics: { value: string; label: string }[];
  image: string;
  imageAlt: string;
};

export const caseStudies: CaseStudy[] = [
  {
    sector: "Bank",
    estateLabel: "Banking",
    discipline: "IT Management & Support",
    title: "Principal contract maintenance for a major Malaysian bank",
    body: "Principal contract maintenance (8 × 5 × 2 hours) for a major Malaysian bank on their daily support and maintenance, business as usual, covering approximately 25,000 nodes nationwide across servers, desktops, laptops, printers and network devices.",
    metrics: [
      { value: "25,000", label: "Nodes under contract" },
      { value: "8×5×2h", label: "Response commitment" },
    ],
    image: "/media/case-banking.jpg",
    imageAlt: "Financial market ticker board",
  },
  {
    sector: "Retail",
    discipline: "IT Management & Support",
    title: "24 × 7 outlet support across 2,500 retail sites",
    body: "24 × 7 × 4-hour maintenance support for a retail customer across 2,500 outlets nationwide, covering outlet servers, POS systems, network devices, 3G and 4G modems and WiFi.",
    metrics: [
      { value: "2,500", label: "Outlets covered" },
      { value: "24×7×4h", label: "Response commitment" },
    ],
    image: "/media/case-retail.jpg",
    imageAlt: "Card payment terminal held out across a grocery checkout counter",
  },
  {
    sector: "Telco Provider",
    estateLabel: "Telecommunications",
    discipline: "IT Management & Support",
    title: "Nationwide network equipment maintenance for enterprise clients",
    body: "Nationwide 24 × 7 × 4-hour maintenance for Cisco routers and switches, Peplink link load balancers, Riverbed WAN optimisers and modems, serving enterprise and retail end customers including airports, electronics and furniture retailers, colleges and universities.",
    metrics: [
      { value: "24×7×4h", label: "Response commitment" },
      { value: "Nationwide", label: "Coverage" },
    ],
    image: "/media/case-telco.jpg",
    imageAlt: "Technicians working on rooftop cellular antennas",
  },
  {
    sector: "Media",
    discipline: "IT Management & Support",
    title: "Video and voice encoder and decoder support",
    body: "24 × 7 × 4-hour maintenance support for video and voice encoder and decoder network equipment.",
    metrics: [
      { value: "24×7×4h", label: "Response commitment" },
      { value: "Broadcast", label: "Equipment class" },
    ],
    image: "/media/case-media.jpg",
    imageAlt: "Operator running a video switcher beside a multiview monitor",
  },
  {
    sector: "Hospitality",
    discipline: "IT Management & Support",
    title: "Wireless and broadband support for an airline provider",
    body: "24 × 7 × 4-hour maintenance support on wireless and broadband, dedicated and wireless, for one of the airline providers.",
    metrics: [
      { value: "24×7×4h", label: "Response commitment" },
      { value: "Wireless + WAN", label: "Scope" },
    ],
    image: "/media/case-aviation.jpg",
    imageAlt: "Aircraft on stand at an airport at sunset",
  },
  {
    sector: "Bank",
    estateLabel: "Banking",
    discipline: "Project Management & Deployment",
    title: "IT asset inventory, SCCM audit and OS migration",
    body: "Completed IT asset inventory, SCCM auditing, preventive maintenance, Windows operating system migration and a desktop and laptop refresh, covering more than 25,000 client desktops and laptops, printers, network switches and servers across Malaysia and Bangkok.",
    metrics: [
      { value: "25,000+", label: "Endpoints audited" },
      { value: "2", label: "Countries" },
    ],
    image: "/media/case-audit.jpg",
    imageAlt: "Laptops stacked on their shipping cartons",
  },
  /*
   * Three separate oil & gas engagements, not one.
   *
   * These were previously carried as a single merged entry summarising all
   * three, which is how the page came to hold 28 of the source's 30. hpe.com.my
   * lists them as distinct projects under Project Management & Deployment —
   * different scopes, different estates, different years — and collapsing them
   * both undercounts the record and loses the detail that the encryption
   * rollout was awarded to a single vendor.
   */
  {
    sector: "Oil & Gas",
    discipline: "Project Management & Deployment",
    title: "Active Directory migration for 10,000 end users",
    body: "Project management and deployment of a Microsoft Active Directory migration with Windows operating system migration and upgrade, covering 10,000 end-user desktops and laptops countrywide.",
    metrics: [
      { value: "10,000", label: "End users migrated" },
      { value: "Nationwide", label: "Coverage" },
    ],
    image: "/media/case-oil-gas.jpg",
    imageAlt: "Aerial view of an oil refinery with storage spheres and flare stacks",
  },
  {
    sector: "Oil & Gas",
    discipline: "Project Management & Deployment",
    title: "Estate-wide encryption rollout as sole vendor",
    body: "Selected as the single vendor to handle BitLocker encryption together with DCS and Webs Skydive installation across 30,000 end users countrywide, delivered inside the six-month window the project was awarded against.",
    metrics: [
      { value: "30,000", label: "Users reached" },
      { value: "6 months", label: "Delivery window" },
    ],
    image: "/media/case-oil-gas.jpg",
    imageAlt: "Aerial view of an oil refinery with storage spheres and flare stacks",
  },
  {
    sector: "Oil & Gas",
    discipline: "Project Management & Deployment",
    title: "Directory migration and OS upgrade for 2,000 end users",
    body: "Microsoft Active Directory migration and Microsoft Windows operating system upgrade across 2,000 end-user desktops and laptops for a second oil and gas customer.",
    metrics: [
      { value: "2,000", label: "End users migrated" },
      { value: "AD + OS", label: "Scope" },
    ],
    image: "/media/case-oil-gas.jpg",
    imageAlt: "Aerial view of an oil refinery with storage spheres and flare stacks",
  },
  {
    sector: "Government",
    discipline: "Project Management & Deployment",
    title: "Asset inventory and estate hardening",
    body: "Preventive maintenance services covering asset inventory management, antivirus upgrades, software patching and physical maintenance.",
    metrics: [
      { value: "Patching", label: "Estate hardening" },
      { value: "Inventory", label: "Asset management" },
    ],
    image: "/media/case-government.jpg",
    imageAlt: "Perdana Putra government complex at the head of the Putrajaya boulevard",
  },
];

/**
 * The other four headings on hpe.com.my's case study page.
 *
 * The site carried only "IT Management & Support" and "Project Management &
 * Deployment" and silently dropped these, which is most of what the page
 * actually says HPE has done.
 *
 * They are modelled separately because the source presents them differently:
 * short capability statements tagged with the client's sector, with no node
 * counts, response windows or engagement narrative. Forcing them into
 * `CaseStudy` would mean inventing metrics and images for twenty entries that
 * have neither, which is the opposite of matching the source.
 */
export type EngagementGroup = {
  name: string;
  items: { body: string; sectors: string[] }[];
};

export const engagementGroups: EngagementGroup[] = [
  {
    name: "Authorised Support Partner",
    items: [
      { body: "On-site support for leasing PCs for a government body.", sectors: ["Government"] },
      { body: "On-site warranty and out-of-warranty support nationwide.", sectors: ["Nationwide"] },
      {
        body: "Walk-in warranty and out-of-warranty support at nationwide service centres.",
        sectors: ["Nationwide"],
      },
    ],
  },
  {
    name: "IT Helpdesk Management",
    items: [
      {
        body: "Manpower to run a corporate client's in-house helpdesk.",
        sectors: ["Technology Provider", "Oil & Gas"],
      },
      { body: "Disaster recovery call centre.", sectors: ["Telco Provider"] },
    ],
  },
  {
    name: "IT Staffing Management",
    items: [
      {
        body: "Long-term IT staffing for corporate clients, supporting in-house operations.",
        sectors: ["Oil & Gas", "Logistics", "Conglomerate", "Technology Provider"],
      },
      { body: "Short-term IT staff for daily support needs.", sectors: ["Oil & Gas"] },
      {
        body: "Backfill resources for corporate clients needing emergency cover for staff on medical leave, or for short-term projects.",
        sectors: ["Oil & Gas"],
      },
      {
        body: "Project deployment staffing across nationwide rollouts.",
        sectors: ["Automotive", "Home Appliance"],
      },
      {
        body: "Resources fulfilled via ticketing, for customers needing minimum and ad-hoc support from time to time.",
        sectors: ["Retail", "Oil & Gas", "University", "Consumer Product Manufacturer"],
      },
      { body: "Payroll arrangements with a fixed mark-up on senior resources.", sectors: [] },
    ],
  },
  {
    name: "Total IT Solution / IT Sourcing",
    items: [
      {
        body: "IT sourcing, solutions, services, support and sales for digital transformation.",
        sectors: ["Healthcare"],
      },
      { body: "Desktop, laptop, server and network equipment provision.", sectors: [] },
      { body: "Load balancer, analyser, firewall and server provision.", sectors: [] },
      { body: "Warranty support for network equipment and servers.", sectors: [] },
      { body: "WiFi solutions for warehouses and factories.", sectors: ["Manufacturing"] },
      { body: "UPS supply.", sectors: ["Datacentre"] },
      { body: "Infrastructure and cabling services.", sectors: [] },
      { body: "Telco Metro-E supply.", sectors: ["Manufacturing"] },
      { body: "Short-term laptop and desktop leasing.", sectors: ["Logistics"] },
    ],
  },
];

/**
 * A service centre. Coordinates are town-centre positions, accurate enough to
 * place a marker on a national map and no more — they are not branch addresses.
 * Taken from the `HPE - refined` draft's Leaflet dataset.
 */
export type Centre = {
  name: string;
  lat: number;
  lng: number;
  /**
   * Position in the network map's 800x380 viewBox — the same space as
   * `NETMAP_DOTS`. Kept alongside lat/lng so both maps read one dataset.
   */
  nx: number;
  ny: number;
  /** Puchong doubles as head office; both maps give it a distinct marker. */
  hq?: boolean;
};

export type Region = { name: string; centres: Centre[] };

export const regions: Region[] = [
  {
    name: "Peninsular Malaysia",
    centres: [
      // Head office leads the directory; the rest of the list runs north to
      // south down the peninsula, then up the east coast.
      {
        name: "Puchong (KL)",
        lat: 3.108,
        lng: 101.618,
        nx: 88.3,
        ny: 270.8,
        hq: true,
      },
      { name: "Alor Setar", lat: 6.122, lng: 100.372, nx: 38.7, ny: 150.8 },
      { name: "Penang Island", lat: 5.415, lng: 100.338, nx: 37.3, ny: 179.0 },
      { name: "Ipoh", lat: 4.598, lng: 101.082, nx: 66.9, ny: 211.5 },
      { name: "Seremban", lat: 2.718, lng: 101.935, nx: 100.9, ny: 286.3 },
      { name: "Melaka", lat: 2.188, lng: 102.248, nx: 113.4, ny: 307.4 },
      { name: "Johor Bahru", lat: 1.492, lng: 103.758, nx: 173.5, ny: 335.1 },
      { name: "Kuantan", lat: 3.818, lng: 103.328, nx: 156.3, ny: 242.5 },
      {
        name: "Kuala Terengganu",
        lat: 5.332,
        lng: 103.142,
        nx: 148.9,
        ny: 182.3,
      },
      { name: "Kota Bharu", lat: 6.128, lng: 102.242, nx: 113.1, ny: 150.6 },
    ],
  },
  {
    name: "Sabah, Sarawak & Labuan",
    centres: [
      { name: "Kuching", lat: 1.548, lng: 110.328, nx: 434.9, ny: 332.9 },
      { name: "Sibu", lat: 2.298, lng: 111.818, nx: 494.2, ny: 303.0 },
      { name: "Bintulu", lat: 3.168, lng: 113.038, nx: 542.8, ny: 268.4 },
      { name: "Miri", lat: 4.398, lng: 113.998, nx: 581.0, ny: 219.5 },
      { name: "Labuan", lat: 5.318, lng: 115.238, nx: 630.4, ny: 182.8 },
      { name: "Kota Kinabalu", lat: 5.978, lng: 116.068, nx: 663.4, ny: 156.6 },
      { name: "Sandakan", lat: 5.838, lng: 118.068, nx: 743.0, ny: 162.1 },
      { name: "Tawau", lat: 4.248, lng: 117.888, nx: 735.8, ny: 225.4 },
    ],
  },
];

/** Flat list for the map, which does not care about the regional grouping. */
export const allCentres: Centre[] = regions.flatMap((r) => r.centres);

export const partners: string[] = [
  "AMP",
  "Aruba",
  "Avaya",
  "Cisco",
  "Cyberoam",
  "Dintek",
  "Fortinet",
  "HP Enterprise",
  "Huawei",
  "Microsoft",
  "Peplink",
  "Riverbed",
  "Ruckus",
  "Sangfor",
  "Sophos",
  "TM",
  "Veeam",
];

/**
 * Brand marks for the partner carousel. Each one was opened and looked at
 * before being committed — see the header of `scripts/fetch-logos.mjs` for the
 * wrong-subject hits that check caught.
 *
 * The first eleven are 400px renders from Wikimedia Commons. The last four came
 * from the `HPE - refined` draft's `assets/partner-logos/` and are small site
 * favicons (32–128px) — the only marks available for those brands. They are
 * noticeably softer than the rest; replacing them with the principal's own logo
 * pack is the upgrade path.
 *
 * `width`/`height` are intrinsic pixel dimensions so the browser reserves the
 * right box before the image lands.
 */
export type PartnerLogo = { src: string; width: number; height: number };

export const partnerLogos: Record<string, PartnerLogo> = {
  Aruba: { src: "/media/logos/aruba.png", width: 500, height: 244 },
  Avaya: { src: "/media/logos/avaya.png", width: 500, height: 143 },
  Cisco: { src: "/media/logos/cisco.png", width: 500, height: 264 },
  Fortinet: { src: "/media/logos/fortinet.png", width: 500, height: 61 },
  "HP Enterprise": {
    src: "/media/logos/hp-enterprise.png",
    width: 500,
    height: 209,
  },
  Huawei: { src: "/media/logos/huawei.png", width: 500, height: 86 },
  Microsoft: { src: "/media/logos/microsoft.png", width: 500, height: 500 },
  Riverbed: { src: "/media/logos/riverbed.png", width: 500, height: 145 },
  Sophos: { src: "/media/logos/sophos.png", width: 500, height: 90 },
  TM: { src: "/media/logos/tm.png", width: 500, height: 246 },
  Veeam: { src: "/media/logos/veeam.png", width: 500, height: 91 },

  // From the draft's assets — low-resolution favicons, flagged above.
  Peplink: { src: "/media/logos/peplink.png", width: 128, height: 128 },
  Dintek: { src: "/media/logos/dintek.png", width: 50, height: 51 },
  Ruckus: { src: "/media/logos/ruckus.png", width: 48, height: 48 },
  Sangfor: { src: "/media/logos/sangfor.png", width: 32, height: 32 },
};

/**
 * Partners with no usable mark at all fall back to a category icon, the same
 * way the draft falls back to a Font Awesome glyph when an image 404s.
 *
 * AMP: the draft's `amp.png` is a 16×16 TE Connectivity favicon — wrong brand
 * for the cabling line, and far too small regardless.
 * Cyberoam: the draft's `cyberoam.png` is byte-identical to `sophos.png`
 * (Sophos acquired them and the domain now serves the Sophos icon), so using it
 * would print the same logo in two bubbles.
 */
export const partnerFallbackIcons: Record<string, IconName> = {
  AMP: "Network",
  Cyberoam: "ShieldCheck",
};

export const principles = {
  vision:
    "To be the trusted IT management provider delivering the most reliable IT support and services, on the strength of a knowledgeable, experienced and full-fledged professional IT team.",
  mission:
    "To keep our technical knowledge current and our services aligned with the technology our clients are actually running.",
  commitment:
    "To deliver top-notch service against the committed Service Level Assurance.",
} as const;

/** The five pressures that push organisations toward a managed model. */
export const drivers = [
  {
    title: "Cost",
    body: "Skilled IT resource is expensive to hire and hold. Shared resource models spread that cost across the organisations using it.",
  },
  {
    title: "New age",
    body: "ICT moves faster than most internal teams can absorb, and the opportunity sits with whoever can adopt it first.",
  },
  {
    title: "Risk",
    body: "Internet-borne security threats do not respect office hours, and exposure grows with every unmanaged endpoint.",
  },
  {
    title: "Workload",
    body: "Business now expects an IT response measured in minutes, against a queue that was sized for days.",
  },
  {
    title: "Management responsibility",
    body: "Recruiting, training and retaining support staff is a management burden separate from running the technology itself.",
  },
];

export const navigation = [
  { label: "About Us", href: "/about-us" },
  { label: "Services", href: "/services" },
  { label: "Case Study", href: "/case-study" },
  { label: "Service Centre", href: "/service-centre" },
  { label: "Business Partner", href: "/business-partner" },
  { label: "Contact", href: "/contact" },
] as const;
