import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "react-router";
import { type Database } from "~/supa-client";

// User정보 확인
export const getUserByUsername = async (
  client: SupabaseClient<Database>,
  username: string
) => {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("username", username)
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
    .select(
      `
        id,
        name,
        username,
        avatar
    `
    )
    .eq("id", id)
    .single();
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  return data;
};

export const getLoggedInUserId = async (client: SupabaseClient<Database>) => {
  const { data, error } = await client.auth.getUser();
  if (error || data.user === null) {
    console.error(error);
    throw redirect("/auth/login");
  }
  return data.user.id;
};
