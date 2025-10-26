-- 회의실 테이블에 오피스 임대료 필드 추가
-- 공실 임대료 계산을 위한 필드
-- Created: 2025-10-27

-- office_type 필드 추가 (오피스만 해당)
ALTER TABLE meeting_rooms
ADD COLUMN IF NOT EXISTS office_type TEXT CHECK (office_type IN ('1인실', '2인실', '4인실', '6인실', '8인실', '10인실+', NULL));

-- base_rent 필드 추가 (기본 월 임대료)
ALTER TABLE meeting_rooms
ADD COLUMN IF NOT EXISTS base_rent INTEGER DEFAULT 0 CHECK (base_rent >= 0);

-- 오피스 여부 확인 컬럼 추가
ALTER TABLE meeting_rooms
ADD COLUMN IF NOT EXISTS is_office BOOLEAN DEFAULT false;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_meeting_rooms_is_office ON meeting_rooms(is_office) WHERE is_office = true;

COMMENT ON COLUMN meeting_rooms.office_type IS '오피스 타입 - 1인실, 2인실, 4인실 등 (오피스만 해당)';
COMMENT ON COLUMN meeting_rooms.base_rent IS '기본 월 임대료 - 공실 시 잠재 매출 계산용';
COMMENT ON COLUMN meeting_rooms.is_office IS '오피스 공간 여부 - true면 임대 가능한 오피스';

DO $$
BEGIN
  RAISE NOTICE '✅ meeting_rooms 테이블 필드 추가 완료!';
  RAISE NOTICE '   - office_type: 오피스 타입 (1인실, 2인실, 4인실 등)';
  RAISE NOTICE '   - base_rent: 기본 월 임대료';
  RAISE NOTICE '   - is_office: 오피스 공간 여부';
  RAISE NOTICE '';
  RAISE NOTICE '💡 오피스 등록 시 is_office=true, office_type, base_rent를 설정하세요.';
END $$;
