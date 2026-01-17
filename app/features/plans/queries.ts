import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export interface WorkoutPlanPrompt {
  id: number;
  title: string;
  llm_model_code: string;
  base_prompt: string;
  output_format: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WorkoutPlanPromptPayload = Omit<
  WorkoutPlanPrompt,
  "id" | "created_at" | "updated_at"
>;

const getPromptsTable = (client: SupabaseClient<Database>) =>
  (client as SupabaseClient<any>).from("workout_plan_prompts");

export interface PromptsListParams {
  page: number;
  pageSize: number;
  searchPrompt?: string;
  sort?: string;
}

/**
 * 프롬프트 목록 조회
 */
export const getPrompts = async (
  client: SupabaseClient<Database>,
  params: PromptsListParams
) => {
  const { page, pageSize, searchPrompt, sort } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getPromptsTable(client).select("*", { count: "exact" });

  // 검색 조건
  if (searchPrompt) {
    query = query.ilike("base_prompt", `%${searchPrompt}%`);
  }

  // 정렬
  switch (sort) {
    case "created_asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "title_asc":
      query = query.order("title", { ascending: true });
      break;
    case "created_desc":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return {
    items: (data || []) as WorkoutPlanPrompt[],
    total: count || 0,
  };
};

/**
 * 프롬프트 단건 조회
 */
export const getPromptById = async (
  client: SupabaseClient<Database>,
  id: number
) => {
  const { data, error } = await getPromptsTable(client)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return (data || null) as WorkoutPlanPrompt | null;
};

/**
 * 활성화된 프롬프트 조회
 */
export const getActivePrompt = async (client: SupabaseClient<Database>) => {
  const { data, error } = await getPromptsTable(client)
    .select("*")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return (data || null) as WorkoutPlanPrompt | null;
};

/**
 * 프롬프트 생성
 */
export const createPrompt = async (
  client: SupabaseClient<Database>,
  payload: WorkoutPlanPromptPayload
) => {
  const { data, error} = await getPromptsTable(client)
    .insert({
      ...payload,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data as WorkoutPlanPrompt;
};

/**
 * 프롬프트 수정
 */
export const updatePrompt = async (
  client: SupabaseClient<Database>,
  id: number,
  updates: Partial<WorkoutPlanPromptPayload>
) => {
  const { data, error } = await getPromptsTable(client)
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data as WorkoutPlanPrompt;
};

/**
 * 프롬프트 활성화 (다른 모든 프롬프트는 비활성화)
 */
export const activatePrompt = async (
  client: SupabaseClient<Database>,
  id: number
) => {
  // 트랜잭션처럼 동작하도록 순차 실행
  // 1. 모든 프롬프트 비활성화
  const { error: deactivateError } = await getPromptsTable(client)
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .neq("id", 0); // 모든 행 대상

  if (deactivateError) {
    console.error(deactivateError);
    throw new Error(deactivateError.message);
  }

  // 2. 선택한 프롬프트만 활성화
  const { data, error } = await getPromptsTable(client)
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return data as WorkoutPlanPrompt;
};

/**
 * 프롬프트 삭제
 */
export const deletePrompt = async (
  client: SupabaseClient<Database>,
  id: number
) => {
  const { error } = await getPromptsTable(client).delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
