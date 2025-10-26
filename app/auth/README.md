# 인증 시스템 가이드

MERRYHERE 웹사이트의 인증 시스템 설정 및 사용 가이드입니다.

## 기능

✅ **이메일/비밀번호 인증**
- 회원가입
- 로그인
- 로그아웃

✅ **소셜 로그인**
- Google OAuth
- Kakao OAuth

✅ **회원 정보 관리**
- 프로필 (이름, 이메일, 연락처)
- 생년월일 (선택)
- SNS 주소 (선택)
- 메리히어 사무실 정보

✅ **보안**
- Row Level Security (RLS)
- Protected Routes (미들웨어)
- 세션 관리

## 페이지

- `/auth/login` - 로그인
- `/auth/signup` - 회원가입
- `/auth/callback` - OAuth 콜백 핸들러

## 설정 방법

### 1. Supabase 프로젝트 설정

#### 이메일/비밀번호 인증

Supabase Dashboard > Authentication > Providers:
1. Email 활성화
2. Confirm email 활성화 (이메일 인증 필요시)

#### Google OAuth 설정

1. **Google Cloud Console**
   - https://console.cloud.google.com 접속
   - 새 프로젝트 생성 또는 기존 프로젝트 선택
   - "APIs & Services" > "Credentials" 이동
   - "Create Credentials" > "OAuth 2.0 Client ID" 선택
   - Application type: Web application
   - Authorized redirect URIs:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```
   - Client ID와 Client Secret 복사

2. **Supabase Dashboard**
   - Authentication > Providers > Google
   - "Enable Google provider" 체크
   - Client ID와 Client Secret 입력
   - Save

3. **환경변수**
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

#### Kakao OAuth 설정

1. **Kakao Developers**
   - https://developers.kakao.com 접속
   - 내 애플리케이션 > 애플리케이션 추가
   - 앱 키 확인 (REST API 키 사용)

2. **카카오 로그인 활성화**
   - 내 애플리케이션 > 카카오 로그인
   - "카카오 로그인 활성화" ON
   - Redirect URI 설정:
     ```
     https://[your-project-ref].supabase.co/auth/v1/callback
     ```

3. **동의 항목 설정**
   - 내 애플리케이션 > 동의 항목
   - 필수 동의: 닉네임, 이메일

4. **Supabase Dashboard**
   - Authentication > Providers > Kakao
   - "Enable Kakao provider" 체크
   - Client ID (REST API 키) 입력
   - Save

5. **환경변수**
   ```env
   KAKAO_CLIENT_ID=your-kakao-rest-api-key
   ```

### 2. 환경변수 설정

`.env.local` 파일에 다음 추가:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Kakao OAuth (optional)
KAKAO_CLIENT_ID=your-kakao-rest-api-key
```

### 3. 데이터베이스 마이그레이션

`supabase/migrations/` 폴더의 SQL 파일들을 Supabase Dashboard > SQL Editor에서 실행:

1. `20251026_initial_schema.sql` - 테이블 생성
2. `20251026_rls_policies.sql` - 보안 정책 적용

## 사용 방법

### 클라이언트 컴포넌트에서

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export default function MyComponent() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // 인증 상태 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return <div>{user ? user.email : "로그인 필요"}</div>;
}
```

### 서버 컴포넌트에서

```typescript
import { createClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>로그인 필요</div>;
  }

  return <div>{user.email}</div>;
}
```

### Server Actions

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function myAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("인증 필요");
  }

  // 작업 수행...

  revalidatePath("/");
}
```

## Protected Routes

`middleware.ts`가 자동으로 다음 경로를 보호합니다:

- `/rooms` - 회의실 예약 (로그인 필요)
- `/programs` - 프로그램 (로그인 필요)
- `/my` - MY PAGE (로그인 필요)

미로그인 사용자는 `/auth/login`으로 리다이렉트됩니다.

## 회원 유형

- **admin** - 관리자 (모든 권한)
- **tenant_leader** - 입주기업 대표자 (팀 관리 가능)
- **tenant_manager** - 입주기업 중간관리자 (팀원 일부 관리)
- **tenant_member** - 입주기업 회원 (팀 포인트 공유)
- **general** - 일반 회원 (개인 포인트만 사용)

## 커스터마이징

### 회원가입 필드 추가

`app/auth/signup/page.tsx`에서 폼 필드 추가 후, `profiles` 테이블에 컬럼 추가:

```sql
ALTER TABLE profiles ADD COLUMN new_field TEXT;
```

### 로그인 후 리다이렉트 변경

`app/auth/actions.ts`의 `login` 함수에서 `redirect` 경로 수정:

```typescript
export async function login(formData: FormData) {
  // ...
  redirect("/dashboard"); // 원하는 경로로 변경
}
```

## 문제 해결

### OAuth 콜백 오류

- Redirect URI가 정확히 일치하는지 확인
- Supabase Project URL이 올바른지 확인
- Provider 설정이 활성화되어 있는지 확인

### 이메일 인증 메일이 안 옴

- Supabase Dashboard > Authentication > Email Templates 확인
- SMTP 설정 확인 (프로덕션 환경)

### RLS 정책 오류

- SQL Editor에서 `20251026_rls_policies.sql` 재실행
- Supabase Dashboard > Authentication > Policies에서 정책 확인

## 배포 시 주의사항

1. **환경변수 업데이트**
   - `NEXT_PUBLIC_SITE_URL`을 프로덕션 도메인으로 변경
   - OAuth Redirect URI를 프로덕션 URL로 업데이트

2. **Google OAuth**
   - Google Cloud Console에서 프로덕션 도메인 추가
   - Authorized redirect URIs 업데이트

3. **Kakao OAuth**
   - Kakao Developers에서 프로덕션 도메인 추가
   - Redirect URI 업데이트

4. **이메일 인증**
   - Supabase SMTP 설정 (SendGrid, AWS SES 등)
   - 이메일 템플릿 커스터마이징
