import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { usersKeys } from '../constants'

/**
 * 현재 로그인한 사용자 ID 조회 Hook
 * 
 * @returns TanStack Query의 useQuery 결과
 * 
 * @example
 * ```tsx
 * const { data: userId, isLoading, error } = useLoggedInUserId()
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 * if (!userId) return <LoginRequired />
 * 
 * return <Dashboard userId={userId} />
 * ```
 */
export const useLoggedInUserId = () => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: [...usersKeys.all, 'logged-in-user-id'] as const,
    queryFn: async () => {
      const { data, error } = await client.auth.getUser()
      if (error || !data.user) {
        throw new Error('로그인이 필요합니다.')
      }
      return data.user.id
    },
    staleTime: 1000 * 60 * 10, // 10분
    retry: false, // 인증 실패 시 재시도 안 함
  })
}
