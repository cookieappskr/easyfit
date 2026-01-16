import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { getUserByNickname } from '../queries'
import { usersKeys } from '../constants'

/**
 * 사용자 조회 Hook (닉네임으로 조회)
 * 
 * @param nickname - 사용자 닉네임
 * @returns TanStack Query의 useQuery 결과
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useUserByNickname('john_doe')
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 * if (!user) return <NotFound />
 * 
 * return <UserProfile user={user} />
 * ```
 */
export const useUserByNickname = (nickname: string | null) => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: usersKeys.byNickname(nickname || ''),
    queryFn: () => {
      if (!nickname) return null
      return getUserByNickname(client, nickname)
    },
    enabled: !!nickname,
    staleTime: 1000 * 60 * 5, // 5분
  })
}
