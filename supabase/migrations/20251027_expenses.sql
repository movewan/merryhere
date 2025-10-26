-- 지출 관리 테이블 생성
-- MERRY HERE 재무 관리 시스템
-- Created: 2025-10-27

CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 기간 정보
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),

  -- 지출 정보
  category TEXT NOT NULL CHECK (category IN ('rent', 'management', 'supplies', 'utilities', 'maintenance', 'other')),
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),

  -- 메타데이터
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_expenses_year_month ON expenses(year, month);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);

-- RLS 활성화
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- 관리자만 모든 작업 가능
CREATE POLICY "관리자만 지출 관리 가능" ON expenses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_expenses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_expenses_updated_at();

-- 카테고리별 설명
COMMENT ON TABLE expenses IS '지출 관리 테이블 - 임대료, 관리비, 소모품 등';
COMMENT ON COLUMN expenses.category IS 'rent(임대료), management(관리비), supplies(소모품), utilities(공과금), maintenance(유지보수), other(기타)';

DO $$
BEGIN
  RAISE NOTICE '✅ expenses 테이블 생성 완료!';
  RAISE NOTICE '   - 월별 지출 항목 관리';
  RAISE NOTICE '   - 카테고리: 임대료, 관리비, 소모품, 공과금, 유지보수, 기타';
  RAISE NOTICE '   - 관리자만 접근 가능';
END $$;
