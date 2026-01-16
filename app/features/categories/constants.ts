// 콘텐츠 제약조건 설정부
export const CONTENT_CONSTRAINTS = {
  name: {
    min: 1,
    max: 50,
  },
  description: {
    min: 1,
    max: 200,
  },
};

/**
 * TanStack Query Keys for Categories
 * 일관된 query key 패턴을 위한 팩토리 함수
 */
export const categoriesKeys = {
  all: ['categories'] as const,
  tree: () => [...categoriesKeys.all, 'tree'] as const,
  detail: (id: number) => [...categoriesKeys.all, 'detail', id] as const,
}
