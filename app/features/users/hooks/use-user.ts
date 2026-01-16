import { useQuery } from '@tanstack/react-query'
import { useSupabaseClient } from '~/hooks/use-supabase-client'
import { getUserById } from '../queries'
import { usersKeys } from '../constants'

/**
 * 사용자 상세 조회 Hook (ID로 조회)
 * 
 * @param id - 사용자 ID
 * @returns TanStack Query의 useQuery 결과
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useUser('user-id-123')
 * 
 * if (isLoading) return <Skeleton />
 * if (error) return <ErrorMessage />
 * if (!user) return <NotFound />
 * 
 * return <UserProfile user={user} />
 * ```
 */
export const useUser = (id: string | null) => {
  const client = useSupabaseClient()
  
  return useQuery({
    queryKey: usersKeys.detail(id || ''),
    queryFn: () => {
      if (!id) return null
      return getUserById(client, id)
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5분
  })
}
