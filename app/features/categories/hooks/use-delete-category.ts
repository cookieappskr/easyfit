import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { deleteCategoryWithDescendants } from '../queries'
import { categoriesKeys } from '../constants'

/**
 * 카테고리 삭제 Hook (선택 항목 + 모든 하위 항목)
 *
 * @returns TanStack Query의 useMutation 결과
 */
export const useDeleteCategory = () => {
  const client = useSupabaseClient()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: number) =>
      deleteCategoryWithDescendants(client, categoryId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: categoriesKeys.tree(),
      })
    },
  })
}
