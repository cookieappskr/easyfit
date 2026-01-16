import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { getCategoryById } from '../queries'
import { categoriesKeys } from '../constants'

/**
 * 카테고리 상세 조회 Hook
 * 
 * @param id - 카테고리 ID
 * @returns TanStack Query의 useQuery 결과
 * 
 * @example
 * ```tsx
 * const { data: category, isLoading, error } = useCategory(1)
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 * if (!category) return <NotFound />
 * 
 * return <CategoryDetail category={category} />
 * ```
 */
export const useCategory = (id: number | null) => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: categoriesKeys.detail(id || 0),
    queryFn: () => {
      if (!id) return null
      return getCategoryById(client, id)
    },
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 10, // 10분
  })
}
