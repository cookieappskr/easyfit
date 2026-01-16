import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'

export interface CategoryOption {
  value: string
  label: string
  displayOrder: number
}

/**
 * 운동 카테고리 조회 Hook
 * 
 * categories 테이블에서 특정 code의 카테고리들을 가져옵니다.
 * 
 * @param categoryCode - 카테고리 코드 (EXERCISE_TYPE, MECHANIC_TYPE)
 */
const fetchCategoriesByCode = async (
  client: any,
  categoryCode: string
): Promise<CategoryOption[]> => {
  try {
    console.log(`[${categoryCode}] 카테고리 조회 시작...`)
    
    // 1. 부모 카테고리 찾기 (code가 categoryCode인 것)
    const { data: parentCategory, error: parentError } = await client
      .from('categories')
      .select('id, code, name')
      .eq('code', categoryCode)
      .maybeSingle()

    console.log(`[${categoryCode}] 부모 카테고리:`, parentCategory, parentError)

    if (parentError) {
      console.error(`[${categoryCode}] 부모 카테고리 조회 실패:`, parentError)
      throw new Error(parentError.message)
    }

    if (!parentCategory) {
      console.warn(`[${categoryCode}] 카테고리 코드를 찾을 수 없습니다.`)
      return []
    }

    // 2. 자식 카테고리들 조회
    const { data: childCategories, error: childError } = await client
      .from('categories')
      .select('code, name, display_order, is_active')
      .eq('parent_id', parentCategory.id)
      .order('display_order', { ascending: true })

    console.log(`[${categoryCode}] 자식 카테고리들:`, childCategories, childError)

    if (childError) {
      console.error(`[${categoryCode}] 자식 카테고리 조회 실패:`, childError)
      throw new Error(childError.message)
    }

    // is_active가 true인 것만 필터링
    const activeCategories = (childCategories || []).filter((cat: any) => cat.is_active)
    
    const options = activeCategories.map((cat: any) => ({
      value: cat.code,
      label: cat.name,
      displayOrder: cat.display_order || 0,
    }))

    console.log(`[${categoryCode}] 최종 옵션:`, options)
    
    return options
  } catch (error) {
    console.error(`[${categoryCode}] 전체 에러:`, error)
    throw error
  }
}

/**
 * 운동 부위 옵션 조회 Hook
 */
export const useExerciseTypeOptions = () => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: ['categories', 'EXERCISE_TYPE'] as const,
    queryFn: () => fetchCategoriesByCode(client, 'EXERCISE_TYPE'),
    staleTime: 1000 * 60 * 30, // 30분 (카테고리는 자주 변경되지 않음)
    retry: 1, // 실패 시 1번만 재시도
  })
}

/**
 * 운동 유형 옵션 조회 Hook
 */
export const useMechanicTypeOptions = () => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: ['categories', 'MECHANIC_TYPE'] as const,
    queryFn: () => fetchCategoriesByCode(client, 'MECHANIC_TYPE'),
    staleTime: 1000 * 60 * 30, // 30분
    retry: 1, // 실패 시 1번만 재시도
  })
}
