export type ProjectCategory =
  | "Enterprise"
  | "AI + Automation"
  | "Creative Tools"
  | "Mobile"
  | "Games"
  | "SaaS";

export type Project = {
  id: string;
  index: string;
  title: string;
  eyebrow: string;
  summary: string;
  role: string;
  year: string;
  stack: string[];
  signal: string;
  accent: "acid" | "amber" | "ice";
  category: ProjectCategory;
  status: string;
  highlights: string[];
  storyHtml?: string;
  sortOrder?: number;
  published?: boolean;
  featured?: boolean;
  version?: number;
  media?: ProjectMediaAsset[];
  dossier: {
    scope: string;
    ownership: string[];
    systems: string[];
    note?: string;
    source?: { label: string; url: string };
  };
};

export type ProjectMediaAsset = {
  id: string;
  kind: "video" | "image";
  url: string;
  storageKey?: string | null;
  posterUrl?: string | null;
  caption: string;
  altText: string;
  mimeType?: string | null;
  sortOrder?: number;
  autoplay: boolean;
  preload: "none" | "metadata" | "auto";
};

export type Experience = {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: string[];
  stack?: string;
};

// This is the single source of truth for the project universe and directory.
// Screenshots, video, URLs, and richer case studies can be added per record later.
export const projects: Project[] = [
  {
    id: "ignite-dialogue",
    index: "01",
    title: "Ignite Dialogue",
    eyebrow: "Enterprise conversation engine",
    summary:
      "A highly configurable decision-tree platform used by major financial institutions to guide customers toward the right products.",
    role: "Lead Backend Engineer",
    year: "2020—Now",
    stack: ["Node.js", "React", "AWS", "MongoDB"],
    signal: "DLG",
    accent: "acid",
    category: "Enterprise",
    status: "Production system",
    highlights: [
      "Designed self-service integrations with self-defining models and generated UI.",
      "Scaled infrastructure across AWS, Cloudflare, and multiple Mongo clusters.",
      "Built automated delivery with CloudFormation, Service Catalog, and CodePipeline.",
    ],
    dossier: {
      scope: "A modernization effort for a configurable guided-conversation product used in financial-services workflows.",
      ownership: ["Reworked the aging decision-tree foundation for cloud-scale operation.", "Built an integration layer where models describe themselves and drive generated configuration UI.", "Supported enterprise theming, customer customization, guide publishing, and a staged MongoDB data migration."],
      systems: ["Node.js services with a React application and legacy Scala", "AWS delivery and publishing workflows", "Cloudflare domains, observability, and separated MongoDB clusters"],
      note: "The current product page describes the broader platform; this record focuses on the architecture and delivery work listed in my résumé.",
      source: { label: "View current Ignite Dialogue context", url: "https://ignitesales.com/solutions/" },
    },
  },
  {
    id: "ignite-ai",
    index: "02",
    title: "Ignite AI",
    eyebrow: "Human-in-the-middle automation",
    summary:
      "A set of web and desktop tools that use language models, OCR, decision trees, and agents to accelerate client onboarding.",
    role: "Lead Backend Engineer",
    year: "Current",
    stack: ["OpenAI", "Node.js", "React", "Electron"],
    signal: "AIX",
    accent: "amber",
    category: "AI + Automation",
    status: "Production tools",
    highlights: [
      "Designed multi-step workflows that keep people in control of AI output.",
      "Combined LLMs, task agents, OCR, Puppeteer, and existing decision systems.",
    ],
    dossier: {
      scope: "A collection of operator-facing web and desktop tools for creating guides and collecting onboarding information with reviewable AI assistance.",
      ownership: ["Designed human-in-the-middle flows so people can inspect and guide generated output.", "Connected language models, document OCR, decision trees, and task agents into a multi-step onboarding process.", "Built across browser and Electron surfaces rather than treating AI as a standalone chat feature."],
      systems: ["Node.js and React", "OpenAI API, task agents, and OCR", "Electron and browser automation with Puppeteer"],
      note: "This page intentionally describes the workflow pattern rather than customer data, prompts, or internal onboarding operations.",
    },
  },
  {
    id: "tradelab",
    index: "03",
    title: "TradeLab",
    eyebrow: "Automated market strategy lab",
    summary:
      "A no-code trading automation platform for combining market-data pipes, webhooks, strategy rules, and AI-assisted configuration.",
    role: "Founder · Product Engineer",
    year: "2021—Now",
    stack: ["TypeScript", "Angular", "GCP", "Firebase"],
    signal: "TDL",
    accent: "ice",
    category: "AI + Automation",
    status: "Founder product",
    highlights: [
      "Created easy and advanced no-code strategy builders.",
      "Built synchronous worker pools for time-sensitive market events.",
      "Added an LLM conversation layer for authoring strategy rules.",
    ],
    dossier: {
      scope: "A founder-built strategy automation product that turns incoming market signals and webhooks into configurable rules and dashboards.",
      ownership: ["Designed separate easy and advanced rule-building modes for different levels of technical comfort.", "Implemented synchronous worker pools for time-sensitive event processing.", "Created an AI-assisted authoring experience and TradingView-connected workflow for building strategy rules."],
      systems: ["Angular 11, TypeScript, and Node.js", "Firebase Auth, Firestore, and Google Cloud CI/CD", "Webhooks, market-data pipes, worker pools, and custom dashboards"],
      note: "The product is software for configuring workflows; it is not financial advice or a promise of market performance.",
    },
  },
  {
    id: "stream-elixir",
    index: "04",
    title: "Stream Elixir",
    eyebrow: "Automation for live creators",
    summary:
      "A cross-platform desktop product that automated repetitive audience-growth workflows across Twitch and social platforms.",
    role: "Founder · Product Engineer",
    year: "2018—2021",
    stack: ["Electron", "Angular", "Express", "MongoDB"],
    signal: "STR",
    accent: "acid",
    category: "SaaS",
    status: "Shipped desktop app",
    highlights: [
      "Released for macOS, Windows, and Linux.",
      "Integrated Twitch, Facebook, Twitter, and YouTube APIs.",
    ],
    dossier: {
      scope: "A cross-platform desktop application for automating repetitive community and audience-management routines for live creators.",
      ownership: ["Took the product from a 2018 Electron release through multi-platform desktop delivery.", "Integrated platform APIs for Twitch, Facebook, Twitter, and YouTube workflows.", "Built the product around common creator routines rather than a single-channel dashboard."],
      systems: ["Electron desktop shell for macOS, Windows, and Linux", "Angular 9, Express, and MongoDB", "Third-party social and livestream platform APIs"],
    },
  },
  {
    id: "ezforms",
    index: "05",
    title: "EZFORMS",
    eyebrow: "Enterprise document platform",
    summary:
      "A complete digital document system spanning a web-based drag-and-drop builder, administration tools, mobile execution, reporting, and an SDK.",
    role: "Product Lead · Lead Engineer",
    year: "2013—2020",
    stack: ["Angular", "Node.js", "MongoDB", "Ionic"],
    signal: "EZF",
    accent: "amber",
    category: "Enterprise",
    status: "Production platform",
    highlights: [
      "Designed and iterated on the core drag-and-drop document builder.",
      "Delivered native and hybrid iOS and Android form applications.",
      "Used by FedEx, Taco Bueno, Dave & Buster’s, Yellow Tail Wines, Boy Scouts of America, and city municipalities, as listed in my résumé.",
    ],
    dossier: {
      scope: "A full document-execution platform spanning a web builder, admin tools, mobile apps, reporting, and an integration SDK.",
      ownership: ["Led design, implementation, testing, and scaling work across the front and back end.", "Designed and iterated on the drag-and-drop builder and the supporting administration portal.", "Shipped native and hybrid mobile execution experiences and helped shape data models for durable reporting."],
      systems: ["Angular 9, Node.js, MongoDB, and Ionic", "AndroidX and Jetpack alongside iOS delivery", "PDF rendering pipeline and developer SDK"],
      note: "Named organizations are those listed in my résumé; this archive does not expose their forms, data, or internal deployments.",
    },
  },
  {
    id: "eternus-tools",
    index: "06",
    title: "Eternus Engine Tools",
    eyebrow: "Live 3D game production suite",
    summary:
      "Eight connected tools for editing assets, particles, UI, atlases, terrain, and character animation against a live C++ game engine.",
    role: "Lead of Tool Development",
    year: "2015—2017",
    stack: ["Electron", "WebGL", "Angular", "C++"],
    signal: "ETN",
    accent: "ice",
    category: "Creative Tools",
    status: "Shipped internal suite",
    highlights: [
      "Led a three-person full-stack tools team.",
      "Designed caching to minimize expensive Electron remote-process calls.",
      "Rendered the C++ engine directly into a WebGL canvas at high frame rates.",
    ],
    dossier: {
      scope: "An eight-tool production suite for editing live game assets and data against an in-house C++ engine.",
      ownership: ["Led a three-person full-stack tools team while also shipping tools and prototypes directly.", "Developed a cache-conscious bridge between Electron processes and the live engine.", "Helped evolve the tooling UI from Angular 1 to Angular 5 and built custom WebGL graphing and TypeScript scripting directives."],
      systems: ["Electron, Angular, WebGL, and TypeScript", "Direct engine rendering in a WebGL canvas", "Asset, particle, UI, atlas, terrain, and animation/node-graph editors"],
      note: "This is a retrospective of internal production tooling; implementation details are intentionally summarized.",
    },
  },
  {
    id: "tumor-identifier",
    index: "07",
    title: "Tumor Identifier",
    eyebrow: "Medical imaging prototype",
    summary:
      "A Baylor Medical Center application that identified tumors across biopsy scans and reconstructed the result inside a 3D model.",
    role: "Creative Technologist",
    year: "R&D archive",
    stack: ["TensorFlow.js", "WebGL", "Node.js"],
    signal: "TMR",
    accent: "acid",
    category: "AI + Automation",
    status: "Research prototype",
    highlights: [
      "Matched 2D scan regions to a three-dimensional biopsy model.",
      "Generated an outlined 3D representation of detected tumor tissue.",
    ],
    dossier: {
      scope: "An R&D visualization prototype for aligning scan slices with a three-dimensional biopsy model and reconstructing a marked region in context.",
      ownership: ["Worked with 3D and 2D biopsy scan inputs as part of the prototype workflow.", "Mapped outlined regions across slices into a reconstructed 3D representation.", "Built an explorable browser visualization to communicate the scan-to-model process."],
      systems: ["WebGL, Node.js, and custom browser JavaScript", "TensorFlow.js listed in the original project stack", "Slice alignment, contours, and 3D reconstruction"],
      note: "The interactive demo on this site uses synthetic geometry only. It is a historical visualization prototype, not a diagnostic tool or clinical advice.",
    },
  },
  {
    id: "ziprad",
    index: "08",
    title: "ZipRad",
    eyebrow: "EHR-to-imaging automation",
    summary:
      "A medical workflow that transformed patient data from EHR systems into imaging-center orders for procedures such as X-rays and CAT scans.",
    role: "Lead Engineer",
    year: "Product archive",
    stack: ["Angular", "Node.js", "Kotlin", "OCR"],
    signal: "ZIP",
    accent: "amber",
    category: "Enterprise",
    status: "Production application",
    highlights: [
      "Used a custom OCR print driver and PDF generation pipeline.",
      "Included a privately distributed native Android application.",
    ],
    dossier: {
      scope: "A healthcare operations workflow for translating EHR-originated information into imaging-center orders without requiring a manual re-entry step.",
      ownership: ["Built the order-generation workflow around a custom OCR print driver and PDF generation.", "Worked across the Angular web application, Node/Mongo back end, and a privately distributed Kotlin Android app.", "Focused the product on bridging systems that did not share a direct connection."],
      systems: ["Angular 8, Node.js, and MongoDB", "Custom OCR print driver and PDF pipeline", "Native Kotlin Android client"],
      note: "The work is described at a systems level to avoid exposing health data, integrations, or operational details.",
      source: { label: "View ZipData’s current product context", url: "https://www.zipdatasolutions.com/" },
    },
  },
  {
    id: "traxo",
    index: "09",
    title: "Traxo",
    eyebrow: "Travel organizer",
    summary:
      "Native mobile applications that organized itineraries and reward programs, with an Android Wear companion for upcoming travel.",
    role: "Mobile Engineer",
    year: "Mobile archive",
    stack: ["Kotlin", "Java", "iOS", "Android Wear"],
    signal: "TRX",
    accent: "ice",
    category: "Mobile",
    status: "Shipped mobile apps",
    highlights: [
      "Delivered native Android and iOS applications.",
      "Migrated Android from the Support Library to AndroidX and Jetpack.",
    ],
    dossier: {
      scope: "Native mobile work for a travel product focused on keeping itineraries and reward information together, including a wearable companion.",
      ownership: ["Delivered native Android and iOS applications for travel organization.", "Built an Android Wear component for upcoming travel appointments.", "Modernized the Android implementation from the Support Library to AndroidX and Jetpack during a rewrite."],
      systems: ["Kotlin plus a proprietary Java SDK on Android", "Native iOS and Android delivery", "Android Wear, AndroidX, and Jetpack"],
      note: "Traxo has since evolved into a broader corporate-travel platform; this page documents the earlier mobile product work in the archive.",
      source: { label: "View current Traxo context", url: "https://www.traxo.com/" },
    },
  },
  {
    id: "trails-end",
    index: "10",
    title: "Trails End: Show N’ Sell",
    eyebrow: "Field sales at enormous scale",
    summary:
      "A popcorn fundraising app for Boy Scouts of America scouts and leaders to schedule sales events and take payments in the field.",
    role: "Mobile Product Engineer",
    year: "Mobile archive",
    stack: ["Ionic", "Kotlin", "Stripe", "Google Maps"],
    signal: "BSA",
    accent: "acid",
    category: "Mobile",
    status: "Shipped mobile apps",
    highlights: [
      "Released on Android and iOS.",
      "Used native Kotlin views for security-sensitive payment surfaces.",
      "Supported a large Square integration serving millions of users.",
    ],
    dossier: {
      scope: "A field-sales companion for popcorn fundraising events, allowing scouts and leaders to coordinate selling and accept card payments.",
      ownership: ["Shipped hybrid iOS and Android applications with Ionic 3.", "Integrated Stripe and Google Maps for sales and event workflows.", "Used native Kotlin views for security-sensitive payment surfaces and supported a large Square integration."],
      systems: ["Ionic 3 for iOS and Android", "Kotlin, MVVM, AndroidX, and Jetpack", "Stripe, Google Maps SDK, and Square integration"],
      note: "This is historical product work. Current Trails End features and branding may differ from the version represented here.",
    },
  },
  {
    id: "callsmart",
    index: "11",
    title: "CallSmart",
    eyebrow: "Callahan Roach · later became ProfitRhino",
    summary:
      "A cross-platform tool for repair professionals to manage customers and equipment, create orders, and accept payment on site.",
    role: "Mobile Engineer",
    year: "Mobile archive",
    stack: ["PhoneGap", "Cordova", "Kendo UI"],
    signal: "POS",
    accent: "amber",
    category: "Mobile",
    status: "Shipped mobile apps",
    highlights: [
      "Built Android and iOS applications around an MVVM architecture.",
      "Designed for plumbers, HVAC teams, and pool-service professionals.",
    ],
    dossier: {
      scope: "A mobile point-of-sale and field-service tool for repair teams managing customer details, equipment, orders, and payments on site.",
      ownership: ["Built Android and iOS experiences using a cross-platform PhoneGap/Cordova stack.", "Structured the app around Kendo UI and an MVVM architecture.", "Designed for practical field workflows across plumbing, HVAC, and pool-service teams."],
      systems: ["PhoneGap and Cordova", "Kendo UI with MVVM", "Cross-platform Android and iOS delivery"],
      note: "CallSmart later became ProfitRhino; this record documents the earlier mobile product rather than the current company product.",
    },
  },
  {
    id: "foodtronix-mobile-pos",
    index: "12",
    title: "FoodTronix Mobile POS",
    eyebrow: "Tableside restaurant ordering",
    summary:
      "An Android tablet ordering system that let restaurant staff take orders tableside and route them directly to kitchen printers.",
    role: "Lead Developer",
    year: "2011—2012",
    stack: ["Android", "MSSQL", "POS"],
    signal: "FDP",
    accent: "ice",
    category: "Mobile",
    status: "Production application",
    highlights: [
      "Integrated with an established restaurant-management suite.",
      "Worked across receipt printers, payment gateways, tax, and discount logic.",
    ],
    dossier: {
      scope: "The first mobile ordering experience in a restaurant-management environment, built for tablet-based tableside service.",
      ownership: ["Built an Android tablet workflow for taking orders at the table and routing them to kitchen printers.", "Integrated with a broader restaurant-management suite rather than creating a disconnected ordering app.", "Worked in the wider POS environment of ticket logic, payments, printers, taxes, and discounts."],
      systems: ["Native Android tablet client", "MSSQL-connected restaurant-management suite", "Kitchen and receipt printer, payment, tax, and discount integrations"],
      note: "The current FoodTronix offering has evolved; this project reflects the 2011–2012 mobile POS work.",
      source: { label: "View current FoodTronix context", url: "https://www.foodtronix.com/" },
    },
  },
  {
    id: "tug",
    index: "13",
    title: "TUG v1",
    eyebrow: "Smooth voxel sandbox",
    summary:
      "A 3D sandbox game created with the Nerd Kingdom team, backed by a TypeScript scripting system and a custom production toolchain.",
    role: "Tools Lead · Engineer",
    year: "2015—2017",
    stack: ["TypeScript", "C++", "Game Tools"],
    signal: "TUG",
    accent: "acid",
    category: "Games",
    status: "Shipped game project",
    highlights: [
      "Created and maintained parts of the TypeScript scripting system.",
      "Built the engine-tool suite used by the production team.",
    ],
    dossier: {
      scope: "A smooth-voxel sandbox game created with the Nerd Kingdom team, paired with the production tooling needed to build it.",
      ownership: ["Created and maintained portions of the TypeScript scripting system.", "Built the game-engine tools that supported the production team.", "Worked across a Windows game project and an in-house engine/toolchain."],
      systems: ["TypeScript scripting", "Custom C++ game engine and production tooling", "3D smooth-voxel sandbox gameplay"],
      note: "This archive records my tools and scripting contribution, not sole authorship of the game.",
    },
  },
  {
    id: "daho",
    index: "14",
    title: "DAHO",
    eyebrow: "Strategy puzzle game",
    summary:
      "A board-game-inspired number puzzle with challenge modes and custom-written AI, prototyped natively and rebuilt for production.",
    role: "Game Designer · Engineer",
    year: "Game archive",
    stack: ["Ionic", "Angular", "Android"],
    signal: "DAH",
    accent: "amber",
    category: "Games",
    status: "Shipped game",
    highlights: [
      "Built the original proof of concept in native Android.",
      "Rebuilt the production version with Ionic and Angular.",
    ],
    dossier: {
      scope: "A number-based strategy puzzle inspired by the territory and planning dynamics of Go, built first as a native proof of concept and then as a production game.",
      ownership: ["Prototyped the original game in native Android.", "Rebuilt the release version with Ionic 4 and Angular 7.", "Designed challenge modes and wrote the game’s custom AI behavior."],
      systems: ["Native Android proof of concept", "Ionic 4 and Angular 7 production build", "Custom game AI and challenge-mode logic"],
    },
  },
  {
    id: "jumpstart",
    index: "15",
    title: "JumpStart",
    eyebrow: "Photoshop-to-iPhone workflow",
    summary:
      "A Photoshop plugin that sliced UI layers and programmatically transformed them into the foundation of an iPhone application.",
    role: "Creative Developer",
    year: "Tool archive",
    stack: ["JavaScript", "Adobe Photoshop"],
    signal: "JMP",
    accent: "ice",
    category: "Creative Tools",
    status: "Shipped plugin",
    highlights: [
      "Automated repetitive design-to-development handoff work.",
      "Built in pure JavaScript using Adobe’s Photoshop framework.",
    ],
    dossier: {
      scope: "A Photoshop Cloud Edition plugin intended to reduce design-to-development repetition for early iPhone app workflows.",
      ownership: ["Automated slicing of UI layers within Photoshop.", "Programmatically transformed design output into the foundation of an iPhone application.", "Built the plugin in pure JavaScript against Adobe’s Photoshop framework."],
      systems: ["Adobe Photoshop Cloud Edition", "JavaScript and Adobe extension APIs", "Layer slicing and app-scaffolding automation"],
    },
  },
  {
    id: "hubster",
    index: "16",
    title: "Hubster",
    eyebrow: "Streaming availability guide",
    summary:
      "A web product for discovering where a film or series could be streamed across different media services.",
    role: "Product Engineer",
    year: "Web archive",
    stack: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    signal: "HUB",
    accent: "acid",
    category: "SaaS",
    status: "Shipped web product",
    highlights: [
      "Unified fragmented streaming availability into a single browse experience.",
    ],
    dossier: {
      scope: "An early web product for answering a simple discovery question: where can a specific title be streamed?",
      ownership: ["Designed a browse experience that brought fragmented streaming availability into one place.", "Built the product with the straightforward front-end stack of its era.", "Focused on reducing the hunt across multiple media services."],
      systems: ["HTML5, CSS3, and JavaScript", "Bootstrap responsive UI", "Streaming availability browsing"],
    },
  },
  {
    id: "dm-auto-leasing",
    index: "17",
    title: "D&M Auto Leasing",
    eyebrow: "Native leasing application",
    summary:
      "A native Android experience for a major auto-leasing business, released through the app store.",
    role: "Android Engineer",
    year: "Mobile archive",
    stack: ["Java", "Android Studio"],
    signal: "DMA",
    accent: "amber",
    category: "Mobile",
    status: "Shipped mobile app",
    highlights: ["Designed and delivered as a native Android application."],
    dossier: {
      scope: "A native Android application for a Texas auto-leasing company, released through the Android app store at the time.",
      ownership: ["Designed and delivered the mobile application as a native Android product.", "Worked in Java and Android Studio for the app-store release.", "Built for a leasing business with a customer-facing vehicle workflow."],
      systems: ["Java and Android Studio", "Native Android application delivery", "App-store release lifecycle"],
      note: "The original Android app is no longer listed on Google Play. D&M’s current leasing website is linked as present-day company context.",
      source: { label: "View current D&M Leasing context", url: "https://www.dmautoleasing.com/" },
    },
  },
];

