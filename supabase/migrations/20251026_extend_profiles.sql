-- MERRYHERE 프로필 스키마 확장
-- 회원가입 요구사항 반영
-- Created: 2025-10-26

-- ============================================================================
-- CREATE ENUM TYPES FOR NEW FIELDS
-- ============================================================================

-- 가입 목적 (일반회원 vs 입주회원)
CREATE TYPE user_type_enum AS ENUM ('general', 'tenant');

-- 사업자 유형
CREATE TYPE business_type_enum AS ENUM (
  'corporation',      -- 법인사업자
  'individual',       -- 개인사업자
  'freelancer',       -- 개인(프리랜서)
  'nonprofit'         -- 비영리/단체
);

-- 직무 유형
CREATE TYPE job_type_enum AS ENUM (
  'development',      -- 개발
  'design',           -- 디자인
  'sales',            -- 영업
  'marketing',        -- 마케팅
  'branding',         -- 브랜딩
  'pr',               -- 홍보
  'production',       -- 생산/제조
  'planning',         -- 기획
  'operation',        -- 운영
  'education',        -- 강의/교육
  'research',         -- 연구/리서치
  'hr',               -- 인사
  'strategy'          -- 전략/경영
);

-- ============================================================================
-- ALTER PROFILES TABLE - ADD NEW COLUMNS
-- ============================================================================

ALTER TABLE profiles
  -- 가입 목적
  ADD COLUMN user_type user_type_enum DEFAULT 'general',

  -- 회사 정보
  ADD COLUMN company_name TEXT,
  ADD COLUMN ceo_name TEXT,
  ADD COLUMN business_type business_type_enum,
  ADD COLUMN business_start_date DATE,

  -- 직무 (다중 선택 가능)
  ADD COLUMN job_types job_type_enum[],

  -- 파일 URL
  ADD COLUMN business_registration_url TEXT,  -- 사업자등록증
  ADD COLUMN business_account_url TEXT,       -- 사업자통장
  ADD COLUMN company_logo_url TEXT;           -- 회사 로고

-- ============================================================================
-- ADD CONSTRAINTS
-- ============================================================================

-- 입주회원의 경우 필수 필드 검증 (애플리케이션 레벨에서 처리)
-- 여기서는 데이터 무결성만 보장

-- 사업자등록번호는 10자리 (선택사항)
ALTER TABLE profiles
  ADD COLUMN business_registration_number TEXT
  CHECK (business_registration_number IS NULL OR
         business_registration_number ~ '^\d{10}$');

-- ============================================================================
-- CREATE INDICES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_company_name ON profiles(company_name);
CREATE INDEX idx_profiles_business_type ON profiles(business_type);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN profiles.user_type IS '가입 목적: general(일반회원), tenant(입주회원)';
COMMENT ON COLUMN profiles.company_name IS '회사명 (입주회원 필수)';
COMMENT ON COLUMN profiles.ceo_name IS '대표자명 (입주회원 필수)';
COMMENT ON COLUMN profiles.business_type IS '사업자 유형: corporation(법인), individual(개인), freelancer(프리랜서), nonprofit(비영리)';
COMMENT ON COLUMN profiles.business_start_date IS '개업연월일';
COMMENT ON COLUMN profiles.job_types IS '직무 (다중 선택 가능)';
COMMENT ON COLUMN profiles.business_registration_url IS '사업자등록증 파일 URL (입주회원 필수)';
COMMENT ON COLUMN profiles.business_account_url IS '사업자통장 파일 URL (입주회원 필수)';
COMMENT ON COLUMN profiles.company_logo_url IS '회사 로고 파일 URL (입주회원 필수)';
COMMENT ON COLUMN profiles.business_registration_number IS '사업자등록번호 (10자리)';

-- ============================================================================
-- UPDATE RLS POLICIES IF NEEDED
-- ============================================================================

-- 기존 RLS 정책은 그대로 유지
-- 새로운 컬럼들도 동일한 정책 적용됨

-- ============================================================================
-- HELPER FUNCTION: 입주회원 필수 필드 검증
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_tenant_required_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- 입주회원인 경우 필수 필드 검증
  IF NEW.user_type = 'tenant' THEN
    IF NEW.company_name IS NULL THEN
      RAISE EXCEPTION '입주회원은 회사명이 필수입니다';
    END IF;

    IF NEW.ceo_name IS NULL THEN
      RAISE EXCEPTION '입주회원은 대표자명이 필수입니다';
    END IF;

    IF NEW.phone IS NULL THEN
      RAISE EXCEPTION '입주회원은 연락처가 필수입니다';
    END IF;

    IF NEW.business_type IS NULL THEN
      RAISE EXCEPTION '입주회원은 사업자유형이 필수입니다';
    END IF;

    IF NEW.business_registration_url IS NULL THEN
      RAISE EXCEPTION '입주회원은 사업자등록증 파일이 필수입니다';
    END IF;

    IF NEW.business_account_url IS NULL THEN
      RAISE EXCEPTION '입주회원은 사업자통장 파일이 필수입니다';
    END IF;

    IF NEW.company_logo_url IS NULL THEN
      RAISE EXCEPTION '입주회원은 회사 로고 파일이 필수입니다';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (INSERT 및 UPDATE 시 검증)
CREATE TRIGGER validate_tenant_fields_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION validate_tenant_required_fields();

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

/*
이 마이그레이션을 실행한 후:

1. Storage 버킷 생성 필요:
   - business-documents (사업자등록증, 사업자통장용)
   - company-logos (회사 로고용)
   - avatars (프로필 사진용 - 이미 있을 수 있음)

2. Storage 정책 설정:
   - 인증된 사용자만 파일 업로드 가능
   - 파일은 공개 읽기 가능 (회사 로고 등)

3. 애플리케이션 코드 업데이트:
   - 회원가입 폼에 새 필드 추가
   - 파일 업로드 기능 구현
   - 조건부 필수 입력 처리 (일반회원 vs 입주회원)

4. 기존 사용자 데이터:
   - user_type은 기본값 'general'로 설정됨
   - 필요시 수동으로 'tenant'로 변경
*/
