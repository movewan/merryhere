-- MERRYHERE Storage Buckets 생성
-- Storage 버킷 생성 (정책 적용 전 실행 필요)
-- Created: 2025-10-26

-- ============================================================================
-- STORAGE BUCKETS 생성
-- ============================================================================

-- avatars 버킷 (프로필 이미지)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- 공개 버킷
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- business-documents 버킷 (사업자 서류)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-documents',
  'business-documents',
  false,  -- 비공개 버킷 (RLS로 제어)
  10485760,  -- 10MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- company-logos 버킷 (회사 로고)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logos',
  'company-logos',
  true,  -- 공개 버킷
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 완료 메시지
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage 버킷 생성 완료!';
  RAISE NOTICE '   - avatars: 프로필 이미지 (공개, 5MB, image/*)';
  RAISE NOTICE '   - business-documents: 사업자 서류 (비공개, 10MB, image/*, pdf)';
  RAISE NOTICE '   - company-logos: 회사 로고 (공개, 5MB, image/*)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  다음으로 20251026_storage_policies.sql 실행이 필요합니다.';
END $$;
