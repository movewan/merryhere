-- ===================================
-- 예시 데이터 (조정된 버전)
-- 월 매출: ~70,000,000원
-- 만실시 월 수익: ~12,000,000원
-- ===================================

-- 1. 지출 데이터 (2025년 1~12월)
-- 월 평균 지출: ~58,000,000원 (70M - 12M = 58M)
-- 임대료: 35M, 관리비: 12M, 공과금: 5M, 유지보수: 4M, 소모품: 1.5M, 기타: 0.5M

-- 임대료 (월 35,000,000원)
INSERT INTO expenses (year, month, category, description, amount, created_by) VALUES
(2025, 1, 'rent', '건물 임대료', 35000000, NULL),
(2025, 2, 'rent', '건물 임대료', 35000000, NULL),
(2025, 3, 'rent', '건물 임대료', 35000000, NULL),
(2025, 4, 'rent', '건물 임대료', 35000000, NULL),
(2025, 5, 'rent', '건물 임대료', 35000000, NULL),
(2025, 6, 'rent', '건물 임대료', 35000000, NULL),
(2025, 7, 'rent', '건물 임대료', 35000000, NULL),
(2025, 8, 'rent', '건물 임대료', 35000000, NULL),
(2025, 9, 'rent', '건물 임대료', 35000000, NULL),
(2025, 10, 'rent', '건물 임대료', 35000000, NULL),
(2025, 11, 'rent', '건물 임대료', 35000000, NULL),
(2025, 12, 'rent', '건물 임대료', 35000000, NULL);

-- 관리비 (월 12,000,000원)
INSERT INTO expenses (year, month, category, description, amount, created_by) VALUES
(2025, 1, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 2, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 3, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 4, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 5, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 6, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 7, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 8, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 9, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 10, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 11, 'management', '공용공간 관리비', 12000000, NULL),
(2025, 12, 'management', '공용공간 관리비', 12000000, NULL);

-- 공과금 (월 5,000,000원)
INSERT INTO expenses (year, month, category, description, amount, created_by) VALUES
(2025, 1, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 2, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 3, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 4, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 5, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 6, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 7, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 8, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 9, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 10, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 11, 'utilities', '전기/수도/인터넷', 5000000, NULL),
(2025, 12, 'utilities', '전기/수도/인터넷', 5000000, NULL);

-- 유지보수 (월 4,000,000원)
INSERT INTO expenses (year, month, category, description, amount, created_by) VALUES
(2025, 1, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 2, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 3, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 4, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 5, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 6, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 7, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 8, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 9, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 10, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 11, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL),
(2025, 12, 'maintenance', '시설 유지보수 및 청소', 4000000, NULL);

-- 소모품 (월 1,500,000원)
INSERT INTO expenses (year, month, category, description, amount, created_by) VALUES
(2025, 1, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 2, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 3, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 4, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 5, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 6, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 7, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 8, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 9, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 10, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 11, 'supplies', '사무용품 및 소모품', 1500000, NULL),
(2025, 12, 'supplies', '사무용품 및 소모품', 1500000, NULL);

-- 기타 (월 500,000원)
INSERT INTO expenses (year, month, category, description, amount, created_by) VALUES
(2025, 1, 'other', '기타 운영비', 500000, NULL),
(2025, 2, 'other', '기타 운영비', 500000, NULL),
(2025, 3, 'other', '기타 운영비', 500000, NULL),
(2025, 4, 'other', '기타 운영비', 500000, NULL),
(2025, 5, 'other', '기타 운영비', 500000, NULL),
(2025, 6, 'other', '기타 운영비', 500000, NULL),
(2025, 7, 'other', '기타 운영비', 500000, NULL),
(2025, 8, 'other', '기타 운영비', 500000, NULL),
(2025, 9, 'other', '기타 운영비', 500000, NULL),
(2025, 10, 'other', '기타 운영비', 500000, NULL),
(2025, 11, 'other', '기타 운영비', 500000, NULL),
(2025, 12, 'other', '기타 운영비', 500000, NULL);

-- 2. 오피스 룸 데이터 (총 10개, 만실시 월 매출 ~70M)
-- 전체 10개 오피스 중 7개 입주, 3개 공실
-- 입주 오피스 합계: 70,000,000원/월
-- 공실 오피스 잠재 매출: 30,000,000원/월

UPDATE meeting_rooms SET is_office = true, office_type = '1인실', base_rent = 5000000 WHERE name = '101호';
UPDATE meeting_rooms SET is_office = true, office_type = '2인실', base_rent = 8000000 WHERE name = '102호';
UPDATE meeting_rooms SET is_office = true, office_type = '4인실', base_rent = 12000000 WHERE name = '103호';
UPDATE meeting_rooms SET is_office = true, office_type = '1인실', base_rent = 5000000 WHERE name = '201호';
UPDATE meeting_rooms SET is_office = true, office_type = '2인실', base_rent = 8000000 WHERE name = '202호';
UPDATE meeting_rooms SET is_office = true, office_type = '6인실', base_rent = 15000000 WHERE name = '203호';
UPDATE meeting_rooms SET is_office = true, office_type = '4인실', base_rent = 12000000 WHERE name = '301호';
UPDATE meeting_rooms SET is_office = true, office_type = '8인실', base_rent = 20000000 WHERE name = '302호';
UPDATE meeting_rooms SET is_office = true, office_type = '6인실', base_rent = 15000000 WHERE name = '303호';
UPDATE meeting_rooms SET is_office = true, office_type = '2인실', base_rent = 10000000 WHERE name = '304호';

