/**
 * TanStack Query Keys for Users
 * 일관된 query key 패턴을 위한 팩토리 함수
 */
export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  byNickname: (nickname: string) => [...usersKeys.all, 'nickname', nickname] as const,
}