export const experiences: Experience[] = [
  {
    company: "Ignite Sales",
    role: "Lead Backend Engineer",
    period: "2020—Present",
    summary:
      "Leading backend architecture for enterprise conversation and AI-assisted onboarding products used by financial institutions.",
    highlights: [
      "Modernized a large decision-tree platform for rapid AWS scaling.",
      "Designed enterprise customization, self-service publishing, and integration systems.",
      "Led a major MongoDB migration across multiple databases and clusters.",
    ],
    stack: "Node.js · React · AWS · MongoDB · Cloudflare",
  },
  {
    company: "Alchemist Technologies",
    role: "Founder",
    period: "2018—Present",
    summary:
      "Founded a SaaS studio focused on automation products, including Stream Elixir and TradeLab.",
    highlights: [
      "Shipped a cross-platform automation desktop app for live-stream creators.",
      "Built a configurable market-strategy and trading automation platform.",
    ],
    stack: "TypeScript · Angular · Electron · GCP · Firebase",
  },
  {
    company: "EZFORMS",
    role: "Lead of Product Development",
    period: "2015—2020",
    summary:
      "Led the evolution of an enterprise document platform across web, mobile, reporting, and SDK surfaces.",
    highlights: [
      "Created the core web-based drag-and-drop document builder.",
      "Delivered native and Ionic applications for iOS and Android.",
      "Designed durable data models for enterprise reporting and integrations.",
    ],
    stack: "Angular · Node.js · MongoDB · Ionic · Kotlin",
  },
  {
    company: "Nerd Kingdom",
    role: "Lead of Tool Development",
    period: "2015—2017",
    summary:
      "Led a three-person team building a connected suite of tools for a custom C++ game engine.",
    highlights: [
      "Built editors for assets, particles, UI, atlases, terrain, and animation.",
      "Connected Electron, WebGL, TypeScript, and the live engine with a performance-first architecture.",
    ],
    stack: "Electron · Angular · WebGL · C++ · TypeScript",
  },
  {
    company: "Lucent Mobile",
    role: "Lead of Custom Development",
    period: "2013—2015",
    summary:
      "Led mobile-focused custom development while building the first generation of the EZFORMS platform.",
    highlights: [
      "Coordinated multiple client products and technology stacks in parallel.",
      "Delivered enterprise web, Android, and iOS solutions on weekly cycles.",
    ],
  },
  {
    company: "FoodTronix",
    role: "IT Support → Lead Developer",
    period: "2011—2012",
    summary:
      "Moved from customer support into development for a restaurant-management and point-of-sale software suite.",
    highlights: [
      "Integrated MSSQL, QuickBooks, printers, and payment gateways.",
      "Built a support dashboard that increased customer-service productivity by 45%.",
    ],
  },
  {
    company: "Real World Web Design",
    role: "Founder",
    period: "2004—2013",
    summary:
      "Designed and built custom websites in the early era of user-generated content and open-source CMS platforms.",
    highlights: [
      "Delivered HTML, PHP, and MySQL websites for businesses and creative clients.",
      "Configured and extended WordPress, Joomla, phpBB, and other early platforms.",
    ],
  },
];