-- 3. 계약 데이터 (7개 활성 계약, 총 70,000,000원/월 매출)
-- 공실: 203호 (15M), 303호 (15M), 304호 (10M) = 총 40M 잠재 매출

-- 101호: 5,000,000원 (계약기간: 2024-01-01 ~ 2026-12-31)
INSERT INTO contracts (
  company_name, room_number, start_date, end_date, space_type,
  monthly_fee, management_fee, total_monthly_cost,
  deposit, contract_status,
  contact_person, contact_phone, contact_email
) VALUES (
  '스타트업 A', '101호', '2024-01-01', '2026-12-31', 'office',
  4000000, 1000000, 5000000,
  10000000, 'active',
  '김철수', '010-1234-5678', 'kim@startupa.com'
);

-- 102호: 8,000,000원 (계약기간: 2024-03-01 ~ 2025-02-28) - 만료 임박
INSERT INTO contracts (
  company_name, room_number, start_date, end_date, space_type,
  monthly_fee, management_fee, total_monthly_cost,
  deposit, contract_status,
  contact_person, contact_phone, contact_email
) VALUES (
  '디자인 스튜디오 B', '102호', '2024-03-01', '2025-02-28', 'office',
  6400000, 1600000, 8000000,
  16000000, 'active',
  '이영희', '010-2345-6789', 'lee@designb.com'
);

-- 103호: 12,000,000원 (계약기간: 2024-06-01 ~ 2026-05-31)
INSERT INTO contracts (
  company_name, room_number, start_date, end_date, space_type,
  monthly_fee, management_fee, total_monthly_cost,
  deposit, contract_status,
  contact_person, contact_phone, contact_email
) VALUES (
  '테크 컴퍼니 C', '103호', '2024-06-01', '2026-05-31', 'office',
  9600000, 2400000, 12000000,
  24000000, 'active',
  '박민수', '010-3456-7890', 'park@techc.com'
);

-- 201호: 5,000,000원 (계약기간: 2024-02-01 ~ 2026-01-31)
INSERT INTO contracts (
  company_name, room_number, start_date, end_date, space_type,
  monthly_fee, management_fee, total_monthly_cost,
  deposit, contract_status,
  contact_person, contact_phone, contact_email
) VALUES (
  '프리랜서 연합 D', '201호', '2024-02-01', '2026-01-31', 'office',
  4000000, 1000000, 5000000,
  10000000, 'active',
  '최지은', '010-4567-8901', 'choi@freelanced.com'
);

-- 202호: 8,000,000원 (계약기간: 2024-04-01 ~ 2026-03-31)
INSERT INTO contracts (
  company_name, room_number, start_date, end_date, space_type,
  monthly_fee, management_fee, total_monthly_cost,
  deposit, contract_status,
  contact_person, contact_phone, contact_email
) VALUES (
  '마케팅 에이전시 E', '202호', '2024-04-01', '2026-03-31', 'office',
  6400000, 1600000, 8000000,
  16000000, 'active',
  '정수진', '010-5678-9012', 'jung@marketinge.com'
);

-- 301호: 12,000,000원 (계약기간: 2024-07-01 ~ 2025-01-31) - 만료 예정
INSERT INTO contracts (
  company_name, room_number, start_date, end_date, space_type,
  monthly_fee, management_fee, total_monthly_cost,
  deposit, contract_status,
  contact_person, contact_phone, contact_email
) VALUES (
  'IT 솔루션 F', '301호', '2024-07-01', '2025-01-31', 'office',
  9600000, 2400000, 12000000,
  24000000, 'active',
  '강동원', '010-6789-0123', 'kang@itsolutionf.com'
);

-- 302호: 20,000,000원 (계약기간: 2024-05-01 ~ 2026-04-30)
INSERT INTO contracts (
  company_name, room_number, start_date, end_date, space_type,
  monthly_fee, management_fee, total_monthly_cost,
  deposit, contract_status,
  contact_person, contact_phone, contact_email
) VALUES (
  '핀테크 스타트업 G', '302호', '2024-05-01', '2026-04-30', 'office',
  16000000, 4000000, 20000000,
  40000000, 'active',
  '윤서연', '010-7890-1234', 'yoon@fintechg.com'
);

-- ===================================
-- 요약
-- ===================================
-- 총 월 지출: 58,000,000원
--   - 임대료: 35,000,000원
--   - 관리비: 12,000,000원
--   - 공과금: 5,000,000원
--   - 유지보수: 4,000,000원
--   - 소모품: 1,500,000원
--   - 기타: 500,000원
--
-- 현재 입주 매출: 70,000,000원/월
-- 현재 순수익: 12,000,000원/월
--
-- 공실: 3개 (203호, 303호, 304호)
-- 공실 잠재 매출: 40,000,000원/월
-- 만실시 예상 매출: 110,000,000원/월
-- 만실시 예상 순수익: 52,000,000원/월
--
-- 만료 예정 계약:
--   - 102호 (디자인 스튜디오 B): 2025-02-28 만료
--   - 301호 (IT 솔루션 F): 2025-01-31 만료
