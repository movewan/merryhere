const SUPABASE_URL = 'https://raxkbswsgurhtxorugag.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheGtic3dzZ3VyaHR4b3J1Z2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ2NDY3NSwiZXhwIjoyMDc3MDQwNjc1fQ.Neb3CWrCIuJEHLqvbeDdZ1IZFoABzBmkgs5fcW-B70M';

async function createUser(email, password) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: '마스터 관리자'
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ 마스터 관리자 계정 생성 성공: ${email}`);
      return data;
    } else {
      console.log(`❌ 계정 생성 실패: ${email}`);
      console.log(`상태 코드: ${response.status}`);
      console.log(`응답:`, data);
      throw new Error(JSON.stringify(data));
    }
  } catch (error) {
    console.error(`네트워크 오류:`, error.message);
    throw error;
  }
}

async function updateUserRole(userId, role) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        role: role
      })
    });

    if (response.ok) {
      console.log(`✅ 관리자 권한 부여 성공`);
      const data = await response.text();
      return data;
    } else {
      const data = await response.text();
      console.log(`❌ 권한 부여 실패`);
      console.log(`상태 코드: ${response.status}`);
      console.log(`응답:`, data);
      throw new Error(data);
    }
  } catch (error) {
    console.error(`네트워크 오류:`, error.message);
    throw error;
  }
}

async function main() {
  console.log('🔐 마스터 관리자 계정 생성 시작...\n');

  try {
    // 마스터 관리자 생성
    console.log('👑 마스터 관리자 계정 생성 중...');
    const admin = await createUser('admin@merryhere.kr', '1234');
    console.log(`사용자 ID: ${admin.id}\n`);

    // 잠시 대기 (프로필 트리거가 실행될 시간)
    console.log('⏳ 프로필 생성 대기 중 (3초)...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 관리자 역할 업데이트
    console.log('🔧 관리자 권한 부여 중...');
    await updateUserRole(admin.id, 'admin');

    console.log('\n✅ 마스터 관리자 계정 생성 완료!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 마스터 관리자 로그인 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n  이메일: admin@merryhere.kr');
    console.log('  비밀번호: 1234');
    console.log('\n  권한: 전체 접근 (게스트 + 관리자)');
    console.log('  역할: admin');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
