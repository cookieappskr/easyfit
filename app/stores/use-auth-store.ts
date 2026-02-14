import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

/**
 * 프로필 타입 정의
 */
export interface Profile {
  id: string
  nickname: string
  avatar?: string | null
  role: string
}

/**
 * 인증 상태 인터페이스
 */
interface AuthState {
  // 상태
  user: User | null
  profile: Profile | null
  
  // 계산된 상태
  isAuthenticated: boolean
  isAdmin: boolean
  
  // 액션
  setAuth: (user: User | null, profile: Profile | null) => void
  clearAuth: () => void
  updateProfile: (profile: Partial<Profile>) => void
}

/**
 * 인증 상태 관리 Store
 * 
 * Zustand를 사용한 전역 인증 상태 관리
 * - 사용자 정보 및 프로필 관리
 * - 인증 상태 확인
 * - 권한 체크 (admin)
 * 
 * @example
 * ```tsx
 * const { user, profile, isAuthenticated, isAdmin } = useAuthStore()
 * 
 * // 로그인 시
 * setAuth(user, profile)
 * 
 * // 로그아웃 시
 * clearAuth()
 * ```
 */
export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태
        user: null,
        profile: null,
        isAuthenticated: false,
        isAdmin: false,

        // 인증 정보 설정
        setAuth: (user, profile) => {
          set({
            user,
            profile,
            isAuthenticated: !!user,
            isAdmin: !!user && profile?.role === 'admin',
          }, false, 'setAuth')
        },

        // 인증 정보 초기화
        clearAuth: () => {
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            isAdmin: false,
          }, false, 'clearAuth')
        },

        // 프로필 업데이트
        updateProfile: (profileUpdate) => {
          const currentProfile = get().profile
          if (!currentProfile) return

          const updatedProfile = { ...currentProfile, ...profileUpdate }
          set({
            profile: updatedProfile,
            isAdmin: updatedProfile.role === 'admin',
          }, false, 'updateProfile')
        },
      }),
      {
        name: 'auth-storage',
        // 민감한 정보는 저장하지 않도록 선택적으로 저장
        partialize: (state) => ({
          user: state.user,
          profile: state.profile,
        }),
      }
    ),
    {
      name: 'AuthStore',
      enabled: import.meta.env.DEV,
    }
  )
)

/**
 * 인증 상태 초기화 유틸리티
 * root loader에서 사용
 */
export const initializeAuth = (user: User | null, profile: Profile | null) => {
  useAuthStore.getState().setAuth(user, profile)
}

/**
 * 인증 셀렉터 (성능 최적화)
 */
export const useAuthUser = () => useAuthStore((state) => state.user)
export const useAuthProfile = () => useAuthStore((state) => state.profile)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useIsAdmin = () => useAuthStore((state) => state.isAdmin)
