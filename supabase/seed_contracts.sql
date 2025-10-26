-- 테스트 계약 데이터 생성
-- 독립오피스 1~5호 (5건)

INSERT INTO contracts (
  company_name, space_type, room_number, base_capacity, max_capacity, current_capacity,
  contract_status, contract_type, start_date, end_date, contract_duration,
  monthly_fee, management_fee, total_monthly_cost, deposit,
  discount_rate, cms_enabled, auto_transfer_enabled,
  business_number, contact_person, contact_phone, contact_email, notes
) VALUES
-- 독립오피스 101호
(
  '㈜유니크굿컴퍼니', 'office', '101', 44, 50, 44,
  'active', '법인', '2024-05-02', '2026-05-01', '24개월',
  6589704, 658970, 7248674, 234352800,
  0, TRUE, FALSE,
  '524-88-00746', '조민', '010-2641-1608', 'tax@uniquegood.biz',
  '독립오피스 3인실 전 계약 포함 확인'
),
-- 독립오피스 201호
(
  '㈜유니크굿컴퍼니', 'office', '201', 44, 50, 44,
  'active', '법인', '2024-05-02', '2026-05-01', '24개월',
  7601660, 760166, 8361826, 234352800,
  0, TRUE, FALSE,
  '524-88-00746', '조민', '010-2641-1608', 'tax@uniquegood.biz',
  '오복타워 계약 내역 포함 확인'
),
-- 독립오피스 301호
(
  '㈜유니크굿컴퍼니', 'office', '301', 44, 50, 44,
  'active', '법인', '2024-06-20', '2026-06-19', '24개월',
  12584000, 1258400, 13842400, 100672000,
  45, TRUE, TRUE,
  '524-88-00746', '조민', '010-2641-1608', 'tax@uniquegood.biz',
  '오복타워 계약 내역 포함 확인'
),
-- 독립오피스 401호
(
  '㈜착한소셜컴퍼니', 'office', '401', 23, 30, 20,
  'active', '법인', '2024-11-10', '2026-11-09', '24개월',
  7176000, 717600, 7893600, 35880000,
  40, TRUE, TRUE,
  '214-88-87695', '김대표', '010-1234-5678', 'ceo@goodsocial.kr',
  NULL
),
-- 독립오피스 402호
(
  '㈜코디미', 'office', '402', 11, 14, 11,
  'active', '법인', '2025-04-29', '2026-04-28', '12개월',
  3432000, 343200, 3775200, 17160000,
  40, TRUE, TRUE,
  '255-87-02614', '홍지혜', '010-2389-7343', 'tax@codime.io',
  NULL
),

-- 지정석 3개
-- 지정석 A01
(
  '소셜벤처A', 'fixed_desk', 'A01', 1, 1, 1,
  'active', '개인', '2024-08-01', '2025-08-01', '12개월',
  350000, 50000, 400000, 1200000,
  0, TRUE, FALSE,
  NULL, '이민수', '010-3333-4444', 'minsu@socialventure-a.com',
  NULL
),
-- 지정석 A02
(
  '소셜벤처B', 'fixed_desk', 'A02', 1, 1, 1,
  'active', '개인', '2024-09-15', '2025-09-15', '12개월',
  350000, 50000, 400000, 1200000,
  10, TRUE, FALSE,
  NULL, '박영희', '010-5555-6666', 'younghee@socialventure-b.com',
  '10% 할인 적용'
),
-- 지정석 A03
(
  '소셜벤처C', 'fixed_desk', 'A03', 1, 1, 1,
  'active', '법인', '2025-01-10', '2026-01-09', '12개월',
  350000, 50000, 400000, 1200000,
  0, FALSE, TRUE,
  '123-45-67890', '최지훈', '010-7777-8888', 'jihoon@socialventure-c.com',
  NULL
),

-- 비상주오피스 연간 50만원 2건
-- 비상주 1
(
  '스타트업X', 'non_resident', NULL, 0, 0, 0,
  'active', '법인', '2025-01-01', '2026-01-01', '12개월',
  0, 0, 500000, 0,
  0, FALSE, TRUE,
  '321-98-76543', '정수현', '010-9999-0000', 'suhyun@startupx.com',
  '비상주 오피스 연간 계약 - 우편물 수령 및 주소지 사용'
),
-- 비상주 2
(
  '협동조합Y', 'non_resident', NULL, 0, 0, 0,
  'active', '법인', '2025-02-01', '2026-02-01', '12개월',
  0, 0, 500000, 0,
  0, FALSE, TRUE,
  '456-12-34567', '강민지', '010-1111-2222', 'minji@coopy.com',
  '비상주 오피스 연간 계약 - 법인 주소지 사용'
);

-- 계약 데이터 확인
SELECT
  company_name,
  space_type,
  room_number,
  contract_status,
  total_monthly_cost,
  start_date,
  end_date
FROM contracts
ORDER BY space_type, room_number;
