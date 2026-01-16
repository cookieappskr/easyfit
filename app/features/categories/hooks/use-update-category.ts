import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { updateCategory, type Category } from '../queries'
import { categoriesKeys } from '../constants'

interface UpdateCategoryParams {
  id: number
  updates: Partial<Omit<Category, 'id' | 'created_at' | 'updated_at'>>
}

/**
 * 카테고리 수정 Hook
 * 
 * @returns TanStack Query의 useMutation 결과
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdateCategory()
 * 
 * const handleUpdate = (id: number, updates: Partial<Category>) => {
 *   mutate({ id, updates }, {
 *     onSuccess: (updatedCategory) => {
 *       console.log('수정 완료:', updatedCategory)
 *     },
 *     onError: (error) => {
 *       console.error('수정 실패:', error)
 *     }
 *   })
 * }
 * ```
 */
export const useUpdateCategory = () => {
  const client = useSupabaseClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: UpdateCategoryParams) => 
      updateCategory(client, id, updates),
    
    onSuccess: (data, variables) => {
      // 해당 카테고리의 상세 쿼리 invalidate
      queryClient.invalidateQueries({ 
        queryKey: categoriesKeys.detail(variables.id) 
      })
      
      // 카테고리 트리도 invalidate하여 최신 데이터 반영
      queryClient.invalidateQueries({ 
        queryKey: categoriesKeys.tree() 
      })
    },
  })
}
