-- 관리자 역할 업데이트
UPDATE profiles
SET role = 'admin'
WHERE id = 'b9d9f02e-95fa-44c5-ac60-b64e5e67758f';

-- 결과 확인
SELECT id, email, role, full_name
FROM profiles
WHERE email IN ('test@merryhere.kr', 'admin@merryhere.kr');
