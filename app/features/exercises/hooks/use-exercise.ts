import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { getExerciseById } from '../queries'
import { exercisesKeys } from '../constants'

/**
 * 운동 상세 조회 Hook
 * 
 * @param id - 운동 ID
 * @returns TanStack Query의 useQuery 결과
 * 
 * @example
 * ```tsx
 * const { data: exercise, isLoading, error } = useExercise(1)
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 * if (!exercise) return <NotFound />
 * 
 * return <ExerciseDetail exercise={exercise} />
 * ```
 */
export const useExercise = (id: number | null) => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: exercisesKeys.detail(id || 0),
    queryFn: () => {
      if (!id) return null
      return getExerciseById(client, id)
    },
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 5, // 5분
  })
}
