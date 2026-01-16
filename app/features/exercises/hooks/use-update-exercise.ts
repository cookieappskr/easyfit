import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { updateExercise, type ExercisePayload } from '../queries'
import { exercisesKeys } from '../constants'

interface UpdateExerciseParams {
  id: number
  updates: Partial<ExercisePayload>
}

/**
 * 운동 수정 Hook
 * 
 * @returns TanStack Query의 useMutation 결과
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useUpdateExercise()
 * 
 * const handleUpdate = (id: number, updates: Partial<ExercisePayload>) => {
 *   mutate({ id, updates }, {
 *     onSuccess: (updatedExercise) => {
 *       console.log('수정 완료:', updatedExercise)
 *     },
 *     onError: (error) => {
 *       console.error('수정 실패:', error)
 *     }
 *   })
 * }
 * ```
 */
export const useUpdateExercise = () => {
  const client = useSupabaseClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: UpdateExerciseParams) => 
      updateExercise(client, id, updates),
    
    onSuccess: (data, variables) => {
      // 해당 운동의 상세 쿼리 invalidate
      queryClient.invalidateQueries({ 
        queryKey: exercisesKeys.detail(variables.id) 
      })
      
      // 목록 쿼리도 invalidate하여 최신 데이터 반영
      queryClient.invalidateQueries({ 
        queryKey: exercisesKeys.lists() 
      })
    },
  })
}
