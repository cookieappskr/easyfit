import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { deleteExercise } from '../queries'
import { exercisesKeys } from '../constants'

/**
 * 운동 삭제 Hook
 * 
 * @returns TanStack Query의 useMutation 결과
 * 
 * @example
 * ```tsx
 * const { mutate, isPending } = useDeleteExercise()
 * 
 * const handleDelete = (id: number) => {
 *   if (!confirm('정말 삭제하시겠습니까?')) return
 *   
 *   mutate(id, {
 *     onSuccess: () => {
 *       console.log('삭제 완료')
 *       navigate('/exercises')
 *     },
 *     onError: (error) => {
 *       console.error('삭제 실패:', error)
 *     }
 *   })
 * }
 * 
 * return (
 *   <button onClick={() => handleDelete(exerciseId)} disabled={isPending}>
 *     {isPending ? '삭제 중...' : '삭제'}
 *   </button>
 * )
 * ```
 */
export const useDeleteExercise = () => {
  const client = useSupabaseClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: number) => deleteExercise(client, id),
    
    onSuccess: (_, deletedId) => {
      // 삭제된 운동의 상세 쿼리 제거
      queryClient.removeQueries({ 
        queryKey: exercisesKeys.detail(deletedId) 
      })
      
      // 목록 쿼리 invalidate하여 최신 데이터 반영
      queryClient.invalidateQueries({ 
        queryKey: exercisesKeys.lists() 
      })
    },
  })
}
