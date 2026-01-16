import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { createExercise, type ExercisePayload } from '../queries'
import { exercisesKeys } from '../constants'

/**
 * 운동 생성 Hook
 * 
 * @returns TanStack Query의 useMutation 결과
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useCreateExercise()
 * 
 * const handleSubmit = (data: ExercisePayload) => {
 *   mutate(data, {
 *     onSuccess: (newExercise) => {
 *       console.log('생성 완료:', newExercise)
 *       navigate(`/exercises/${newExercise.id}`)
 *     },
 *     onError: (error) => {
 *       console.error('생성 실패:', error)
 *     }
 *   })
 * }
 * 
 * return (
 *   <button onClick={() => handleSubmit(formData)} disabled={isPending}>
 *     {isPending ? '저장 중...' : '저장'}
 *   </button>
 * )
 * ```
 */
export const useCreateExercise = () => {
  const client = useSupabaseClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (payload: ExercisePayload) => createExercise(client, payload),
    
    onSuccess: () => {
      // 목록 쿼리를 invalidate하여 최신 데이터 다시 가져오기
      queryClient.invalidateQueries({ 
        queryKey: exercisesKeys.lists() 
      })
    },
  })
}
