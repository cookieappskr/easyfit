import { bigint, text, timestamp, pgTable, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * 운동계획 생성 프롬프트 테이블
 * 
 * AI 기반 운동계획 생성을 위한 LLM 모델, 프롬프트, 출력 형식을 관리
 */
export const workoutPlanPrompts = pgTable(
  "workout_plan_prompts",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    title: text().notNull(),
    llm_model_code: text().notNull(), // categories 테이블의 code 참조
    base_prompt: text().notNull(),
    output_format: text().notNull(),
    is_active: boolean().notNull().default(false),
    created_at: timestamp().notNull().defaultNow(),
    updated_at: timestamp().notNull().defaultNow(),
  },
  (table) => [
    // 제목 길이 체크
    sql`CHECK (LENGTH(${table.title}) >= 1 AND LENGTH(${table.title}) <= 50)`,
    // 기본프롬프트 길이 체크
    sql`CHECK (LENGTH(${table.base_prompt}) >= 1 AND LENGTH(${table.base_prompt}) <= 2000)`,
    // 출력형식 길이 체크
    sql`CHECK (LENGTH(${table.output_format}) >= 1 AND LENGTH(${table.output_format}) <= 2000)`,
  ]
);

export type WorkoutPlanPrompt = typeof workoutPlanPrompts.$inferSelect;
export type WorkoutPlanPromptInsert = typeof workoutPlanPrompts.$inferInsert;
