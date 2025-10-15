CREATE TABLE `automations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`changes_group_id` integer NOT NULL,
	`frequency` text NOT NULL,
	`start_time` text NOT NULL,
	FOREIGN KEY (`changes_group_id`) REFERENCES `price_markup_changes_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `price_markup_changes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`changes_group_id` integer NOT NULL,
	`offer_id` text NOT NULL,
	`new_price` real NOT NULL,
	FOREIGN KEY (`changes_group_id`) REFERENCES `price_markup_changes_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `price_markup_changes_groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`catalog_urls` text NOT NULL,
	`number_of_all_offers` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `price_markup_changes_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`changes_group_id` integer NOT NULL,
	`status` text NOT NULL,
	`type` text NOT NULL,
	`number_of_successfully_changed_offers` integer,
	`created_at` text NOT NULL,
	FOREIGN KEY (`changes_group_id`) REFERENCES `price_markup_changes_groups`(`id`) ON UPDATE no action ON DELETE cascade
);