export const skillGroups = [
  {
    title: "Languages",
    items: [
      "TypeScript",
      "JavaScript",
      "Java",
      "Kotlin",
      "C# / .NET",
      "C++",
      "PHP",
      "SQL",
    ],
  },
  {
    title: "Platforms",
    items: [
      "AWS",
      "GCP",
      "Cloudflare",
      "Node.js",
      "MongoDB",
      "Firebase",
      "Android",
      "iOS",
    ],
  },
  {
    title: "Interfaces",
    items: [
      "React",
      "Angular",
      "Electron",
      "Ionic",
      "WebGL",
      "Unity",
      "Unreal",
      "Kendo UI",
    ],
  },
  {
    title: "Practice",
    items: [
      "Backend Architecture",
      "Product Engineering",
      "Developer Tools",
      "AI Automation",
      "Realtime Systems",
      "Technical Leadership",
    ],
  },
];

export const timeline = [
  {
    year: "2002",
    title: "First signal",
    copy: "Started building for the web before responsive design had a name.",
  },
  {
    year: "2011",
    title: "Software becomes the job",
    copy: "Moved from frontline support into product engineering and never stopped shipping.",
  },
  {
    year: "2015",
    title: "Product and tools leadership",
    copy: "Led enterprise product development and a custom game-engine tools team in parallel.",
  },
  {
    year: "2018",
    title: "Founder mode",
    copy: "Started Alchemist Technologies to turn automation ideas into products.",
  },
  {
    year: "NOW",
    title: "Still at the edge",
    copy: "Leading enterprise backend systems while exploring AI-native tools and expressive interfaces.",
  },
];
