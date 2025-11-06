const SUPABASE_URL = 'https://raxkbswsgurhtxorugag.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJheGtic3dzZ3VyaHR4b3J1Z2FnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ2NDY3NSwiZXhwIjoyMDc3MDQwNjc1fQ.Neb3CWrCIuJEHLqvbeDdZ1IZFoABzBmkgs5fcW-B70M';

async function createUser(email, password, role = 'user') {
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
          full_name: role === 'admin' ? '관리자' : '테스트 사용자'
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`✅ 사용자 생성 성공: ${email}`);
      return data;
    } else {
      console.log(`❌ 사용자 생성 실패: ${email}`);
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
      console.log(`✅ 역할 업데이트 성공: ${role}`);
      const data = await response.text();
      return data;
    } else {
      const data = await response.text();
      console.log(`❌ 역할 업데이트 실패`);
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
  console.log('🚀 테스트 계정 생성 시작...\n');

  try {
    // 일반 사용자 생성
    console.log('📝 일반 사용자 계정 생성 중...');
    const user1 = await createUser('test@merryhere.kr', 'test1234!', 'user');
    console.log(`사용자 ID: ${user1.id}\n`);

    // 관리자 사용자 생성
    console.log('👑 관리자 계정 생성 중...');
    const admin = await createUser('admin@merryhere.kr', 'admin1234!', 'admin');
    console.log(`관리자 ID: ${admin.id}\n`);

    // 잠시 대기 (프로필 트리거가 실행될 시간)
    console.log('⏳ 프로필 생성 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 관리자 역할 업데이트
    console.log('🔧 관리자 역할 업데이트 중...');
    await updateUserRole(admin.id, 'admin');

    console.log('\n✅ 모든 테스트 계정 생성 완료!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 테스트 계정 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n일반 사용자:');
    console.log('  이메일: test@merryhere.kr');
    console.log('  비밀번호: test1234!');
    console.log('\n관리자:');
    console.log('  이메일: admin@merryhere.kr');
    console.log('  비밀번호: admin1234!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
