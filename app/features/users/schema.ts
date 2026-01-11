import {
  bigint,
  boolean,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Supabase auth에 이미 있는 테이블이어서 실제로 만들면 안되고, 외부키 참조용으로만 만드는 것임
// 이렇게 만든 후 추후 Drizzle 쿼리문에서 auth.users 부분 삭제 필요
export const users = pgSchema("auth").table("users", {
  id: uuid().primaryKey(),
});

export const role_types = pgEnum("role_types", ["admin", "user", "other"]);

export const profiles = pgTable("profiles", {
  id: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  avatar: text(),
  nickname: text().notNull(),
  email: text().notNull(),
  role: role_types().default("user"),
  created_at: timestamp().notNull().defaultNow(),
  updated_at: timestamp().notNull().defaultNow(),
});
