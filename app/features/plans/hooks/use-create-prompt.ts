import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";
import { createPrompt, type WorkoutPlanPromptPayload } from "../queries";
import { promptsKeys } from "../constants";

export const useCreatePrompt = () => {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkoutPlanPromptPayload) =>
      createPrompt(client, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: promptsKeys.lists() });
    },
  });
};
