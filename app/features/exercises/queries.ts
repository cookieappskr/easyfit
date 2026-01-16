import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "~/supa-client";

export interface Exercise {
  id: number;
  exercise_type: string;
  mechanic_type: string;
  name: string;
  description: string;
  quick_guide: string[] | null;
  video_link: string | null;
  created_at: string;
  updated_at: string;
}

export type ExercisePayload = Omit<Exercise, "id" | "created_at" | "updated_at">;

const getExerciseTable = (client: SupabaseClient<Database>) =>
  (client as SupabaseClient<any>).from("exercises");

export interface ExerciseListParams {
  page: number;
  pageSize: number;
  exerciseType?: string;
  searchName?: string;
  sort?: string;
}

export const getExercises = async (
  client: SupabaseClient<Database>,
  params: ExerciseListParams
) => {
  const { page, pageSize, exerciseType, searchName, sort } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = getExerciseTable(client).select("*", { count: "exact" });

  if (exerciseType) {
    query = query.eq("exercise_type", exerciseType);
  }
  if (searchName) {
    query = query.ilike("name", `%${searchName}%`);
  }

  switch (sort) {
    case "created_asc":
      query = query.order("created_at", { ascending: true });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "name_desc":
      query = query.order("name", { ascending: false });
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
    items: (data || []) as Exercise[],
    total: count || 0,
  };
};

export const getExerciseById = async (
  client: SupabaseClient<Database>,
  id: number
) => {
  const { data, error } = await getExerciseTable(client)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  return (data || null) as Exercise | null;
};

export const createExercise = async (
  client: SupabaseClient<Database>,
  payload: ExercisePayload
) => {
  const { data, error } = await getExerciseTable(client)
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

  return data as Exercise;
};

export const updateExercise = async (
  client: SupabaseClient<Database>,
  id: number,
  updates: Partial<ExercisePayload>
) => {
  const { data, error } = await getExerciseTable(client)
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

  return data as Exercise;
};

export const deleteExercise = async (
  client: SupabaseClient<Database>,
  id: number
) => {
  const { error } = await getExerciseTable(client).delete().eq("id", id);

  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
};
