-- ============================================================
-- categories 테이블 RLS 정책 (admin 전용)
-- ============================================================
-- Supabase Dashboard > SQL Editor에서 이 스크립트를 실행하세요.
-- profiles.role = 'admin' 인 사용자만 categories CRUD 가능
-- ============================================================
-- 참고: profiles 테이블에 role 컬럼이 있어야 합니다.
--       없으면 먼저 실행: ALTER TABLE profiles ADD COLUMN role text DEFAULT 'user';
-- ============================================================

-- RLS 활성화 확인 (이미 활성화되어 있을 수 있음)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 기존 정책 제거
DROP POLICY IF EXISTS "Allow authenticated users to manage categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin to manage categories" ON public.categories;

-- admin 역할 사용자만 SELECT, INSERT, UPDATE, DELETE 허용
CREATE POLICY "Allow admin to manage categories"
ON public.categories
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
