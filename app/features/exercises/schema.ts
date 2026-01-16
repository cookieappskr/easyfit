import { bigint, text, timestamp, pgTable, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const exercises = pgTable(
  "exercises",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    exercise_type: text().notNull(),
    mechanic_type: text().notNull(),
    name: text().notNull(),
    description: text().notNull(),
    quick_guide: text().array(),
    video_link: text(),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => [
    check(
      "exercise_name_length_check",
      sql`LENGTH(${table.name}) >= 1 AND LENGTH(${table.name}) <= 50`
    ),
    check(
      "exercise_description_length_check",
      sql`LENGTH(${table.description}) >= 1 AND LENGTH(${table.description}) <= 200`
    ),
  ]
);
