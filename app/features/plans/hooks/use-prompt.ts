import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";
import { getPromptById } from "../queries";
import { promptsKeys } from "../constants";

export const usePrompt = (id: number | null) => {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: promptsKeys.detail(id || 0),
    queryFn: () => {
      if (!id) return null;
      return getPromptById(client, id);
    },

    
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5분
  });
};
