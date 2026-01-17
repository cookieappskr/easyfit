import { useQuery } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";
import { getPrompts, type PromptsListParams } from "../queries";
import { promptsKeys } from "../constants";

export const usePrompts = (params: PromptsListParams) => {
  const client = useSupabaseClient();

  return useQuery({
    queryKey: promptsKeys.list(params),
    queryFn: () => getPrompts(client, params),
  });
};
