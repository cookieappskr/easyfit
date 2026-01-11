import {
  bigint,
  boolean,
  check,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 타입 설정부
import { CATEGORY_TYPES } from "./constants";

export const category_types = pgEnum(
  "category_types",
  CATEGORY_TYPES.map((type) => type.value) as [string, ...string[]]
);

// 카테고리 테이블 설정부
export const categories = pgTable(
  "categories",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    type: category_types().notNull(),
    name: text().notNull(),
    description: text().notNull(),
    is_active: boolean().notNull().default(true),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => [
    check(
      "name_length_check",
      sql`LENGTH(${table.name}) >= 1 AND LENGTH(${table.name}) <= 50`
    ),
    check(
      "description_length_check",
      sql`LENGTH(${table.description}) >= 1 AND LENGTH(${table.description}) <= 200`
    ),
  ]
);
