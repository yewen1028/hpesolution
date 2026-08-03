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
  features: { title: string; body: string }[];
  benefits: { title: string; body: string }[];
  /** Optional ordered checklist, used where the source scope is procedural. */
  scope?: { heading: string; items: string[] }[];
  /** Optional service-tier table. */
  tiers?: { name: string; coverage: string; response: string }[];
};

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
    featureHeading: "How the contract runs",
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
    tiers: [
      { name: "Elite", coverage: "24 × 7", response: "4-hour response" },
      { name: "Premium", coverage: "8 × 5", response: "4-hour response" },
      { name: "Standard", coverage: "8 × 5", response: "Next business day" },
      { name: "Remote", coverage: "8 × 5", response: "Scheduled or ad-hoc" },
    ],
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
      "We manage IT deployments from small office refreshes to nationwide rollouts, covering network devices, servers, storage, desktops, laptops, software, systems and applications — new installations, upgrades and migrations alike.",
    icon: "Boxes",
    image: "/media/svc-project-deployment.jpg",
    imageAlt: "Technician working at a rack in a server room",
    featureHeading: "What a deployment looks like",
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
        body: "A standby helpdesk that can take over call centre functionality during a disruption — the model proven through the pandemic.",
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
      "IT hardware support staffing on long-term or short-term contract, sourced against the skill set and years of experience the role actually requires — with backfill built in.",
    icon: "Users",
    image: "/media/svc-staffing.jpg",
    imageAlt: "A team gathered around a laptop in an office",
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
      "We are an appointed Authorised Support Partner for PC, server and network manufacturers, carrying parts on their behalf and fulfilling hardware and software warranty within the committed SLA — on-site, or as a walk-in claim at any of our 18 service centres.",
    icon: "ShieldCheck",
    image: "/media/svc-warranty.jpg",
    imageAlt: "A device stripped down to its individual components",
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
    imageAlt: "Warehouse racking stocked to floor-to-ceiling height",
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
  body: string;
  metrics: { value: string; label: string }[];
  image: string;
  imageAlt: string;
};

export const caseStudies: CaseStudy[] = [
  {
    sector: "Banking",
    discipline: "IT Management & Support",
    title: "Principal contract maintenance for a major Malaysian bank",
    body: "An 8 × 5 × 2-hour principal contract maintenance engagement covering roughly 25,000 nodes nationwide — servers, desktops, laptops, printers and network devices — across the bank's branch and office estate.",
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
    body: "24 × 7 × 4-hour maintenance for outlet servers, POS systems, network devices, 3G/4G modems and WiFi at 2,500 outlets nationwide, where an unattended till failure is lost trading rather than a ticket.",
    metrics: [
      { value: "2,500", label: "Outlets covered" },
      { value: "24×7×4h", label: "Response commitment" },
    ],
    image: "/media/case-retail.jpg",
    imageAlt: "Supermarket aisle with stocked produce displays",
  },
  {
    sector: "Telecommunications",
    discipline: "IT Management & Support",
    title: "Nationwide network equipment maintenance for enterprise clients",
    body: "24 × 7 four-hour maintenance on Cisco routers and switches, Peplink load balancers and Riverbed WAN optimisers for enterprise and retail end clients, including airports and educational institutions.",
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
    title: "Broadcast encoder and decoder support",
    body: "24 × 7 × 4-hour maintenance on video and voice encoder and decoder network equipment for one of Malaysia's media providers, where downtime is measurable on air.",
    metrics: [
      { value: "24×7×4h", label: "Response commitment" },
      { value: "Broadcast", label: "Equipment class" },
    ],
    image: "/media/case-media.jpg",
    imageAlt: "Television broadcast control room with monitor wall",
  },
  {
    sector: "Aviation & Hospitality",
    discipline: "IT Management & Support",
    title: "Wireless and broadband support for an airline provider",
    body: "24 × 7 × 4-hour maintenance across wireless and broadband, both dedicated and wireless links, for one of the country's airline providers.",
    metrics: [
      { value: "24×7×4h", label: "Response commitment" },
      { value: "Wireless + WAN", label: "Scope" },
    ],
    image: "/media/case-aviation.jpg",
    imageAlt: "Aircraft on stand at an airport at sunset",
  },
  {
    sector: "Banking",
    discipline: "Project Management & Deployment",
    title: "Annual IT asset inventory and OS migration",
    body: "Yearly IT asset inventory and audit covering more than 25,000 desktops and laptops across Malaysia and Thailand, carried out alongside Windows operating system migrations.",
    metrics: [
      { value: "25,000+", label: "Endpoints audited" },
      { value: "2", label: "Countries" },
    ],
    image: "/media/case-audit.jpg",
    imageAlt: "Review session around a boardroom table",
  },
  {
    sector: "Oil & Gas",
    discipline: "Project Management & Deployment",
    title: "Active Directory migration and estate-wide encryption",
    body: "Active Directory migration and Windows upgrades for 10,000 users, plus BitLocker encryption and specialised installations reaching 30,000 users — delivered inside a six-month window.",
    metrics: [
      { value: "30,000", label: "Users reached" },
      { value: "6 months", label: "Delivery window" },
    ],
    image: "/media/case-oil-gas.jpg",
    imageAlt: "Aerial view of a heavy industrial extraction site",
  },
  {
    sector: "Government",
    discipline: "Project Management & Deployment",
    title: "Asset inventory and estate hardening",
    body: "Asset inventory management, antivirus upgrades, software patching and physical asset maintenance services delivered to government agencies.",
    metrics: [
      { value: "Patching", label: "Estate hardening" },
      { value: "Inventory", label: "Asset management" },
    ],
    image: "/media/case-government.jpg",
    imageAlt: "Parliament building exterior with landscaped grounds",
  },
];

export type Region = { name: string; centres: string[] };

export const regions: Region[] = [
  {
    name: "Peninsular Malaysia",
    centres: [
      "Alor Setar",
      "Penang Island",
      "Ipoh",
      "Puchong (KL)",
      "Seremban",
      "Melaka",
      "Johor Bahru",
      "Kuantan",
      "Kuala Terengganu",
      "Kota Bharu",
    ],
  },
  {
    name: "Sabah, Sarawak & Labuan",
    centres: [
      "Kuching",
      "Sibu",
      "Bintulu",
      "Miri",
      "Labuan",
      "Kota Kinabalu",
      "Sandakan",
      "Tawau",
    ],
  },
];

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
