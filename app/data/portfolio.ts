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
      "Built for enterprise users including major hospitality and civic organizations.",
    ],
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
  },
  {
    id: "trails-end",
    index: "10",
    title: "Trails End: Show N’ Sell",
    eyebrow: "Field sales at enormous scale",
    summary:
      "A mobile experience for scouts and leaders to schedule sale events and take payments in the field.",
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
  },
  {
    id: "callsmart",
    index: "11",
    title: "CallSmart",
    eyebrow: "Mobile field-service POS",
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
