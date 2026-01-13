CREATE TYPE "public"."gender_types" AS ENUM('male', 'female');--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "gender" "gender_types";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "birth_year" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "height" integer;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "weight" integer;