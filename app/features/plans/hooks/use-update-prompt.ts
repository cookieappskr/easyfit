import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "~/hooks/use-supabase-client";
import { updatePrompt, type WorkoutPlanPromptPayload } from "../queries";
import { promptsKeys } from "../constants";

interface UpdatePromptParams {
  id: number;
  updates: Partial<WorkoutPlanPromptPayload>;
}

export const useUpdatePrompt = () => {
  const client = useSupabaseClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: UpdatePromptParams) =>
      updatePrompt(client, id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: promptsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: promptsKeys.detail(variables.id),
      });
    },
  });
};
