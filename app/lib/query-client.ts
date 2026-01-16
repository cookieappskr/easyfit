import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query 클라이언트 설정
 * - 전역 캐싱 및 리페칭 전략 정의
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 데이터가 stale 상태로 간주되는 시간 (5분)
      staleTime: 1000 * 60 * 5,
      
      // 캐시에 데이터가 유지되는 시간 (30분)
      gcTime: 1000 * 60 * 30,
      
      // 윈도우 포커스 시 자동 리페칭 비활성화
      refetchOnWindowFocus: false,
      
      // 네트워크 재연결 시 자동 리페칭 활성화
      refetchOnReconnect: true,
      
      // 실패 시 재시도 횟수
      retry: 1,
      
      // 재시도 지연 시간 (exponential backoff)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // mutation 실패 시 재시도 안 함
      retry: 0,
    },
  },
})

/**
 * Query Keys Factory
 * - 일관된 query key 패턴을 위한 유틸리티
 */
export const createQueryKeys = <T extends string>(feature: T) => ({
  all: [feature] as const,
  lists: () => [...createQueryKeys(feature).all, 'list'] as const,
  list: (filters?: unknown) => 
    [...createQueryKeys(feature).lists(), filters] as const,
  details: () => [...createQueryKeys(feature).all, 'detail'] as const,
  detail: (id: string | number) => 
    [...createQueryKeys(feature).details(), id] as const,
})
