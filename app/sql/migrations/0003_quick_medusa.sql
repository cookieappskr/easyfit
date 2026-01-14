ALTER TABLE "categories" DROP CONSTRAINT "description_length_check";--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "parent_id" bigint;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "additional_attribute1" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "additional_attribute2" text;--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "code_length_check" CHECK (LENGTH("categories"."code") >= 1 AND LENGTH("categories"."code") <= 50);--> statement-breakpoint
DROP TYPE "public"."category_types";