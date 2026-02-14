import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "react-router";
import { type Database } from "~/supa-client";

// User정보 확인
export const getUserByNickname = async (
  client: SupabaseClient<Database>,
  nickname: string
) => {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("nickname", nickname)
    .single();
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};

export const getUserById = async (
  client: SupabaseClient<Database>,
  id: string
) => {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  if (!data) return null;
  return {
    id: data.id,
    nickname: data.nickname ?? "",
    avatar: data.avatar ?? null,
    role: data.role ?? "user",
  };
};

export const getLoggedInUserId = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.auth.getUser();
  if (error || data.user === null) {
    console.error(error);
    throw redirect("/auth/login");
  }
  return data.user.id;
};
