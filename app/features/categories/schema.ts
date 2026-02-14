import {
  bigint,
  boolean,
  check,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// 카테고리 테이블 설정부
export const categories = pgTable(
  "categories",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    parent_id: bigint({ mode: "number" }),
    name: text().notNull(), // 유형명
    code: text().notNull(), // 유형코드
    display_order: integer().notNull().default(0), // 표시순서
    value: text(), // value (구 부가속성1)
    description: text(), // description (구 부가속성2)
    additional_attribute1: text(), // 부가속성1 (구 부가속성3)
    additional_attribute2: text(), // 부가속성2 (구 부가속성4)
    additional_attribute3: text(), // 부가속성3 (구 부가속성5)
    is_active: boolean().notNull().default(true), // 사용여부
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => [
    check(
      "name_length_check",
      sql`LENGTH(${table.name}) >= 1 AND LENGTH(${table.name}) <= 50`
    ),
    check(
      "code_length_check",
      sql`LENGTH(${table.code}) >= 1 AND LENGTH(${table.code}) <= 50`
    ),
  ]
);
