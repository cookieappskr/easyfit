-- ============================================================
-- categories 테이블 부가속성 컬럼 변경
-- ============================================================
-- Supabase Dashboard > SQL Editor에서 이 스크립트를 실행하세요.
--
-- 변경 사항:
--   부가속성1 -> value
--   부가속성2 -> description (기존 description에 병합 후 additional_attribute2 삭제)
--   부가속성3 -> 부가속성1
--   부가속성4 -> 부가속성2
--   부가속성5 -> 부가속성3
-- ============================================================

-- 1. additional_attribute1 -> value
ALTER TABLE public.categories RENAME COLUMN additional_attribute1 TO value;

-- 2. additional_attribute2 -> description (데이터 병합 후 컬럼 삭제)
UPDATE public.categories
SET description = COALESCE(additional_attribute2, description)
WHERE additional_attribute2 IS NOT NULL;
ALTER TABLE public.categories DROP COLUMN additional_attribute2;

-- 3. additional_attribute3/4/5 -> additional_attribute1/2/3 (임시명 사용해 순서대로 변경)
ALTER TABLE public.categories RENAME COLUMN additional_attribute5 TO _attr_tmp3;
ALTER TABLE public.categories RENAME COLUMN additional_attribute4 TO _attr_tmp2;
ALTER TABLE public.categories RENAME COLUMN additional_attribute3 TO additional_attribute1;
ALTER TABLE public.categories RENAME COLUMN _attr_tmp2 TO additional_attribute2;
ALTER TABLE public.categories RENAME COLUMN _attr_tmp3 TO additional_attribute3;
