-- MERRYHERE Storage 정책 설정
-- Storage 버킷에 대한 RLS 정책
-- Created: 2025-10-26

-- ============================================================================
-- AVATARS BUCKET POLICIES (프로필 이미지)
-- ============================================================================

-- 인증된 사용자만 자신의 프로필 이미지 업로드 가능
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 모든 사용자가 아바타 이미지 조회 가능 (공개)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 사용자가 자신의 아바타 업데이트 가능
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자가 자신의 아바타 삭제 가능
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- BUSINESS-DOCUMENTS BUCKET POLICIES (사업자 서류)
-- ============================================================================

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload business documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-documents' AND
  auth.uid() IS NOT NULL
);

-- 사용자가 자신의 서류만 조회 가능
CREATE POLICY "Users can view own business documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'business-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 관리자는 모든 서류 조회 가능
CREATE POLICY "Admins can view all business documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'business-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 사용자가 자신의 서류 업데이트 가능
CREATE POLICY "Users can update own business documents"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'business-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자가 자신의 서류 삭제 가능
CREATE POLICY "Users can delete own business documents"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'business-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- COMPANY-LOGOS BUCKET POLICIES (회사 로고)
-- ============================================================================

-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' AND
  auth.uid() IS NOT NULL
);

-- 모든 사용자가 회사 로고 조회 가능 (공개)
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- 사용자가 자신의 로고 업데이트 가능
CREATE POLICY "Users can update own company logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 사용자가 자신의 로고 삭제 가능
CREATE POLICY "Users can delete own company logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- 완료 메시지
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Storage 정책 설정 완료!';
  RAISE NOTICE '   - avatars: 프로필 이미지 정책 (공개 읽기)';
  RAISE NOTICE '   - business-documents: 사업자 서류 정책 (본인만 읽기)';
  RAISE NOTICE '   - company-logos: 회사 로고 정책 (공개 읽기)';
END $$;
