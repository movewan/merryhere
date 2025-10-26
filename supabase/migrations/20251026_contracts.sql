-- 계약 관리 테이블 생성
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- 기본 정보
  company_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,

  -- 공간 정보
  space_type TEXT NOT NULL CHECK (space_type IN ('office', 'fixed_desk', 'flexible_desk', 'non_resident')),
  room_number TEXT,

  -- 인원 정보
  base_capacity INTEGER,
  max_capacity INTEGER,
  current_capacity INTEGER,

  -- 계약 정보
  contract_status TEXT NOT NULL DEFAULT 'active' CHECK (contract_status IN ('active', 'pending', 'expired', 'terminated')),
  contract_type TEXT CHECK (contract_type IN ('법인', '개인')),

  -- 계약 기간
  start_date DATE NOT NULL,
  end_date DATE,
  contract_duration TEXT, -- "24개월" 등

  -- 비용 정보 (모두 VAT 포함)
  monthly_fee INTEGER NOT NULL DEFAULT 0,
  management_fee INTEGER NOT NULL DEFAULT 0,
  total_monthly_cost INTEGER NOT NULL DEFAULT 0,
  deposit INTEGER NOT NULL DEFAULT 0,

  -- 비상주 오피스 매출
  non_resident_revenue INTEGER DEFAULT 0,

  -- 할인율
  discount_rate INTEGER DEFAULT 0, -- 퍼센트 단위

  -- 결제 정보
  cms_enabled BOOLEAN DEFAULT FALSE,
  auto_transfer_enabled BOOLEAN DEFAULT FALSE,

  -- 사업자 정보
  business_number TEXT,

  -- 담당자 정보
  contact_person TEXT,
  contact_phone TEXT,
  contact_email TEXT,

  -- 추가 담당자 정보
  additional_contacts JSONB, -- [{name, phone, email, position}]

  -- 비고
  notes TEXT,
  special_notes TEXT, -- 청구 특이사항 등

  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_contracts_company_id ON contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(contract_status);
CREATE INDEX IF NOT EXISTS idx_contracts_start_date ON contracts(start_date);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);

-- RLS 활성화
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 계약 조회/수정 가능
CREATE POLICY "관리자는 모든 계약 관리 가능" ON contracts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 입주 회원의 대표자와 매니저는 자신의 계약 조회 가능
CREATE POLICY "입주 회원 대표자/매니저는 자신의 계약 조회 가능" ON contracts
  FOR SELECT
  TO authenticated
  USING (
    company_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_name = contracts.company_name
      AND (profiles.role = 'tenant_leader' OR profiles.role = 'tenant_manager')
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_contracts_updated_at();

-- 계약 상태 변경 히스토리 테이블
CREATE TABLE IF NOT EXISTS contract_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id),
  change_type TEXT NOT NULL, -- 'status_change', 'renewal', 'termination', 'cost_update' 등
  previous_value JSONB,
  new_value JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_history_contract_id ON contract_history(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_history_created_at ON contract_history(created_at);

-- RLS 활성화
ALTER TABLE contract_history ENABLE ROW LEVEL SECURITY;

-- 관리자만 히스토리 조회 가능
CREATE POLICY "관리자만 계약 히스토리 조회 가능" ON contract_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

COMMENT ON TABLE contracts IS '입주 계약 관리 테이블';
COMMENT ON TABLE contract_history IS '계약 변경 히스토리';
