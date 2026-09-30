CREATE TABLE `updates` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`bullets_json` text DEFAULT '[]' NOT NULL,
	`source_keys_json` text DEFAULT '[]' NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `updates_published_date_idx` ON `updates` (`published`,`date`);
