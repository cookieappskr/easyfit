import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { createCategory, type Category } from '../queries'
import { categoriesKeys } from '../constants'

type CreateCategoryPayload = Omit<Category, 'id' | 'created_at' | 'updated_at'>

/**
 * 카테고리 생성 Hook
 * 
 * @returns TanStack Query의 useMutation 결과
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateCategory()
 * 
 * const handleSubmit = (data: CreateCategoryPayload) => {
 *   mutate(data, {
 *     onSuccess: (newCategory) => {
 *       console.log('생성 완료:', newCategory)
 *     },
 *     onError: (error) => {
 *       console.error('생성 실패:', error)
 *     }
 *   })
 * }
 * ```
 */
export const useCreateCategory = () => {
  const client = useSupabaseClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => 
      createCategory(client, payload),
    
    onSuccess: () => {
      // 카테고리 트리 쿼리를 invalidate하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ 
        queryKey: categoriesKeys.tree() 
      })
    },
  })
}
