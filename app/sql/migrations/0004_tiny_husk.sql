CREATE TABLE "exercises" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "exercises_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"exercise_type" text NOT NULL,
	"mechanic_type" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"quick_guide" text[],
	"video_link" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "exercise_name_length_check" CHECK (LENGTH("exercises"."name") >= 1 AND LENGTH("exercises"."name") <= 50),
	CONSTRAINT "exercise_description_length_check" CHECK (LENGTH("exercises"."description") >= 1 AND LENGTH("exercises"."description") <= 200)
);
