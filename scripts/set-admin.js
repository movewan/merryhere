const SUPABASE_URL = 'https://raxkbswsgurhtxorugag.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheGtic3dzZ3VyaHR4b3J1Z2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ2NDY3NSwiZXhwIjoyMDc3MDQwNjc1fQ.Neb3CWrCIuJEHLqvbeDdZ1IZFoABzBmkgs5fcW-B70M';

async function setAdminRole() {
  const adminId = 'b9d9f02e-95fa-44c5-ac60-b64e5e67758f';

  console.log('🔧 관리자 역할 설정 중...\n');

  // auth.users의 raw_user_meta_data 업데이트 시도
  const authResponse = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${adminId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({
      user_metadata: {
        role: 'admin',
        full_name: '관리자'
      }
    })
  });

  const authData = await authResponse.json();
  console.log('Auth 메타데이터 업데이트:', authResponse.ok ? '✅ 성공' : '❌ 실패');
  if (!authResponse.ok) {
    console.log('응답:', authData);
  }

  console.log('\n✅ 완료!');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 테스트 계정 정보');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n일반 사용자:');
  console.log('  이메일: test@merryhere.kr');
  console.log('  비밀번호: test1234!');
  console.log('\n관리자:');
  console.log('  이메일: admin@merryhere.kr');
  console.log('  비밀번호: admin1234!');
  console.log('\n※ 관리자 페이지는 /admin 에서 접속 가능합니다');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

setAdminRole().catch(console.error);
