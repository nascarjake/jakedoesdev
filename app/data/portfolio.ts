// Source-verified product narratives. See docs/portfolio-content-sources.md.
export const projectStories: Record<string, string> = {
  "rack-ruin": "<h2>Pool with more than one way to play</h2><p>Rack &amp; Ruin takes the precision of a billiards shot into four different formats: a roguelike run, Classic pool, authored challenges, and simultaneous Party play. Its web demo, desktop build, and mobile build share the game foundation, but do not expose identical features.</p><h3>Tables become the puzzle</h3><p>The challenge system supports walls, gates, rotating bars, linked portals, ball-specific pockets, and zones that change how a ball moves. A versioned table format separates the course definition from the physics runtime, allowing a new course to change the problem rather than just the background.</p><h3>Play together, or build a challenge</h3><p>Party Mode includes local players and AI opponents, with color-clearing and shared-rack rules. Unlike turn-based pool, each cue can shoot when its own ball slows down. The desktop Challenge Creator validates a course and requires its creator to complete it before publishing. Workshop integration is desktop-specific; the mobile build excludes the creator and Party interface.</p><p>This is an actively developed game. The screenshots and recorded walkthrough show existing builds; they are not a promise that every desktop or online feature is available in the browser demo.</p>",
  "luminary": "<h2>Make an AI workflow visible</h2><p>Luminary is a desktop workspace for assembling assistants, structured objects, functions, and their connections into a visual pipeline. It makes the pieces of an agent workflow inspectable instead of hiding them inside a long prompt.</p><h3>Reusable building blocks</h3><p>The object designer imports and exports JSON schemas, including nested structures. Assistant and function libraries let a workflow reuse its components. Profiles bundle the pipeline, graph layout, assistants, schemas, and functions into an exportable package.</p><h3>Beyond the canvas</h3><p>Custom functions can run through a command-line interface, receiving JSON input and reporting progress and output. A separate Node execution engine runs workflows outside the desktop editor. That separation keeps the visual authoring experience distinct from the runtime that performs the work.</p><p>The walkthrough documents the project at the time of recording. Model providers and API availability can change; the repository is the place to check current setup requirements.</p>",
  "straight-desk": "<h2>A phone agent that can finish the task</h2><p>Straight Desk uses live-audio AI models for customer conversations that lead to concrete actions. A roof-inspection flow, for example, collects the request, verifies the caller\u2019s details, schedules an appointment, and updates the CRM record.</p><h3>Conversation and workflow, deliberately separated</h3><p>Customizable agents follow a company playbook. Guardrails guide each step, while deterministic workflow orchestration keeps required actions predictable. The agent can reason and converse naturally without relying on free-form conversation alone to remember the process.</p><p>The product screenshots show the agent office, onboarding, call preview, and the relationship between a conversation and its actions. They illustrate the roof-inspection use case rather than presenting a generic chatbot demo.</p>",
  "clip-my-screen": "<h2>Save the moment after it happens</h2><p>Clip My Screen keeps a rolling local replay buffer so a shortcut can save the previous one, five, or fifteen minutes. A tray or menu-bar controller provides access without keeping a large recording window in the way.</p><h3>From replay to usable clip</h3><p>The local library supports search, names, tags, and favorites. Its visual editor trims, splits, and reorders clips, with frame stepping, keyboard shortcuts, and undo/redo. Edits are nondestructive, so selecting a better cut does not destroy the original capture.</p><h3>Control what leaves the machine</h3><p>Recording and the library are local. Sharing is a deliberate action using revocable links, with an optional tunnel when remote access is needed. Capture still requires operating-system permissions. The macOS implementation supports system and authorized microphone audio; the current Windows capture path is video-only.</p>",
  "stream-dj": "<h2>Run a station, not just a playlist</h2><p>Stream DJ brings the on-air desk, music library, clock, requests, and generation tools into one local-first workspace. A persistent player keeps the station accessible while the operator moves between views.</p><h3>Make room for the host</h3><p>The audio system analyzes a track\u2019s introduction to find a voice-safe window. DJ copy is fitted to that window, music ducks under the spoken segment, and its level returns before likely vocals. The aim is a transition that sounds intentional rather than a voice pasted over a song.</p><h3>Keep requests connected to the library</h3><p>Tracks retain metadata such as requester, prompt, title, category, tags, and play counts. Requests pass through a moderation queue. Music, text, and voice generation use configurable providers rather than one mandatory service. This remains an evolving station prototype, not a claim of unattended broadcast reliability.</p>",
  "markdown-podcast-narrator": "<h2>Turn written material into an editable episode</h2><p>Markdown Podcast Studio accepts Markdown, plain text, or pasted notes and turns them into a script with editable host turns. Each host can have a different voice; a single-narrator path is available when a conversational rewrite is not needed.</p><h3>Keep the script in the loop</h3><p>Writer integrations include local LM Studio and supported coding-agent command-line tools. Optional research can draw from selected codebase files, Wikipedia, and a bounded set of URLs, with source references and retrieval warnings. The user can review the script before rendering the episode.</p><h3>A local audio pipeline</h3><p>Kokoro provides local speech after its models are downloaded, and FFmpeg produces the MP3. CPU rendering completes before playback. Local voice rendering does not mean every optional writer is local: selecting a cloud-backed provider can send the selected source material to that provider.</p>",
  "jcal": "<h2>A household view of the day</h2><p>jcal brings calendar aggregation and household lists into a touch-friendly kiosk interface. Family colors make schedules easier to scan, while groceries, to-dos, and chores sit beside the calendar rather than in disconnected apps.</p><h3>From information to routine</h3><p>The project includes Google and Cozi calendar integration, natural-language assistance, weather, and an idle photo view. Its list system includes smart-list and meal-plan ingredient workflows. The goal is a useful shared surface in the home, not another personal productivity dashboard.</p><p>This is an in-development personal tool. Connected calendars and AI features require their own configuration and permissions.</p>",
  "music-writer": "<h2>A reproducible transcription experiment</h2><p>Music Writer explores how a recorded track can become editable musical structure. The documented study separates stems with HTDemucs, extracts note candidates with Basic Pitch, and compares timing, energy, and chroma to understand the arrangement.</p><h3>From analysis to a playable sketch</h3><p>For the study track, the analysis fits a 118 BPM sixteenth-note grid and produces MIDI, note tables, section analysis, and Strudel arrangements. Keeping those intermediate artifacts makes it possible to inspect where a transcription succeeds or loses musical detail.</p><p>This is a research workflow built around one study, not a released universal audio-to-score converter. The portfolio describes the process without distributing the source recording or extracted samples.</p>",
  "broadsheet": "<h2>Explore the news as a place</h2><p>Broadsheet experiments with an editorial canvas rather than a linear feed. Headlines, images, and article excerpts create a spatial overview. Open a story to unfold its full text, leave it open, and move to a neighboring story without losing the wider page.</p><h3>Enough material to test the idea</h3><p>The prototype contains a captured edition of 53 NASA stories with roughly 33,000 words and 95 image placements. Some articles include several images. This is a finite, attributed archive, not a live news service; the exploratory canvas reuses that archive as it extends.</p><h3>Fluid without a permanent render loop</h3><p>Selectable text remains in the document while composited transforms move the view. Viewport-based rendering and lazy images limit the work to nearby content. Search, an overview, enlarged photos, and persistent unfolded stories support both browsing and focused reading.</p>",
  "ignite-dialogue": "<h2>Build the platform that builds the guides</h2><p>I built a platform to shorten the process of creating guided customer experiences for banks and credit unions. The work connected product decisions with architecture, security, infrastructure, and cost tracking, rather than treating the editor as an isolated interface.</p><h3>Shorten the production cycle</h3><p>The platform reduced a six-month production cycle to two weeks. I then improved that foundation with AI-assisted website research and guide creation, reaching an example of two guides built in ten minutes from a bank\u2019s website. That is a concrete creation workflow, not a claim that every customer implementation takes ten minutes.</p><p>Configurable integrations and generated configuration interfaces help teams adapt guides without rebuilding the application for each institution. Publishing automation connects that authoring work to delivery.</p>"
};


