import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";
import { deletePrompt } from "../queries";
import { promptsKeys } from "../constants";

export const useDeletePrompt = () => {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deletePrompt(client, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptsKeys.lists() });
    },
  });
};
