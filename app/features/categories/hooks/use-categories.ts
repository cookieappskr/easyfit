import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { getAllCategories } from '../queries'
import { categoriesKeys } from '../constants'

/**
 * 카테고리 트리 조회 Hook
 * 
 * 모든 카테고리를 계층 구조(트리)로 가져옵니다.
 * 
 * @returns TanStack Query의 useQuery 결과
 * 
 * @example
 * ```tsx
 * const { data: categories, isLoading, error } = useCategories()
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 * 
 * return <CategoryTree categories={categories} />
 * ```
 */
export const useCategories = () => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: categoriesKeys.tree(),
    queryFn: () => getAllCategories(client),
    staleTime: 1000 * 60 * 10, // 10분 (카테고리는 자주 변경되지 않음)
  })
}
