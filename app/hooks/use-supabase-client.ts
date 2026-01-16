import { browserClient } from '~/supa-client'

/**
 * Supabase 클라이언트 Hook
 * 
 * 클라이언트 사이드에서 Supabase를 사용하기 위한 hook
 * TanStack Query와 함께 사용하여 데이터를 가져옵니다.
 * 
 * @example
 * ```tsx
 * const client = useSupabaseClient()
 * const { data } = useQuery({
 *   queryKey: ['exercises'],
 *   queryFn: () => getExercises(client, params)
 * })
 * ```
 */
export const useSupabaseClient = () => {
  return browserClient
}
