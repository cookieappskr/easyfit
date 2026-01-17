import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";
import { activatePrompt } from "../queries";
import { promptsKeys } from "../constants";

export const useActivatePrompt = () => {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => activatePrompt(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: promptsKeys.active() });
    },
  });
};
