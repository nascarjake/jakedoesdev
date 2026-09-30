-- Refresh the static portfolio snapshot without overwriting editor-managed records.
-- The existing 0001 seed predates three current portfolio records; this migration
-- makes the imported baseline match app/data/portfolio.ts before games link to it.
PRAGMA foreign_keys = ON;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS games (
  id text PRIMARY KEY NOT NULL,
  project_id text REFERENCES projects(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  title text NOT NULL,
  genre text DEFAULT '' NOT NULL,
  tagline text DEFAULT '' NOT NULL,
  description text DEFAULT '' NOT NULL,
  cover_url text DEFAULT '' NOT NULL,
  cover_storage_key text,
  cover_alt text DEFAULT '' NOT NULL,
  play_url text,
  embed_url text,
  controls_hint text,
  video_type text CHECK (video_type IN ('mp4', 'youtube') OR video_type IS NULL),
  video_url text,
  video_external_url text,
  video_embed_notice text,
  case_study_url text,
  availability text DEFAULT 'preview' NOT NULL CHECK (availability IN ('playable', 'preview', 'archive')),
  published integer DEFAULT false NOT NULL,
  featured integer DEFAULT false NOT NULL,
  version integer DEFAULT 1 NOT NULL,
  archived_at text,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS games_project_idx ON games (project_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS games_published_sort_idx ON games (published, archived_at, sort_order);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS games_cover_storage_key_idx ON games (cover_storage_key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS game_media (
  id text PRIMARY KEY NOT NULL,
  game_id text NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('image', 'video')),
  url text NOT NULL,
  storage_key text,
  caption text DEFAULT '' NOT NULL,
  alt_text text DEFAULT '' NOT NULL,
  mime_type text,
  sort_order integer DEFAULT 0 NOT NULL,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS game_media_game_sort_idx ON game_media (game_id, sort_order);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS game_media_storage_key_idx ON game_media (storage_key);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS game_revisions (
  id text PRIMARY KEY NOT NULL,
  game_id text NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  version integer NOT NULL,
  snapshot_json text NOT NULL,
  edited_by text NOT NULL,
  created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS game_revisions_game_idx ON game_revisions (game_id, version);
--> statement-breakpoint
-- Only the imported baseline is refreshed. Admin saves increment version and
-- archived projects are deliberately left untouched.
INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('ignite-dialogue', '0', 'Ignite Dialogue', 'Enterprise conversation engine', 'A configurable guided-conversation platform for banks and credit unions, helping teams match customers with relevant financial products across digital and in-branch journeys.', '', 'Lead Backend Engineer', '2020—Now', '["Node.js","React","AWS","MongoDB"]', 'DLG', 'acid', 'Enterprise', 'Production system', '["Modernized the primary decision-tree system and its supporting infrastructure for AWS scale.","Built self-service integrations with self-defining models and generated configuration UI.","Automated guide publishing and continuous delivery with AWS Service Catalog and CodePipeline."]', 'A modernization effort for a configurable guided-conversation platform used by financial institutions to guide product and service discussions.', '["Reworked the aging decision-tree foundation for cloud-scale operation.","Built an integration layer where models describe themselves and drive generated configuration UI.","Supported enterprise theming, customer customization, one-click guide publishing, and a staged MongoDB migration from one database into multiple clusters."]', '["Node.js services with a React application and legacy Scala","AWS CloudFormation, Service Catalog, Beanstalk, Lambda, Cognito, S3, SSM, SNS, and SQS","Cloudflare domains, Datadog observability, and separated MongoDB clusters"]', 'The current product page describes the broader platform; this record focuses on the architecture and delivery work listed in my résumé.', 'View current Ignite Dialogue context', 'https://ignitesales.com/solutions/', '1', '1', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('ignite-ai', '1', 'Ignite AI', 'Human-in-the-middle automation', 'Web and desktop tools for creating conversational guides and data-collection forms with reviewable AI assistance during client onboarding.', '', 'Lead Backend Engineer', 'Current', '["OpenAI","Node.js","React","Electron"]', 'AIX', 'amber', 'AI + Automation', 'Production tools', '["Designed multi-step workflows that keep people in control of AI output.","Combined language models, task agents, OCR, and existing decision-tree systems.","Used Puppeteer and Electron where browser automation or a desktop surface made the workflow more practical."]', 'Operator-facing web and desktop tools for creating guides and collecting onboarding information with AI assistance that can be reviewed and directed by people.', '["Designed human-in-the-middle flows so people can inspect and guide generated output.","Connected language models, document OCR, decision trees, and task agents into a multi-step onboarding process.","Built browser and Electron workflows for guide authoring, form generation, and supporting automation."]', '["Node.js and React","OpenAI API, GPT Assistants, task agents, and OCR","Electron and browser automation with Puppeteer"]', 'This page intentionally describes the workflow pattern rather than customer data, prompts, or internal onboarding operations.', NULL, NULL, '1', '1', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('tradelab', '2', 'TradeLab', 'Automated market strategy lab', 'A no-code trading automation platform for turning market-data inputs and webhooks into configurable strategy rules, dashboards, and AI-assisted workflows.', '', 'Founder · Product Engineer', '2021—Now', '["TypeScript","Angular","GCP","Firebase"]', 'TDL', 'ice', 'AI + Automation', 'Founder product', '["Created easy and advanced no-code strategy builders.","Built synchronous worker pools for time-sensitive market events and multiple data pipes.","Added an LLM conversation layer for authoring and refining strategy rules."]', 'A founder-built strategy automation product that turns market-data pipes and incoming webhooks into configurable rules and dashboards.', '["Designed separate easy and advanced rule-building modes for different levels of technical comfort.","Implemented synchronous worker pools for time-sensitive event processing.","Created an AI-assisted authoring experience and TradingView-connected workflow for building strategy rules."]', '["Angular 11, TypeScript, and Node.js","Firebase Auth, Firestore, and Google Cloud CI/CD","Webhooks, market-data pipes, worker pools, custom dashboards, and TradingView integration"]', 'The product is software for configuring workflows; it is not financial advice or a promise of market performance.', NULL, NULL, '1', '1', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('stream-elixir', '3', 'Stream Elixir', 'Automation for live creators', 'A cross-platform desktop product that automated recurring creator workflows across Twitch, Facebook, Twitter, and YouTube.', '', 'Founder · Product Engineer', '2018—2021', '["Electron","Angular","Express","MongoDB"]', 'STR', 'acid', 'SaaS', 'Shipped desktop app', '["Released as an Electron app for macOS, Windows 7+, and Linux.","Integrated Twitch, Facebook, Twitter, and YouTube APIs.","Focused on automating routine behaviors associated with running and growing a livestreaming audience."]', 'A cross-platform desktop application for automating repetitive community and audience-management routines for live creators.', '["Founded and shipped the product as a 2018 Electron release across three desktop platforms.","Integrated platform APIs for Twitch, Facebook, Twitter, and YouTube workflows.","Built the product around common creator routines rather than a single-channel dashboard."]', '["Electron desktop shell for macOS, Windows 7+, and Linux","Angular 9, Express, and MongoDB","Third-party social and livestream platform APIs"]', NULL, NULL, NULL, '1', '1', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('ezforms', '4', 'EZFORMS', 'Enterprise document platform', 'An enterprise digital-document platform with a drag-and-drop builder, admin portal, mobile execution, reporting, PDF output, and an integration SDK.', '', 'Product Lead · Lead Engineer', '2013—2020', '["Angular","Node.js","MongoDB","Ionic"]', 'EZF', 'amber', 'Enterprise', 'Production platform', '["Designed and iterated on the core drag-and-drop document builder.","Delivered native and hybrid iOS and Android form applications.","Built a PhantomJS-based webpage-to-PDF workflow and an SDK for external developers.","Used by FedEx, Taco Bueno, Dave & Buster’s, Yellow Tail Wines, Boy Scouts of America, and city municipalities, as listed in my résumé."]', 'A full document-execution platform spanning a web builder, administration portal, mobile apps, reporting, PDF output, and an integration SDK.', '["Led design, implementation, testing, and scaling work across the front and back end.","Designed and iterated on the drag-and-drop builder and the supporting administration portal.","Shipped native and hybrid mobile execution experiences, helped shape data models for reporting, and developed the document-to-PDF workflow."]', '["Angular 9, Node.js, MongoDB, and Ionic","Native Android and iOS delivery plus AndroidX and Jetpack","PhantomJS webpage-to-PDF rendering and a developer SDK"]', 'Named organizations are those listed in my résumé; this archive does not expose their forms, data, or internal deployments.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('eternus-tools', '5', 'Eternus Engine Tools', 'Live 3D game production suite', 'An eight-tool suite for live editing of game assets, particles, UI, atlases, terrain, and character animation against an in-house C++ engine.', '', 'Lead of Tool Development', '2015—2017', '["Electron","WebGL","Angular","C++"]', 'ETN', 'ice', 'Creative Tools', 'Shipped internal suite', '["Led a three-person full-stack tools team.","Designed caching to minimize expensive Electron remote-process calls.","Rendered the C++ engine directly into a WebGL canvas with a low-latency tool interface."]', 'An eight-tool production suite for editing live game assets and data against an in-house C++ engine.', '["Led a three-person full-stack tools team while also shipping tools and prototypes directly.","Developed a cache-conscious bridge between Electron processes and the live engine to reduce expensive cross-process calls.","Helped evolve the tooling UI from Angular 1 to Angular 5 and built custom WebGL graphing and TypeScript scripting directives."]', '["Electron, Angular, WebGL, and TypeScript","Low-latency C++ engine rendering in a WebGL canvas","Asset manager, particle, UI, atlas, terrain, character-animation, and node-graph tools"]', 'This is a retrospective of internal production tooling; implementation details are intentionally summarized.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('tumor-identifier', '6', 'Tumor Identifier', 'Medical imaging prototype', 'A Baylor Medical Center prototype that correlated 2D biopsy scans with a 3D biopsy model, then outlined and reconstructed tumor tissue in context.', '', 'Creative Technologist', 'R&D archive', '["TensorFlow.js","WebGL","Node.js"]', 'TMR', 'acid', 'AI + Automation', 'Research prototype', '["Aligned marked regions from 2D scans with a three-dimensional biopsy model.","Generated an outlined 3D representation of identified tumor tissue.","Used WebGL and browser tooling to make the scan-to-model relationship explorable."]', 'An R&D visualization prototype for aligning 2D biopsy scans with a three-dimensional biopsy model and reconstructing a marked region in context.', '["Worked with 3D and 2D biopsy scan inputs as part of the prototype workflow.","Mapped outlined regions across scan slices into a reconstructed 3D representation.","Built an explorable browser visualization to communicate the scan-to-model process."]', '["WebGL, Node.js, and custom browser JavaScript","TensorFlow.js listed in the original project stack","2D/3D scan alignment, contours, and reconstruction"]', 'The interactive demo on this site uses synthetic geometry only. It is a historical visualization prototype, not a diagnostic tool or clinical advice.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('ziprad', '7', 'ZipRad', 'EHR-to-imaging automation', 'A healthcare workflow that moved EHR data into imaging-center orders for X-rays and CAT scans, reducing manual re-entry between disconnected systems.', '', 'Lead Engineer', 'Product archive', '["Angular","Node.js","Kotlin","OCR"]', 'ZIP', 'amber', 'Enterprise', 'Production application', '["Built around a custom OCR print driver and PDF-generation pipeline.","Spanned an Angular web app, Node/Mongo services, and a privately distributed Kotlin Android app.","Supported a web portal and API-style handoff between systems that lacked a direct integration."]', 'A healthcare operations workflow for translating EHR-originated information into imaging-center orders without a manual re-entry step.', '["Built the order-generation workflow around a custom OCR print driver and PDF generation.","Worked across the Angular web application, Node/Mongo back end, and a privately distributed Kotlin Android app.","Focused the product on bridging systems that did not share a direct connection, using portal and API-based handoffs where appropriate."]', '["Angular 8, Node.js, and MongoDB","Custom OCR print driver, PDF pipeline, web portal, and APIs","Native Kotlin Android client"]', 'The work is described at a systems level to avoid exposing health data, integrations, or operational details.', 'View ZipData’s current product context', 'https://www.zipdatasolutions.com/', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('traxo', '8', 'Traxo', 'Travel organizer', 'Native iOS and Android travel-organizer apps for itineraries and reward programs, with an Android Wear companion for upcoming appointments.', '', 'Mobile Engineer', 'Mobile archive', '["Kotlin","Java","iOS","Android Wear"]', 'TRX', 'ice', 'Mobile', 'Shipped mobile apps', '["Delivered native Android and iOS applications released through their respective stores.","Built an Android Wear companion for upcoming travel appointments.","Migrated Android from the Support Library to AndroidX and Jetpack during a rewrite."]', 'Native mobile work for a travel product focused on keeping itineraries and reward information together, including a wearable companion.', '["Delivered native Android and iOS applications for travel organization and loyalty information.","Built an Android Wear component for upcoming travel appointments.","Modernized the Android implementation from the Support Library to AndroidX and Jetpack during a rewrite."]', '["Kotlin plus a proprietary Java SDK on Android","Native Android and iOS app-store delivery","Android Wear, AndroidX, and Jetpack"]', 'Traxo has since evolved into a broader corporate-travel platform; this page documents the earlier mobile product work in the archive.', 'View current Traxo context', 'https://www.traxo.com/', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('trails-end', '9', 'Trails End: Show N’ Sell', 'Field sales at enormous scale', 'A hybrid mobile app for Boy Scouts of America popcorn fundraisers to schedule sales events and take card payments in the field.', '', 'Mobile Product Engineer', 'Mobile archive', '["Ionic","Kotlin","Stripe","Google Maps"]', 'BSA', 'acid', 'Mobile', 'Shipped mobile apps', '["Released on Android and iOS with Ionic 3.","Used native Kotlin views for security-sensitive payment surfaces.","Integrated Stripe, Google Maps, and a Square integration serving millions of users."]', 'A field-sales companion for popcorn fundraising events, allowing scouts and leaders to coordinate selling and accept card payments.', '["Shipped hybrid iOS and Android applications with Ionic 3.","Integrated Stripe and Google Maps for sales and event workflows.","Used native Kotlin views for security-sensitive payment surfaces and supported a Square integration serving millions of users."]', '["Ionic 3 for iOS and Android","Kotlin, MVVM, AndroidX, and Jetpack","Stripe, Google Maps SDK, and Square integration"]', 'This is historical product work. Current Trails End features and branding may differ from the version represented here.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('callsmart', '10', 'CallSmart', 'Callahan Roach · later became ProfitRhino', 'A cross-platform field-service POS for repair professionals to manage customers and equipment, create orders, and take payment on site.', '', 'Mobile Engineer', 'Mobile archive', '["PhoneGap","Cordova","Kendo UI"]', 'POS', 'amber', 'Mobile', 'Shipped mobile apps', '["Built Android and iOS applications with PhoneGap, Cordova, Kendo UI, and MVVM.","Designed for plumbing, HVAC, and pool-service teams working away from the office."]', 'A mobile point-of-sale and field-service tool for repair teams managing customer details, equipment, orders, and payments on site.', '["Built Android and iOS experiences using a cross-platform PhoneGap/Cordova stack.","Structured the app around Kendo UI and an MVVM architecture.","Designed for practical customer, equipment, order, and payment workflows across plumbing, HVAC, and pool-service teams."]', '["PhoneGap and Cordova","Kendo UI with MVVM","Cross-platform Android and iOS delivery"]', 'CallSmart later became ProfitRhino; this record documents the earlier mobile product rather than the current company product.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('foodtronix-mobile-pos', '11', 'FoodTronix Mobile POS', 'Tableside restaurant ordering', 'An Android tablet ordering system that let restaurant staff take orders tableside and route them directly to kitchen printers within the existing POS suite.', '', 'Lead Developer', '2011—2012', '["Android","MSSQL","POS"]', 'FDP', 'ice', 'Mobile', 'Production application', '["Built native Android tablet ordering for tableside service and kitchen fulfillment.","Integrated with an established restaurant-management suite rather than a standalone ordering app.","Worked across MSSQL, receipt printers, payment gateways, and ticket tax and discount logic."]', 'A tablet-based tableside ordering experience integrated with a restaurant-management suite and its kitchen workflow.', '["Built an Android tablet workflow for taking orders at the table and routing them to kitchen printers.","Integrated with a broader restaurant-management suite rather than creating a disconnected ordering app.","Worked in the wider POS environment of MSSQL data, ticket logic, payments, printers, taxes, and discounts."]', '["Native Android tablet client","MSSQL-connected restaurant-management suite","Kitchen and receipt printers, payment gateways, tax, and discount integrations"]', 'The current FoodTronix offering has evolved; this project reflects the 2011–2012 mobile POS work.', 'View current FoodTronix context', 'https://www.foodtronix.com/', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('tug', '12', 'TUG v1', 'Smooth voxel sandbox', 'A Windows smooth-voxel sandbox game created with the Nerd Kingdom team, backed by TypeScript scripting and a custom production toolchain.', '', 'Tools Lead · Engineer', '2015—2017', '["TypeScript","C++","Game Tools"]', 'TUG', 'acid', 'Games', 'Shipped game project', '["Created and maintained parts of the TypeScript scripting system.","Built production tools for the team’s in-house game engine.","Worked across the Windows game release and its in-house C++ engine/toolchain."]', 'A Windows smooth-voxel sandbox created with the Nerd Kingdom team, paired with the production tooling needed to build it.', '["Created and maintained portions of the TypeScript scripting system.","Built the game-engine tools that supported the production team.","Worked across a Windows game project and an in-house C++ engine/toolchain."]', '["TypeScript scripting","Custom C++ game engine and production tooling","3D smooth-voxel sandbox gameplay"]', 'This archive records my tools and scripting contribution, not sole authorship of the game.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('daho', '13', 'DAHO', 'Strategy puzzle game', 'A Go-inspired number strategy puzzle with challenge modes and custom-written AI, prototyped natively and rebuilt for production.', '', 'Game Designer · Engineer', 'Game archive', '["Ionic","Angular","Android"]', 'DAH', 'amber', 'Games', 'Shipped game', '["Built the original proof of concept in native Android.","Rebuilt the production version with Ionic and Angular.","Designed challenge modes and wrote the game’s custom AI behavior."]', 'A number-based strategy puzzle inspired by Go, built first as a native proof of concept and then as a production game.', '["Prototyped the original game in native Android.","Rebuilt the release version with Ionic 4 and Angular 7.","Designed challenge modes and wrote the game’s custom AI behavior."]', '["Native Android proof of concept","Ionic 4 and Angular 7 production build","Custom game AI and challenge-mode logic"]', NULL, NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('jumpstart', '14', 'JumpStart', 'Photoshop-to-iPhone workflow', 'A Photoshop Cloud Edition plugin that sliced UI layers and programmatically turned them into the foundation of an iPhone application.', '', 'Creative Developer', 'Tool archive', '["JavaScript","Adobe Photoshop"]', 'JMP', 'ice', 'Creative Tools', 'Shipped plugin', '["Automated repetitive design-to-development handoff work through layer slicing.","Generated the starting structure of an iPhone application from design output.","Built in pure JavaScript using Adobe’s Photoshop framework."]', 'A Photoshop Cloud Edition plugin intended to reduce design-to-development repetition for early iPhone app workflows.', '["Automated slicing of UI layers within Photoshop.","Programmatically transformed design output into the foundation of an iPhone application.","Built the plugin in pure JavaScript against Adobe’s Photoshop framework."]', '["Adobe Photoshop Cloud Edition","JavaScript and Adobe extension APIs","Layer slicing and iPhone app-scaffolding automation"]', NULL, NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('hubster', '15', 'Hubster', 'Streaming availability guide', 'A web product for discovering where a film or series could be streamed across fragmented media services.', '', 'Product Engineer', 'Web archive', '["HTML5","CSS3","JavaScript","Bootstrap"]', 'HUB', 'acid', 'SaaS', 'Shipped web product', '["Unified fragmented streaming availability into a single browse experience.","Built the responsive product with HTML5, CSS3, JavaScript, and Bootstrap."]', 'An early web product for answering a simple discovery question: where can a specific title be streamed?', '["Designed a browse experience that brought fragmented streaming availability into one place.","Built the product with HTML5, CSS3, JavaScript, and Bootstrap.","Focused on reducing the hunt across multiple media services."]', '["HTML5, CSS3, and JavaScript","Bootstrap responsive UI","Streaming availability browsing"]', NULL, NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('dm-auto-leasing', '16', 'D&M Auto Leasing', 'Native leasing application', 'A native Android application for a Texas auto-leasing business, built in Java and released through the app store.', '', 'Android Engineer', 'Mobile archive', '["Java","Android Studio"]', 'DMA', 'amber', 'Mobile', 'Shipped mobile app', '["Designed and delivered as a native Android application.","Built with Java and Android Studio for an app-store release.","Supported a customer-facing vehicle-leasing workflow."]', 'A native Android application for a Texas auto-leasing company, released through the Android app store at the time.', '["Designed and delivered the mobile application as a native Android product.","Worked in Java and Android Studio for the app-store release.","Built for a customer-facing vehicle-leasing workflow."]', '["Java and Android Studio","Native Android application delivery","App-store release lifecycle"]', 'The original Android app is no longer listed on Google Play. D&M’s current leasing website is linked as present-day company context.', 'View current D&M Leasing context', 'https://www.dmautoleasing.com/', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('rack-ruin', '17', 'Rack & Ruin', 'Cross-platform billiards game', 'A billiards game for Android, iOS, and Steam with four modes, including turn-based and realtime multiplayer, plus Steam-powered online play and Workshop mods.', '', 'Game Developer', '2026', '["WebGL","React","Electron","Vite","Steam SDK"]', 'RNR', 'ice', 'Games', 'Production game', '["Built for Android, iOS, and Steam.","Includes four game modes, with turn-based and realtime multiplayer.","Integrated the Steam SDK for online play and Workshop mods."]', 'A cross-platform billiards game for Android, iOS, and Steam, combining four distinct modes with both turn-based and realtime multiplayer play.', '["Built the game with WebGL, React, Electron, and Vite.","Implemented four game modes, including turn-based and realtime multiplayer.","Integrated the Steam SDK for online play and Workshop mod support."]', '["WebGL and React game interface","Electron and Vite application tooling","Steam SDK online-play and Workshop integration"]', 'This record reflects the 2026 production game described in my résumé.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('luminary', '18', 'Luminary', 'Open-source AI workflow builder', 'An open-source workflow builder for chaining multiple LLM agents, backed by a reusable AI Flow engine library that runs Luminary projects in other apps.', '', 'Open-source Creator', '2025', '["Electron","Angular","LLM Studio","AI Flow Engine"]', 'LUM', 'amber', 'AI + Automation', 'Open-source product', '["Built a workflow builder for chaining multiple LLM agents.","Released as an open-source project, listed in the résumé with 50+ stars.","Created an AI Flow engine library for running Luminary projects in other apps."]', 'An open-source AI workflow builder for composing multiple LLM agents and carrying those workflows into other applications through a reusable engine library.', '["Created a workflow builder for chaining multiple LLM agents.","Built the desktop interface with Electron and Angular.","Developed an AI Flow engine library so Luminary projects can run in other apps."]', '["Electron desktop application","Angular interface","LLM Studio and reusable AI Flow engine library"]', 'The résumé describes Luminary as an open-source project with 50+ stars; this archive does not present that as a live star count.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;

INSERT INTO projects (id, sort_order, title, eyebrow, summary, story_html, role, year, stack_json, signal, accent, category, status, highlights_json, scope, ownership_json, systems_json, note, source_label, source_url, published, featured, version) VALUES ('straight-desk', '19', 'Straight Desk', '24/7 voice operations assistant', 'A live-audio LLM phone assistant for 24/7 inbound and outbound support, scheduling, CRM, and knowledge-base workflows.', '', 'Co-Founder', '2026', '["Live audio LLMs","Cloudflare","DigitalOcean"]', 'SDS', 'acid', 'AI + Automation', 'Production product', '["Supports more than 30 tool calls for schedules, CRM, knowledge bases, and related workflows.","Handles inbound calls and outbound follow-up calls.","Includes a 90-second AI builder and training mode that suggests training changes."]', 'A production voice-assistant product built around live audio LLM models for round-the-clock phone support and operational work such as scheduling, CRM, and knowledge-base tasks. The résumé describes support in over 90 languages.', '["Co-founded the product through OJ Digital.","Built a phone workflow that handles inbound calls and can make outbound follow-up calls.","Developed the AI builder and training mode for customer setup and suggested training changes."]', '["Live audio LLM phone assistant","30+ tool-call surface for schedules, CRM, and knowledge bases","Cloudflare and DigitalOcean infrastructure"]', 'Details here follow the 2026 product description in my résumé; availability and capabilities can evolve.', NULL, NULL, '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET sort_order = excluded.sort_order, title = excluded.title, eyebrow = excluded.eyebrow, summary = excluded.summary, story_html = excluded.story_html, role = excluded.role, year = excluded.year, stack_json = excluded.stack_json, signal = excluded.signal, accent = excluded.accent, category = excluded.category, status = excluded.status, highlights_json = excluded.highlights_json, scope = excluded.scope, ownership_json = excluded.ownership_json, systems_json = excluded.systems_json, note = excluded.note, source_label = excluded.source_label, source_url = excluded.source_url, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE projects.version = 1 AND projects.archived_at IS NULL;
--> statement-breakpoint
-- Seed the standalone Goose Games cartridges. The synthetic studio card stays
-- presentation-only; it is not a mutable game record.
INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('orbital-smash', NULL, '0', 'Orbital Smash', 'Physics survival', 'Swing the chain. Smash the swarm.', 'Build momentum and swing through a swarm in this orbital physics arcade game.', '/arcade/orbital-smash-cover.webp', NULL, 'Orbital Smash illustrated game cover.', 'https://orbitalsmash.com', 'https://nascarjake.github.io/orbital-smash/', NULL, 'mp4', 'https://nascarjake.github.io/orbital-smash/assets/OrbitalSmash-preview-eg-k7ubP.mp4', 'https://nascarjake.github.io/orbital-smash/assets/OrbitalSmash-preview-eg-k7ubP.mp4', NULL, NULL, 'playable', '1', '1', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('revo', NULL, '1', 'REVO', 'Rhythm', 'Your keys. Your music.', 'A keyboard rhythm game with multiple key layouts, difficulty levels, and a library of music to explore.', '/arcade/revo-cover.webp', NULL, 'REVO illustrated game cover.', 'https://nascarjake.github.io/measure-web/', 'https://nascarjake.github.io/measure-web/', NULL, NULL, NULL, NULL, NULL, NULL, 'playable', '1', '1', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('downbeat', NULL, '2', 'Downbeat', 'Skate + rhythm', 'Your song. Your line.', 'An arcade skate mixtape. Bring your music, find your flow, and thread tricks through the city.', '/arcade/downbeat-cover.webp', NULL, 'Downbeat illustrated game cover.', 'https://nascarjake.github.io/measure-web/downbeat/', 'https://nascarjake.github.io/measure-web/downbeat/', NULL, NULL, NULL, NULL, NULL, NULL, 'playable', '1', '1', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('dye-day', NULL, '3', 'Dye Day!', 'Creative studio', 'Fold it. Tie it. Make it yours.', 'A playful tie-dye studio. Choose a fold, tie your shirt, splash on color, and finish a one-of-a-kind tee for the worldwide clothesline.', '/arcade/dye-day-cover.webp', NULL, 'Dye Day! illustrated game cover.', 'https://tyedye.jakedoesdev.com', 'https://tyedye.jakedoesdev.com', 'Mouse or touch controls.', NULL, NULL, NULL, NULL, NULL, 'playable', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('daho', 'daho', '4', 'DAHO', 'Strategy puzzle', 'A little thought goes a long way.', 'A board-game-inspired number puzzle with challenge modes and custom-written AI. Original Android prototype, rebuilt with Ionic and Angular.', '/arcade/daho-cover.webp', NULL, 'DAHO illustrated game cover.', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'https://jakedoesdev.com/universe/#daho', 'archive', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('rack-ruin', 'rack-ruin', '5', 'Rack & Ruin', 'Roguelike pool', 'One more rack. One more run.', 'A roguelike pool gauntlet with classic billiards, shop twists, and changing tables.', '/arcade/rack-ruin-cover.webp', NULL, 'Rack & Ruin illustrated game cover.', 'https://nascarjake.github.io/rack-web/', 'https://nascarjake.github.io/rack-web/', NULL, 'youtube', 'https://www.youtube-nocookie.com/embed/Qb1iRTERCVA?start=1971', 'https://youtu.be/Qb1iRTERCVA?t=1971', NULL, NULL, 'playable', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('pinfall', NULL, '6', 'Pinfall', 'Roguelike bowling', 'Ten pins. Strange lanes.', 'Bowling with roguelike routes, shops, special pins, boss lanes, and a daily lineup.', '/arcade/pinfall-cover.webp', NULL, 'Pinfall illustrated game cover.', 'https://nascarjake.github.io/bowling-web/', 'https://nascarjake.github.io/bowling-web/', NULL, NULL, NULL, NULL, NULL, NULL, 'playable', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('netrunner', NULL, '7', 'Netrunner', 'Network strategy', 'Keep the packets moving.', 'Wire up server blades, manage network upgrades, and hold your infrastructure together through escalating attack waves.', '/arcade/netrunner-cover.webp', NULL, 'Netrunner illustrated game cover.', 'https://nascarjake.github.io/netrunner/', 'https://nascarjake.github.io/netrunner/', NULL, NULL, NULL, NULL, NULL, NULL, 'playable', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('rift-riot', NULL, '8', 'Rift Riot', 'Fighting', 'Find your opening. Make it count.', 'An arena fighter with CPU and local versus modes, an arcade circuit, and a combat lab for exploring moves frame by frame.', '/arcade/rift-riot-cover.webp', NULL, 'Rift Riot illustrated game cover.', 'https://nascarjake.github.io/fight-web/', 'https://nascarjake.github.io/fight-web/', NULL, NULL, NULL, NULL, NULL, NULL, 'playable', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('millionaire', NULL, '9', 'Millionaire', 'AI trivia', 'Fifteen questions. Your moment.', 'A Who Wants to Be a Millionaire-inspired trivia game with a virtual studio and lifelines. The linked build offers practice mode; AI mode requires a hosted server.', '/arcade/millionaire-cover.webp', NULL, 'Millionaire illustrated game cover.', 'https://nascarjake.github.io/trivia/', 'https://nascarjake.github.io/trivia/', NULL, NULL, NULL, NULL, NULL, NULL, 'playable', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;

INSERT INTO games (id, project_id, sort_order, title, genre, tagline, description, cover_url, cover_storage_key, cover_alt, play_url, embed_url, controls_hint, video_type, video_url, video_external_url, video_embed_notice, case_study_url, availability, published, featured, version) VALUES ('fortune-quest', NULL, '10', 'Fortune Quest', 'Roguelike slots', 'Give fortune another spin.', 'A roguelike slot game. Take a look at the gameplay preview for a spin through Fortune Quest.', '/arcade/fortune-quest-cover.webp', NULL, 'Fortune Quest illustrated game cover.', NULL, NULL, NULL, 'youtube', 'https://www.youtube-nocookie.com/embed/kJRTlCn5-xA', 'https://youtu.be/kJRTlCn5-xA', 'This preview is age-restricted by YouTube and must be watched there.', NULL, 'preview', '1', '0', '1')
ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, sort_order = excluded.sort_order, title = excluded.title, genre = excluded.genre, tagline = excluded.tagline, description = excluded.description, cover_url = excluded.cover_url, cover_storage_key = excluded.cover_storage_key, cover_alt = excluded.cover_alt, play_url = excluded.play_url, embed_url = excluded.embed_url, controls_hint = excluded.controls_hint, video_type = excluded.video_type, video_url = excluded.video_url, video_external_url = excluded.video_external_url, video_embed_notice = excluded.video_embed_notice, case_study_url = excluded.case_study_url, availability = excluded.availability, published = excluded.published, featured = excluded.featured, updated_at = CURRENT_TIMESTAMP
WHERE games.version = 1 AND games.archived_at IS NULL;
--> statement-breakpoint
INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('revo-1', 'revo', 'image', '/arcade/screenshots/revo-1.webp', NULL, 'REVO music library with track selection, key layouts, and difficulty settings.', 'REVO music library with track selection, key layouts, and difficulty settings.', NULL, '0')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('downbeat-1', 'downbeat', 'image', '/arcade/screenshots/downbeat-1.webp', NULL, 'Downbeat title screen with a skater and an urban half-pipe.', 'Downbeat title screen with a skater and an urban half-pipe.', NULL, '0')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('downbeat-2', 'downbeat', 'image', '/arcade/screenshots/downbeat-2.webp', NULL, 'Downbeat downhill skating gameplay with timing gates and trick scoring.', 'Downbeat downhill skating gameplay with timing gates and trick scoring.', NULL, '1')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('rack-ruin-1', 'rack-ruin', 'image', '/arcade/screenshots/rack-ruin-1.webp', NULL, 'Rack & Ruin title menu with Ruin Run and Classic Pool modes.', 'Rack & Ruin title menu with Ruin Run and Classic Pool modes.', NULL, '0')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('rack-ruin-2', 'rack-ruin', 'image', '/arcade/screenshots/rack-ruin-2.webp', NULL, 'Rack & Ruin green-felt eight-ball table with an active pocket multiplier.', 'Rack & Ruin green-felt eight-ball table with an active pocket multiplier.', NULL, '1')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('rack-ruin-3', 'rack-ruin', 'image', '/arcade/screenshots/rack-ruin-3.webp', NULL, 'Rack & Ruin blue-felt table with glowing modified pool balls.', 'Rack & Ruin blue-felt table with glowing modified pool balls.', NULL, '2')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('pinfall-1', 'pinfall', 'image', '/arcade/screenshots/pinfall-1.webp', NULL, 'Pinfall player hub with roguelike runs, ten-pin mode, and a daily lineup.', 'Pinfall player hub with roguelike runs, ten-pin mode, and a daily lineup.', NULL, '0')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('netrunner-1', 'netrunner', 'image', '/arcade/screenshots/netrunner-1.webp', NULL, 'Netrunner server blades linked by blue network cables carrying data packets.', 'Netrunner server blades linked by blue network cables carrying data packets.', NULL, '0')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('netrunner-2', 'netrunner', 'image', '/arcade/screenshots/netrunner-2.webp', NULL, 'Netrunner telemetry panel with rack thermals, diagnostic logs, and attack-wave status.', 'Netrunner telemetry panel with rack thermals, diagnostic logs, and attack-wave status.', NULL, '1')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('rift-riot-1', 'rift-riot', 'image', '/arcade/screenshots/rift-riot-1.webp', NULL, 'Rift Riot main menu featuring Ivy and versus, local, and arcade modes.', 'Rift Riot main menu featuring Ivy and versus, local, and arcade modes.', NULL, '0')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('rift-riot-2', 'rift-riot', 'image', '/arcade/screenshots/rift-riot-2.webp', NULL, 'Rift Riot fighter selection featuring Rook and the character roster.', 'Rift Riot fighter selection featuring Rook and the character roster.', NULL, '1')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('rift-riot-3', 'rift-riot', 'image', '/arcade/screenshots/rift-riot-3.webp', NULL, 'Rift Riot fight between Raijin and Sora in a neon-lit street arena.', 'Rift Riot fight between Raijin and Sora in a neon-lit street arena.', NULL, '2')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('rift-riot-4', 'rift-riot', 'image', '/arcade/screenshots/rift-riot-4.webp', NULL, 'Rift Riot combat lab showing hitboxes, frame data, and move properties.', 'Rift Riot combat lab showing hitboxes, frame data, and move properties.', NULL, '3')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);

INSERT INTO game_media (id, game_id, kind, url, storage_key, caption, alt_text, mime_type, sort_order)
VALUES ('millionaire-1', 'millionaire', 'image', '/arcade/screenshots/millionaire-1.webp', NULL, 'Millionaire virtual quiz studio with a music question, lifelines, and the prize ladder.', 'Millionaire virtual quiz studio with a music question, lifelines, and the prize ladder.', NULL, '0')
ON CONFLICT(id) DO UPDATE SET
  game_id = excluded.game_id,
  kind = excluded.kind,
  url = excluded.url,
  storage_key = excluded.storage_key,
  caption = excluded.caption,
  alt_text = excluded.alt_text,
  mime_type = excluded.mime_type,
  sort_order = excluded.sort_order
WHERE EXISTS (
  SELECT 1 FROM games
  WHERE games.id = excluded.game_id
    AND games.version = 1
    AND games.archived_at IS NULL
);
