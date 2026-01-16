import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ExerciseListParams } from '~/features/exercises/queries'

/**
 * 운동 필터 상태 인터페이스
 */
interface ExercisesFilterState extends ExerciseListParams {
  // 액션
  setFilter: (filter: Partial<ExerciseListParams>) => void
  setPage: (page: number) => void
  setExerciseType: (exerciseType: string) => void
  setSearchName: (searchName: string) => void
  setSort: (sort: string) => void
  resetFilters: () => void
}

/**
 * 기본 필터 값
 */
const DEFAULT_FILTERS: ExerciseListParams = {
  page: 1,
  pageSize: 20,
  exerciseType: undefined,
  searchName: undefined,
  sort: 'created_desc',
}

/**
 * 운동 필터 상태 관리 Store
 * 
 * Zustand를 사용한 운동 목록 필터 상태 관리
 * - 페이지네이션, 필터링, 정렬 상태
 * - URL 쿼리 파라미터와 동기화 가능
 * 
 * @example
 * ```tsx
 * const filters = useExercisesFilterStore()
 * const { data } = useExercises(filters)
 * 
 * // 필터 변경
 * filters.setExerciseType('upper_body')
 * filters.setPage(2)
 * 
 * // 필터 초기화
 * filters.resetFilters()
 * ```
 */
export const useExercisesFilterStore = create<ExercisesFilterState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        ...DEFAULT_FILTERS,

        // 필터 일괄 설정
        setFilter: (filter) => {
          set(
            (state) => ({
              ...state,
              ...filter,
              // 필터 변경 시 페이지는 1로 리셋 (페이지 직접 변경 제외)
              page: filter.page ?? 1,
            }),
            false,
            'setFilter'
          )
        },

        // 페이지 변경
        setPage: (page) => {
          set({ page }, false, 'setPage')
        },

        // 운동 타입 필터 변경
        setExerciseType: (exerciseType) => {
          set(
            {
              exerciseType: exerciseType || undefined,
              page: 1, // 필터 변경 시 첫 페이지로
            },
            false,
            'setExerciseType'
          )
        },

        // 검색어 변경
        setSearchName: (searchName) => {
          set(
            {
              searchName: searchName || undefined,
              page: 1, // 검색 시 첫 페이지로
            },
            false,
            'setSearchName'
          )
        },

        // 정렬 변경
        setSort: (sort) => {
          set({ sort }, false, 'setSort')
        },

        // 필터 초기화
        resetFilters: () => {
          set(DEFAULT_FILTERS, false, 'resetFilters')
        },
      }),
      {
        name: 'exercises-filter-storage',
        // 일부 상태만 persist (pageSize, sort는 유지)
        partialize: (state) => ({
          pageSize: state.pageSize,
          sort: state.sort,
        }),
      }
    ),
    {
      name: 'ExercisesFilterStore',
      enabled: import.meta.env.DEV,
    }
  )
)

/**
 * 필터 셀렉터 (성능 최적화)
 */
export const useExercisesPage = () => 
  useExercisesFilterStore((state) => state.page)

export const useExercisesPageSize = () => 
  useExercisesFilterStore((state) => state.pageSize)

export const useExercisesType = () => 
  useExercisesFilterStore((state) => state.exerciseType)

export const useExercisesSearchName = () => 
  useExercisesFilterStore((state) => state.searchName)

export const useExercisesSort = () => 
  useExercisesFilterStore((state) => state.sort)