export type ProjectCategory =
  | "Enterprise"
  | "AI + Automation"
  | "Creative Tools"
  | "Mobile"
  | "Games"
  | "SaaS";

export type ProjectMode = "portfolio" | "lab";

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
  mode?: ProjectMode;
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

// Product years below match the List of Production Products in Jake’s November 2026 résumé.
// They are product years, not employment start/end dates.
// This is the single source of truth for the project universe and directory.
// Screenshots, video, URLs, and richer case studies can be added per record later.
export const projects: Project[] = [
  {
    id: "ignite-dialogue",
    storyHtml: projectStories["ignite-dialogue"],
    index: "01",
    title: "Ignite Dialogue",
    eyebrow: "Enterprise conversation engine",
    summary:
      "A configurable guided-conversation platform for banks and credit unions, helping teams match customers with relevant financial products across digital and in-branch journeys.",
    role: "Lead Backend Engineer",
    year: "2023",
    stack: ["Node.js", "React", "AWS", "MongoDB"],
    signal: "DLG",
    accent: "acid",
    category: "Enterprise",
    status: "Production system",
    highlights: [
      "Built the guide-production platform and its supporting infrastructure for AWS scale.",
      "Built self-service integrations with self-defining models and generated configuration UI.",
      "Automated guide publishing and continuous delivery with AWS Service Catalog and CodePipeline.",
    ],
    dossier: {
      scope: "A platform I built to make configurable guided customer experiences faster to create and publish for financial institutions.",
      ownership: ["Built and improved the guided-conversation foundation for cloud-scale operation.", "Built an integration layer where models describe themselves and drive generated configuration UI.", "Supported enterprise theming, customer customization, one-click guide publishing, and a staged MongoDB migration from one database into multiple clusters."],
      systems: ["Node.js services with a React application and legacy Scala", "AWS CloudFormation, Service Catalog, Beanstalk, Lambda, Cognito, S3, SSM, SNS, and SQS", "Cloudflare domains, Datadog observability, and separated MongoDB clusters"],
      note: "The current product page describes the broader platform; this record focuses on the architecture and delivery work listed in my résumé.",
      source: { label: "View current Ignite Dialogue context", url: "https://ignitesales.com/solutions/" },
    },
  },
  {
    id: "ignite-ai",
    index: "02",
    title: "Ignite Spark AI",
    eyebrow: "Human-in-the-middle automation",
    summary:
      "Web and desktop tools for creating conversational guides and data-collection forms with reviewable AI assistance during client onboarding.",
    role: "Lead Backend Engineer",
    year: "2024",
    stack: ["OpenAI", "Node.js", "React", "Electron"],
    signal: "AIX",
    accent: "amber",
    category: "AI + Automation",
    status: "Production tools",
    highlights: [
      "Designed multi-step workflows that keep people in control of AI output.",
      "Combined language models, task agents, OCR, and existing decision-tree systems.",
      "Used Puppeteer and Electron where browser automation or a desktop surface made the workflow more practical.",
    ],
    dossier: {
      scope: "Operator-facing web and desktop tools for creating guides and collecting onboarding information with AI assistance that can be reviewed and directed by people.",
      ownership: ["Designed human-in-the-middle flows so people can inspect and guide generated output.", "Connected language models, document OCR, decision trees, and task agents into a multi-step onboarding process.", "Built browser and Electron workflows for guide authoring, form generation, and supporting automation."],
      systems: ["Node.js and React", "OpenAI API, GPT Assistants, task agents, and OCR", "Electron and browser automation with Puppeteer"],
      note: "This page intentionally describes the workflow pattern rather than customer data, prompts, or internal onboarding operations.",
    },
  },
  {
    id: "tradelab",
    index: "03",
    title: "TradeLab",
    eyebrow: "Automated market strategy lab",
    summary:
      "A no-code trading automation platform for turning market-data inputs and webhooks into configurable strategy rules, dashboards, and AI-assisted workflows.",
    role: "Founder · Product Engineer",
    year: "2021",
    stack: ["TypeScript", "Angular", "GCP", "Firebase"],
    signal: "TDL",
    accent: "ice",
    category: "AI + Automation",
    status: "Founder product",
    highlights: [
      "Created easy and advanced no-code strategy builders.",
      "Built synchronous worker pools for time-sensitive market events and multiple data pipes.",
      "Added an LLM conversation layer for authoring and refining strategy rules.",
    ],
    dossier: {
      scope: "A founder-built strategy automation product that turns market-data pipes and incoming webhooks into configurable rules and dashboards.",
      ownership: ["Designed separate easy and advanced rule-building modes for different levels of technical comfort.", "Implemented synchronous worker pools for time-sensitive event processing.", "Created an AI-assisted authoring experience and TradingView-connected workflow for building strategy rules."],
      systems: ["Angular 11, TypeScript, and Node.js", "Firebase Auth, Firestore, and Google Cloud CI/CD", "Webhooks, market-data pipes, worker pools, custom dashboards, and TradingView integration"],
      note: "The product is software for configuring workflows; it is not financial advice or a promise of market performance.",
    },
  },
  {
    id: "stream-elixir",
    index: "04",
    title: "Stream Elixir",
    eyebrow: "Automation for live creators",
    summary:
      "A cross-platform desktop product that automated recurring creator workflows across Twitch, Facebook, Twitter, and YouTube.",
    role: "Founder · Product Engineer",
    year: "2018",
    stack: ["Electron", "Angular", "Express", "MongoDB"],
    signal: "STR",
    accent: "acid",
    category: "SaaS",
    status: "Shipped desktop app",
    highlights: [
      "Released as an Electron app for macOS, Windows 7+, and Linux.",
      "Integrated Twitch, Facebook, Twitter, and YouTube APIs.",
      "Focused on automating routine behaviors associated with running and growing a livestreaming audience.",
    ],
    dossier: {
      scope: "A cross-platform desktop application for automating repetitive community and audience-management routines for live creators.",
      ownership: ["Founded and shipped the product as a 2018 Electron release across three desktop platforms.", "Integrated platform APIs for Twitch, Facebook, Twitter, and YouTube workflows.", "Built the product around common creator routines rather than a single-channel dashboard."],
      systems: ["Electron desktop shell for macOS, Windows 7+, and Linux", "Angular 9, Express, and MongoDB", "Third-party social and livestream platform APIs"],
    },
  },
  {
    id: "ezforms",
    index: "05",
    title: "EZFORMS",
    eyebrow: "Enterprise document platform",
    summary:
      "An enterprise digital-document platform with a drag-and-drop builder, admin portal, mobile execution, reporting, PDF output, and an integration SDK.",
    role: "Product Lead · Lead Engineer",
    year: "2015",
    stack: ["Angular", "Node.js", "MongoDB", "Ionic"],
    signal: "EZF",
    accent: "amber",
    category: "Enterprise",
    status: "Production platform",
    highlights: [
      "Designed and iterated on the core drag-and-drop document builder.",
      "Delivered native and hybrid iOS and Android form applications.",
      "Built a PhantomJS-based webpage-to-PDF workflow and an SDK for external developers.",
      "Used by FedEx, Taco Bueno, Dave & Buster’s, Yellow Tail Wines, Boy Scouts of America, and city municipalities, as listed in my résumé.",
    ],
    dossier: {
      scope: "A full document-execution platform spanning a web builder, administration portal, mobile apps, reporting, PDF output, and an integration SDK.",
      ownership: ["Led design, implementation, testing, and scaling work across the front and back end.", "Designed and iterated on the drag-and-drop builder and the supporting administration portal.", "Shipped native and hybrid mobile execution experiences, helped shape data models for reporting, and developed the document-to-PDF workflow."],
      systems: ["Angular 9, Node.js, MongoDB, and Ionic", "Native Android and iOS delivery plus AndroidX and Jetpack", "PhantomJS webpage-to-PDF rendering and a developer SDK"],
      note: "Named organizations are those listed in my résumé; this archive does not expose their forms, data, or internal deployments.",
    },
  },
  {
    id: "eternus-tools",
    index: "06",
    title: "Eternus Engine Tools",
    eyebrow: "Live 3D game production suite",
    summary:
      "An eight-tool suite for live editing of game assets, particles, UI, atlases, terrain, and character animation against an in-house C++ engine.",
    role: "Lead of Tool Development",
    year: "2016",
    stack: ["Electron", "WebGL", "Angular", "C++"],
    signal: "ETN",
    accent: "ice",
    category: "Creative Tools",
    status: "Shipped internal suite",
    highlights: [
      "Led a three-person full-stack tools team.",
      "Designed caching to minimize expensive Electron remote-process calls.",
      "Rendered the C++ engine directly into a WebGL canvas with a low-latency tool interface.",
    ],
    dossier: {
      scope: "An eight-tool production suite for editing live game assets and data against an in-house C++ engine.",
      ownership: ["Led a three-person full-stack tools team while also shipping tools and prototypes directly.", "Developed a cache-conscious bridge between Electron processes and the live engine to reduce expensive cross-process calls.", "Helped evolve the tooling UI from Angular 1 to Angular 5 and built custom WebGL graphing and TypeScript scripting directives."],
      systems: ["Electron, Angular, WebGL, and TypeScript", "Low-latency C++ engine rendering in a WebGL canvas", "Asset manager, particle, UI, atlas, terrain, character-animation, and node-graph tools"],
      note: "This is a retrospective of internal production tooling; implementation details are intentionally summarized.",
    },
  },
  {
    id: "tumor-identifier",
    index: "07",
    title: "Tumor Identifier",
    eyebrow: "Baylor Medical Center · College internship",
    summary:
      "Built during my college internship and used at Baylor Medical Center in 2011. It used AI-assisted medical image segmentation to outline tumor regions, then correlated 2D biopsy scans with a 3D biopsy model to reconstruct the outlined tissue in context.",
    role: "College intern · Medical imaging development",
    year: "2011",
    stack: ["WebGL", "Node.js", "JavaScript"],
    signal: "TMR",
    accent: "acid",
    category: "AI + Automation",
    status: "Production application",
    storyHtml: "<p>I built Tumor Identifier during my college internship. It was used at Baylor Medical Center in 2011, and remains one of the projects I am proudest of: applying software to work that matters to patients.</p><p>The image-processing workflow used AI-assisted segmentation to delineate tumor boundaries in the scans, then mapped the outlined regions into a 3D representation.</p>",
    highlights: [
      "Used AI-assisted medical image segmentation to outline tumor regions in biopsy scans.",
      "Aligned marked regions from 2D scans with a three-dimensional biopsy model.",
      "Generated an outlined 3D representation of identified tumor tissue.",
      "Used WebGL and browser tooling to make the scan-to-model relationship explorable.",
    ],
    dossier: {
      scope: "A production medical imaging application for aligning 2D biopsy scans with a three-dimensional biopsy model and reconstructing marked regions in context.",
      ownership: ["Worked with 3D and 2D biopsy scan inputs in the application workflow.", "Mapped outlined regions across scan slices into a reconstructed 3D representation.", "Built an explorable browser visualization to communicate the scan-to-model process."],
      systems: ["WebGL, Node.js, and custom browser JavaScript", "AI-assisted medical image segmentation and tumor-boundary delineation", "2D/3D scan alignment, contours, and reconstruction"],
      note: "The interactive demo on this site uses synthetic geometry only. It is separate from the production application and is not a diagnostic tool or clinical advice.",
    },
  },
  {
    id: "ziprad",
    index: "08",
    title: "ZipRad",
    eyebrow: "EHR-to-imaging automation",
    summary:
      "A healthcare workflow that moved EHR data into imaging-center orders for X-rays and CAT scans, reducing manual re-entry between disconnected systems.",
    role: "Lead Engineer",
    year: "2014",
    stack: ["Angular", "Node.js", "Kotlin", "OCR"],
    signal: "ZIP",
    accent: "amber",
    category: "Enterprise",
    status: "Production application",
    highlights: [
      "Built around a custom OCR print driver and PDF-generation pipeline.",
      "Spanned an Angular web app, Node/Mongo services, and a privately distributed Kotlin Android app.",
      "Supported a web portal and API-style handoff between systems that lacked a direct integration.",
    ],
    dossier: {
      scope: "A healthcare operations workflow for translating EHR-originated information into imaging-center orders without a manual re-entry step.",
      ownership: ["Built the order-generation workflow around a custom OCR print driver and PDF generation.", "Worked across the Angular web application, Node/Mongo back end, and a privately distributed Kotlin Android app.", "Focused the product on bridging systems that did not share a direct connection, using portal and API-based handoffs where appropriate."],
      systems: ["Angular 8, Node.js, and MongoDB", "Custom OCR print driver, PDF pipeline, web portal, and APIs", "Native Kotlin Android client"],
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
      "Native iOS and Android travel-organizer apps for itineraries and reward programs, with an Android Wear companion for upcoming appointments.",
    role: "Mobile Engineer",
    year: "2013",
    stack: ["Kotlin", "Java", "iOS", "Android Wear"],
    signal: "TRX",
    accent: "ice",
    category: "Mobile",
    status: "Shipped mobile apps",
    highlights: [
      "Delivered native Android and iOS applications released through their respective stores.",
      "Built an Android Wear companion for upcoming travel appointments.",
      "Migrated Android from the Support Library to AndroidX and Jetpack during a rewrite.",
    ],
    dossier: {
      scope: "Native mobile work for a travel product focused on keeping itineraries and reward information together, including a wearable companion.",
      ownership: ["Delivered native Android and iOS applications for travel organization and loyalty information.", "Built an Android Wear component for upcoming travel appointments.", "Modernized the Android implementation from the Support Library to AndroidX and Jetpack during a rewrite."],
      systems: ["Kotlin plus a proprietary Java SDK on Android", "Native Android and iOS app-store delivery", "Android Wear, AndroidX, and Jetpack"],
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
      "A hybrid mobile app for Boy Scouts of America popcorn fundraisers to schedule sales events and take card payments in the field.",
    role: "Mobile Product Engineer",
    year: "2017",
    stack: ["Ionic", "Kotlin", "Stripe", "Google Maps"],
    signal: "BSA",
    accent: "acid",
    category: "Mobile",
    status: "Shipped mobile apps",
    highlights: [
      "Released on Android and iOS with Ionic 3.",
      "Used native Kotlin views for security-sensitive payment surfaces.",
      "Integrated Stripe, Google Maps, and a Square integration serving millions of users.",
    ],
    dossier: {
      scope: "A field-sales companion for popcorn fundraising events, allowing scouts and leaders to coordinate selling and accept card payments.",
      ownership: ["Shipped hybrid iOS and Android applications with Ionic 3.", "Integrated Stripe and Google Maps for sales and event workflows.", "Used native Kotlin views for security-sensitive payment surfaces and supported a Square integration serving millions of users."],
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
      "A cross-platform field-service POS for repair professionals to manage customers and equipment, create orders, and take payment on site.",
    role: "Mobile Engineer",
    year: "2014",
    stack: ["PhoneGap", "Cordova", "Kendo UI"],
    signal: "POS",
    accent: "amber",
    category: "Mobile",
    status: "Shipped mobile apps",
    highlights: [
      "Built Android and iOS applications with PhoneGap, Cordova, Kendo UI, and MVVM.",
      "Designed for plumbing, HVAC, and pool-service teams working away from the office.",
    ],
    dossier: {
      scope: "A mobile point-of-sale and field-service tool for repair teams managing customer details, equipment, orders, and payments on site.",
      ownership: ["Built Android and iOS experiences using a cross-platform PhoneGap/Cordova stack.", "Structured the app around Kendo UI and an MVVM architecture.", "Designed for practical customer, equipment, order, and payment workflows across plumbing, HVAC, and pool-service teams."],
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
      "An Android tablet ordering system that let restaurant staff take orders tableside and route them directly to kitchen printers within the existing POS suite.",
    role: "Lead Developer",
    year: "2012",
    stack: ["Android", "MSSQL", "POS"],
    signal: "FDP",
    accent: "ice",
    category: "Mobile",
    status: "Production application",
    highlights: [
      "Built native Android tablet ordering for tableside service and kitchen fulfillment.",
      "Integrated with an established restaurant-management suite rather than a standalone ordering app.",
      "Worked across MSSQL, receipt printers, payment gateways, and ticket tax and discount logic.",
    ],
    dossier: {
      scope: "A tablet-based tableside ordering experience integrated with a restaurant-management suite and its kitchen workflow.",
      ownership: ["Built an Android tablet workflow for taking orders at the table and routing them to kitchen printers.", "Integrated with a broader restaurant-management suite rather than creating a disconnected ordering app.", "Worked in the wider POS environment of MSSQL data, ticket logic, payments, printers, taxes, and discounts."],
      systems: ["Native Android tablet client", "MSSQL-connected restaurant-management suite", "Kitchen and receipt printers, payment gateways, tax, and discount integrations"],
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
      "A Windows smooth-voxel sandbox game created with the Nerd Kingdom team, backed by TypeScript scripting and a custom production toolchain.",
    role: "Tools Lead · Engineer",
    year: "2015",
    stack: ["TypeScript", "C++", "Game Tools"],
    signal: "TUG",
    accent: "acid",
    category: "Games",
    status: "Shipped game project",
    highlights: [
      "Created and maintained parts of the TypeScript scripting system.",
      "Built production tools for the team’s in-house game engine.",
      "Worked across the Windows game release and its in-house C++ engine/toolchain.",
    ],
    dossier: {
      scope: "A Windows smooth-voxel sandbox created with the Nerd Kingdom team, paired with the production tooling needed to build it.",
      ownership: ["Created and maintained portions of the TypeScript scripting system.", "Built the game-engine tools that supported the production team.", "Worked across a Windows game project and an in-house C++ engine/toolchain."],
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
      "A Go-inspired number strategy puzzle with challenge modes and custom-written AI, prototyped natively and rebuilt for production.",
    role: "Game Designer · Engineer",
    year: "2014",
    stack: ["Ionic", "Angular", "Android"],
    signal: "DAH",
    accent: "amber",
    category: "Games",
    status: "Shipped game",
    highlights: [
      "Built the original proof of concept in native Android.",
      "Rebuilt the production version with Ionic and Angular.",
      "Designed challenge modes and wrote the game’s custom AI behavior.",
    ],
    dossier: {
      scope: "A number-based strategy puzzle inspired by Go, built first as a native proof of concept and then as a production game.",
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
      "A Photoshop Cloud Edition plugin that sliced UI layers and programmatically turned them into the foundation of an iPhone application.",
    role: "Creative Developer",
    year: "2013",
    stack: ["JavaScript", "Adobe Photoshop"],
    signal: "JMP",
    accent: "ice",
    category: "Creative Tools",
    status: "Shipped plugin",
    highlights: [
      "Automated repetitive design-to-development handoff work through layer slicing.",
      "Generated the starting structure of an iPhone application from design output.",
      "Built in pure JavaScript using Adobe’s Photoshop framework.",
    ],
    dossier: {
      scope: "A Photoshop Cloud Edition plugin intended to reduce design-to-development repetition for early iPhone app workflows.",
      ownership: ["Automated slicing of UI layers within Photoshop.", "Programmatically transformed design output into the foundation of an iPhone application.", "Built the plugin in pure JavaScript against Adobe’s Photoshop framework."],
      systems: ["Adobe Photoshop Cloud Edition", "JavaScript and Adobe extension APIs", "Layer slicing and iPhone app-scaffolding automation"],
    },
  },
  {
    id: "hubster",
    index: "16",
    title: "Hubster",
    eyebrow: "Streaming availability guide",
    summary:
      "A web product for discovering where a film or series could be streamed across fragmented media services.",
    role: "Product Engineer",
    year: "2013",
    stack: ["HTML5", "CSS3", "JavaScript", "Bootstrap"],
    signal: "HUB",
    accent: "acid",
    category: "SaaS",
    status: "Shipped web product",
    highlights: [
      "Unified fragmented streaming availability into a single browse experience.",
      "Built the responsive product with HTML5, CSS3, JavaScript, and Bootstrap.",
    ],
    dossier: {
      scope: "An early web product for answering a simple discovery question: where can a specific title be streamed?",
      ownership: ["Designed a browse experience that brought fragmented streaming availability into one place.", "Built the product with HTML5, CSS3, JavaScript, and Bootstrap.", "Focused on reducing the hunt across multiple media services."],
      systems: ["HTML5, CSS3, and JavaScript", "Bootstrap responsive UI", "Streaming availability browsing"],
    },
  },
  {
    id: "dm-auto-leasing",
    index: "17",
    title: "D&M Auto Leasing",
    eyebrow: "Native leasing application",
    summary:
      "A native Android application for a Texas auto-leasing business, built in Java and released through the app store.",
    role: "Android Engineer",
    year: "2013",
    stack: ["Java", "Android Studio"],
    signal: "DMA",
    accent: "amber",
    category: "Mobile",
    status: "Shipped mobile app",
    highlights: [
      "Designed and delivered as a native Android application.",
      "Built with Java and Android Studio for an app-store release.",
      "Supported a customer-facing vehicle-leasing workflow.",
    ],
    dossier: {
      scope: "A native Android application for a Texas auto-leasing company, released through the Android app store at the time.",
      ownership: ["Designed and delivered the mobile application as a native Android product.", "Worked in Java and Android Studio for the app-store release.", "Built for a customer-facing vehicle-leasing workflow."],
      systems: ["Java and Android Studio", "Native Android application delivery", "App-store release lifecycle"],
      note: "The original Android app is no longer listed on Google Play. D&M’s current leasing website is linked as present-day company context.",
      source: { label: "View current D&M Leasing context", url: "https://www.dmautoleasing.com/" },
    },
  },
  {
    id: "rack-ruin",
    storyHtml: projectStories["rack-ruin"],
    index: "18",
    title: "Rack & Ruin",
    eyebrow: "Cross-platform billiards game",
    summary:
      "A billiards game for Android, iOS, and Steam with four modes, including turn-based and realtime multiplayer, plus Steam-powered online play and Workshop mods.",
    role: "Game Developer",
    year: "2026",
    stack: ["WebGL", "React", "Electron", "Vite", "Steam SDK"],
    signal: "RNR",
    accent: "ice",
    category: "Games",
    status: "Production game",
    highlights: [
      "Built for Android, iOS, and Steam.",
      "Includes four game modes, with turn-based and realtime multiplayer.",
      "Integrated the Steam SDK for online play and Workshop mods.",
    ],
    dossier: {
      scope: "A cross-platform billiards game for Android, iOS, and Steam, combining four distinct modes with both turn-based and realtime multiplayer play.",
      ownership: ["Built the game with WebGL, React, Electron, and Vite.", "Implemented four game modes, including turn-based and realtime multiplayer.", "Integrated the Steam SDK for online play and Workshop mod support."],
      systems: ["WebGL and React game interface", "Electron and Vite application tooling", "Steam SDK online-play and Workshop integration"],
      note: "This record reflects the 2026 production game described in my résumé.",
    },
  },
  {
    id: "luminary",
    storyHtml: projectStories["luminary"],
    index: "19",
    title: "Luminary",
    eyebrow: "Open-source AI workflow builder",
    summary:
      "An open-source workflow builder for chaining multiple LLM agents, backed by a reusable AI Flow engine library that runs Luminary projects in other apps.",
    role: "Open-source Creator",
    year: "2025",
    stack: ["Electron", "Angular", "LLM Studio", "AI Flow Engine"],
    signal: "LUM",
    accent: "amber",
    category: "AI + Automation",
    status: "Open-source product",
    highlights: [
      "Built a workflow builder for chaining multiple LLM agents.",
      "Released as an open-source project, listed in the résumé with 50+ stars.",
      "Created an AI Flow engine library for running Luminary projects in other apps.",
    ],
    dossier: {
      source: { label: "Explore Luminary", url: "/luminary/" },
      scope: "An open-source AI workflow builder for composing multiple LLM agents and carrying those workflows into other applications through a reusable engine library.",
      ownership: ["Created a workflow builder for chaining multiple LLM agents.", "Built the desktop interface with Electron and Angular.", "Developed an AI Flow engine library so Luminary projects can run in other apps."],
      systems: ["Electron desktop application", "Angular interface", "LLM Studio and reusable AI Flow engine library"],
      note: "The résumé describes Luminary as an open-source project with 50+ stars; this archive does not present that as a live star count.",
    },
  },
  {
    id: "straight-desk",
    storyHtml: projectStories["straight-desk"],
    index: "20",
    title: "Straight Desk",
    eyebrow: "24/7 voice operations assistant",
    summary:
      "A live-audio LLM phone assistant for 24/7 inbound and outbound support, scheduling, CRM, and knowledge-base workflows.",
    role: "Co-Founder",
    year: "2026",
    stack: ["Live audio LLMs", "Cloudflare", "DigitalOcean"],
    signal: "SDS",
    accent: "acid",
    category: "AI + Automation",
    status: "Production product",
    highlights: [
      "Supports more than 30 tool calls for schedules, CRM, knowledge bases, and related workflows.",
      "Handles inbound calls and outbound follow-up calls.",
      "Includes a 90-second AI builder and training mode that suggests training changes.",
    ],
    dossier: {
      scope: "A production voice-assistant product built around live audio LLM models for round-the-clock phone support and operational work such as scheduling, CRM, and knowledge-base tasks. The résumé describes support in over 90 languages.",
      ownership: ["Co-founded the product through OJ Digital.", "Built a phone workflow that handles inbound calls and can make outbound follow-up calls.", "Developed the AI builder and training mode for customer setup and suggested training changes."],
      systems: ["Live audio LLM phone assistant", "30+ tool-call surface for schedules, CRM, and knowledge bases", "Cloudflare and DigitalOcean infrastructure"],
      note: "Details here follow the 2026 product description in my résumé; availability and capabilities can evolve.",
    },
  },
  {
    id: "clip-my-screen",
    storyHtml: projectStories["clip-my-screen"],
    index: "21",
    sortOrder: 22,
    title: "Clip My Screen",
    eyebrow: "Screen replay · Mac + Windows",
    summary: "Catch a bug, a great play, or a useful explanation after it happens. A free Mac and Windows replay tool with local clips, quick shortcuts, and a searchable library.",
    role: "Creator · Product Engineer",
    year: "2026",
    stack: ["Electron", "Node.js", "Swift", "FFmpeg"],
    signal: "CMS",
    accent: "amber",
    category: "Creative Tools",
    status: "Open-source · Early release",
    mode: "lab",
    highlights: ["Save the last 1, 5, or 15 minutes with a global shortcut.", "Trim on a visual thumbnail timeline, split and arrange sequences, and keep a searchable local library.", "Download for Mac or Windows, choose your capture setup, and start clipping automatically."],
    dossier: {
      scope: "What if saving a screen moment did not require predicting it first, a subscription, or a cloud account?",
      ownership: ["Designed the desktop capture experience, local clip library, and explicit pause/resume controls.", "Built native Mac capture and cross-platform replay, export, and sharing workflows.", "Published open-source Mac and Windows builds with setup guides, screenshots, and automated checks."],
      systems: ["Electron and Node.js local service", "ScreenCaptureKit on macOS and FFmpeg capture on Windows", "GitHub Actions builds, packaged smoke tests, and checksummed releases"],
      note: "Screenshots show the real interface with illustrative demo media, not personal recordings. Early builds are ad-hoc signed on Mac and unsigned on Windows. Active-capture performance and audio sync still need real-device validation.",
      source: { label: "Download for Mac or Windows", url: "https://jakedoesdev.com/clip-my-screen/" },
    },
  },
  {
    id: "stream-dj",
    storyHtml: projectStories["stream-dj"],
    index: "22",
    sortOrder: 20,
    title: "Stream DJ",
    eyebrow: "AI broadcast studio",
    summary: "A local-first desktop studio exploring audience requests, AI DJ voice, show programming, and audio playback for livestreams and radio-style shows.",
    role: "Creator · Engineer",
    year: "Current",
    stack: ["Electron", "React", "TypeScript", "Vite"],
    signal: "SDJ",
    accent: "ice",
    category: "AI + Automation",
    mode: "lab",
    status: "Desktop release · Mac + Windows",
    highlights: [
      "Plan reusable show blocks and review audience music requests.",
      "Play local tracks with an on-air desk and optional AI DJ voice links.",
      "Download a standalone Electron app for Apple Silicon, Intel Mac, or Windows.",
    ],
    dossier: {
      scope: "What would a local-first, AI-assisted broadcast desk look like for an independent streamer?",
      ownership: ["Built an Electron station workspace with on-air controls and a persistent player.", "Explored DJ voice announcements, requests, and reusable programming blocks.", "Separated music, text, and voice providers so the studio can evolve without one provider dependency."],
      systems: ["Electron desktop shell", "React and TypeScript interface", "Local backend and station data"],
      note: "Early desktop release. AI providers and streaming integrations require separate setup. Builds are unsigned and unnotarized; live broadcasting and audio routing need validation in your setup.",
      source: { label: "Downloads & setup", url: "https://jakedoesdev.com/stream-dj/" },
    },
  },
  {
    id: "jcal",
    storyHtml: projectStories["jcal"],
    index: "23",
    sortOrder: 21,
    title: "jcal",
    eyebrow: "Home calendar assistant",
    summary: "A touch-first home calendar workspace exploring shared family schedules, lists, weather, and natural-language commands.",
    role: "Creator · Engineer",
    year: "Current",
    stack: ["Electron", "React", "TypeScript", "Gemini"],
    signal: "JCL",
    accent: "amber",
    category: "AI + Automation",
    mode: "lab",
    status: "In development",
    highlights: [
      "Brings multiple calendars into a wall-display interface.",
      "Explores shared lists and color-coded family profiles.",
      "Uses natural-language commands for household planning.",
    ],
    dossier: {
      scope: "How can a shared household display make schedules and everyday lists easier to use?",
      ownership: ["Built an Electron and React application for touch screens and kiosk use.", "Explored calendar aggregation, family profiles, and shared lists.", "Connected natural-language commands through a Gemini integration."],
      systems: ["Electron and React", "Calendar integrations", "Gemini-powered commands"],
      note: "The project is a work in progress; this record describes the repository's current direction.",
    },
  },
  {
    id: "markdown-podcast-narrator",
    storyHtml: projectStories["markdown-podcast-narrator"],
    index: "24",
    sortOrder: 23,
    title: "Markdown Podcast Studio",
    eyebrow: "Notes into spoken episodes",
    summary: "Turn Markdown and research notes into an editable two-host podcast or talk-show script, then render distinct local voices into an MP3. Download for Mac or Windows.",
    role: "Creator · Engineer",
    year: "Current",
    stack: ["Electron", "Node.js", "Kokoro", "FFmpeg"],
    signal: "POD",
    accent: "ice",
    category: "Creative Tools",
    mode: "lab",
    status: "Desktop release · Mac + Windows",
    highlights: [
      "Drafts an editable two-host conversation from source notes.",
      "Renders distinct Kokoro voices locally and saves an MP3.",
      "Also supports a single-narrator reading mode without an AI writer.",
    ],
    dossier: {
      scope: "Can written notes become a useful spoken explanation while keeping the script editable?",
      ownership: ["Built the Electron episode studio and source intake workflow.", "Connected optional writing providers for conversation drafts.", "Added local Kokoro voice rendering, MP3 output, and playback."],
      systems: ["Electron desktop app", "Optional local or CLI writing providers", "Kokoro voice synthesis and FFmpeg"],
      note: "Voice generation runs locally after the Kokoro model downloads. MP3 export needs FFmpeg; automatic drafting needs a separate writing provider. Builds are unsigned and unnotarized.",
      source: { label: "Downloads & setup", url: "https://jakedoesdev.com/markdown-podcast-studio/" },
    },
  },
  {
    id: "music-writer",
    storyHtml: projectStories["music-writer"],
    index: "25",
    sortOrder: 24,
    title: "Music Writer",
    eyebrow: "Audio-to-code music research",
    summary: "A music analysis workspace exploring how separated audio stems and note events can become a reproducible Strudel arrangement.",
    role: "Creator · Researcher",
    year: "Current",
    stack: ["Python", "HTDemucs", "Basic Pitch", "Strudel"],
    signal: "MUW",
    accent: "acid",
    category: "Creative Tools",
    mode: "lab",
    status: "Research workspace",
    highlights: [
      "Separates a recording into instrumental stems for analysis.",
      "Fits detected notes and drum transients to a rhythmic grid.",
      "Generates Strudel reconstructions from the resulting events.",
    ],
    dossier: {
      scope: "How much of a recorded arrangement can be reconstructed as editable music code?",
      ownership: ["Created an analysis pipeline for stem separation and note extraction.", "Mapped detected events to a beat grid and section structure.", "Produced Strudel versions of the analyzed arrangement."],
      systems: ["Python analysis scripts", "HTDemucs and Basic Pitch", "Strudel music code"],
      note: "The current workspace documents one transcription study; this is research material rather than a released app.",
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
