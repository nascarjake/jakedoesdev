CREATE TABLE `project_media` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`kind` text NOT NULL,
	`url` text NOT NULL,
	`storage_key` text,
	`poster_url` text,
	`caption` text DEFAULT '' NOT NULL,
	`alt_text` text DEFAULT '' NOT NULL,
	`mime_type` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`autoplay` integer DEFAULT true NOT NULL,
	`preload` text DEFAULT 'metadata' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_media_project_sort_idx` ON `project_media` (`project_id`,`kind`,`sort_order`);--> statement-breakpoint
CREATE TABLE `project_revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot_json` text NOT NULL,
	`edited_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `project_revisions_project_idx` ON `project_revisions` (`project_id`,`version`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`title` text NOT NULL,
	`eyebrow` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`story_html` text DEFAULT '' NOT NULL,
	`role` text DEFAULT '' NOT NULL,
	`year` text DEFAULT '' NOT NULL,
	`stack_json` text DEFAULT '[]' NOT NULL,
	`signal` text DEFAULT 'PRJ' NOT NULL,
	`accent` text DEFAULT 'acid' NOT NULL,
	`category` text DEFAULT 'SaaS' NOT NULL,
	`status` text DEFAULT 'Draft' NOT NULL,
	`highlights_json` text DEFAULT '[]' NOT NULL,
	`scope` text DEFAULT '' NOT NULL,
	`ownership_json` text DEFAULT '[]' NOT NULL,
	`systems_json` text DEFAULT '[]' NOT NULL,
	`note` text,
	`source_label` text,
	`source_url` text,
	`published` integer DEFAULT false NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`archived_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `projects_published_sort_idx` ON `projects` (`published`,`archived_at`,`sort_order`);