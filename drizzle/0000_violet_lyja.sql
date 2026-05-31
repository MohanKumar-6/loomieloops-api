CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`user_id` varchar(36),
	`total` decimal(10,2) NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(255) NOT NULL,
	`name` text NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`category` varchar(100) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tracking` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`order_id` varchar(36) NOT NULL,
	`status` varchar(50) NOT NULL,
	`location` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL DEFAULT (UUID()),
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`name` text,
	`reset_token` text,
	`reset_token_expiry` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tracking` ADD CONSTRAINT `tracking_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;