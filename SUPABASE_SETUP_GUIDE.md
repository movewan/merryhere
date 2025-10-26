# MERRYHERE Supabase 설정 가이드

이 가이드는 MERRYHERE 웹사이트를 위한 Supabase 데이터베이스 설정 방법을 단계별로 안내합니다.

## ✅ 완료된 작업

- ✅ Supabase 프로젝트 생성 완료
- ✅ 환경변수 설정 완료 (`.env.local`)
- ✅ 데이터베이스 스키마 SQL 파일 생성 완료

## 📋 설정 단계

### 1단계: 데이터베이스 초기 스키마 생성

Supabase Dashboard > **SQL Editor**로 이동하여 다음 SQL 파일들을 **순서대로** 실행하세요.

#### 1-1. 초기 스키마 생성

파일: `supabase/migrations/20251026_initial_schema.sql`

**실행 방법:**
1. Supabase Dashboard 로그인
2. 좌측 메뉴에서 **SQL Editor** 클릭
3. "+ New Query" 클릭
4. 위 파일의 전체 내용을 복사하여 붙여넣기
5. **"Run"** 버튼 클릭

**생성되는 테이블:**
- `profiles` - 사용자 프로필
- `meeting_rooms` - 회의실 정보
- `room_bookings` - 회의실 예약
- `programs` - 프로그램/이벤트
- `program_registrations` - 프로그램 신청
- `point_transactions` - 포인트 거래 내역

#### 1-2. 프로필 스키마 확장 (회원가입 정보)

파일: `supabase/migrations/20251026_extend_profiles.sql`

**실행 방법:**
1. SQL Editor에서 "+ New Query" 클릭
2. 위 파일의 전체 내용을 복사하여 붙여넣기
3. **"Run"** 버튼 클릭

**추가되는 필드:**
- `user_type` - 가입 목적 (일반회원/입주회원)
- `company_name` - 회사명
- `ceo_name` - 대표자명
- `business_type` - 사업자유형
- `business_start_date` - 개업연월일
- `job_types` - 직무 (다중 선택)
- `business_registration_url` - 사업자등록증
- `business_account_url` - 사업자통장
- `company_logo_url` - 회사 로고
- `business_registration_number` - 사업자등록번호

#### 1-3. RLS (Row Level Security) 정책 설정

파일: `supabase/migrations/20251026_rls_policies.sql`

**실행 방법:**
1. SQL Editor에서 "+ New Query" 클릭
2. 위 파일의 전체 내용을 복사하여 붙여넣기
3. **"Run"** 버튼 클릭

**보안 정책:**
- 사용자는 자신의 데이터만 조회/수정 가능
- 팀 리더/관리자는 팀원 데이터 조회/수정 가능
- 관리자는 모든 데이터 관리 가능

---

### 2단계: Storage 버킷 생성

Supabase Dashboard > **Storage**로 이동

#### 2-1. 프로필 이미지 버킷 생성

1. "+ New Bucket" 클릭
2. 설정:
   - **Name**: `avatars`
   - **Public bucket**: ✅ 체크 (공개 읽기 가능)
3. "Create bucket" 클릭
4. **Upload Policy 설정** (버킷 클릭 > "Policies" 탭):

```sql
-- 인증된 사용자만 자신의 프로필 이미지 업로드 가능
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 모든 사용자가 아바타 이미지 조회 가능
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 사용자가 자신의 아바타 삭제 가능
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
```

#### 2-2. 사업자 서류 버킷 생성

1. "+ New Bucket" 클릭
2. 설정:
   - **Name**: `business-documents`
   - **Public bucket**: ✅ 체크 (필요시 공개)
3. "Create bucket" 클릭
4. **Upload Policy 설정**:

```sql
-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload business documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'business-documents' AND
  auth.uid() IS NOT NULL
);

-- 사용자가 자신의 서류만 조회 가능
CREATE POLICY "Users can view own business documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'business-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 관리자는 모든 서류 조회 가능
CREATE POLICY "Admins can view all business documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'business-documents' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

#### 2-3. 회사 로고 버킷 생성

1. "+ New Bucket" 클릭
2. 설정:
   - **Name**: `company-logos`
   - **Public bucket**: ✅ 체크 (공개)
3. "Create bucket" 클릭
4. **Upload Policy 설정**:

```sql
-- 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos' AND
  auth.uid() IS NOT NULL
);

-- 모든 사용자가 회사 로고 조회 가능
CREATE POLICY "Company logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');
```

---

### 3단계: 인증 설정

Supabase Dashboard > **Authentication** > **Providers**

#### 3-1. 이메일 인증 활성화

1. **Email** 항목 찾기
2. 설정:
   - ✅ "Enable Email provider" 체크
   - ✅ "Confirm email" 체크 (이메일 인증 필요시)
   - "Save" 클릭

#### 3-2. Google OAuth 설정 (선택사항)

**Google Cloud Console 설정:**
1. https://console.cloud.google.com 접속
2. 프로젝트 생성 또는 선택
3. "APIs & Services" > "Credentials"
4. "Create Credentials" > "OAuth 2.0 Client ID"
5. Application type: **Web application**
6. Authorized redirect URIs:
   ```
   https://raxkbswsgurhtxorugag.supabase.co/auth/v1/callback
   ```
7. Client ID와 Client Secret 복사

**Supabase 설정:**
1. Authentication > Providers > **Google**
2. "Enable Google provider" 체크
3. Client ID와 Client Secret 입력
4. "Save" 클릭

#### 3-3. Kakao OAuth 설정 (선택사항)

**Kakao Developers 설정:**
1. https://developers.kakao.com 접속
2. "내 애플리케이션" > "애플리케이션 추가하기"
3. 앱 이름 입력 후 생성
4. "앱 키" > **REST API 키** 복사
5. "카카오 로그인" 활성화
6. Redirect URI 설정:
   ```
   https://raxkbswsgurhtxorugag.supabase.co/auth/v1/callback
   ```
7. "동의 항목" > 필수: 닉네임, 이메일

**Supabase 설정:**
1. Authentication > Providers > **Kakao**
2. "Enable Kakao provider" 체크
3. Client ID에 REST API 키 입력
4. "Save" 클릭

---

### 4단계: 초기 관리자 계정 생성

#### 4-1. 회원가입

1. 개발 서버 실행: `npm run dev`
2. http://localhost:3000/auth/signup 접속
3. **일반 회원**으로 회원가입
   - 이메일, 비밀번호, 연락처 입력
   - 가입 완료

#### 4-2. 관리자 권한 부여

Supabase Dashboard > **Table Editor** > **profiles**

1. 방금 생성된 사용자 찾기
2. `role` 컬럼을 `admin`으로 변경
3. 저장

**또는 SQL로 실행:**
```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

---

### 5단계: 테스트

#### 5-1. 회원가입 테스트

1. **일반 회원 가입**
   - http://localhost:3000/auth/signup
   - "일반 회원" 선택
   - 이메일, 비밀번호, 연락처만 입력
   - 가입 성공 확인

2. **입주 회원 가입**
   - http://localhost:3000/auth/signup
   - "입주 회원" 선택
   - 모든 필수 필드 입력:
     - 회사명, 대표자명, 사업자유형
     - 사업자등록증, 사업자통장, 회사 로고 파일 업로드
   - 가입 성공 확인

#### 5-2. 로그인 테스트

1. http://localhost:3000/auth/login
2. 생성한 계정으로 로그인
3. 프로필 정보 확인

#### 5-3. 데이터베이스 확인

Supabase Dashboard > **Table Editor**:

1. **profiles** 테이블:
   - 사용자 정보 확인
   - `user_type`, `company_name` 등 새 필드 확인

2. **Storage** 버킷:
   - `business-documents` - 사업자 서류 업로드 확인
   - `company-logos` - 회사 로고 업로드 확인

---

## 🎯 완료 체크리스트

설정이 완료되면 다음 항목들을 확인하세요:

- [ ] SQL 마이그레이션 3개 모두 실행 완료
- [ ] Storage 버킷 3개 생성 완료 (`avatars`, `business-documents`, `company-logos`)
- [ ] 이메일 인증 활성화
- [ ] OAuth 설정 (선택사항)
- [ ] 관리자 계정 생성 및 권한 부여
- [ ] 일반 회원 가입 테스트 성공
- [ ] 입주 회원 가입 테스트 성공 (파일 업로드 포함)
- [ ] 로그인 테스트 성공

---

## 🔧 문제 해결

### 마이그레이션 오류

**오류:** `extension "uuid-ossp" does not exist`
**해결:** Supabase Dashboard > SQL Editor에서 실행:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

**오류:** `type "user_type_enum" already exists`
**해결:** 해당 마이그레이션이 이미 실행되었습니다. 다음 단계로 진행하세요.

### Storage 업로드 오류

**오류:** `new row violates row-level security policy`
**해결:** Storage Policy가 올바르게 설정되었는지 확인하세요.

### RLS 정책 오류

**오류:** 데이터를 볼 수 없음
**해결:**
1. Supabase Dashboard > Authentication > Policies
2. 해당 테이블의 정책 확인
3. 필요시 정책 재생성

---

## 📚 추가 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Row Level Security 가이드](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage 가이드](https://supabase.com/docs/guides/storage)

---

## 🚀 다음 단계

Supabase 설정이 완료되었습니다! 이제 다음 Phase로 진행할 수 있습니다:

- **Phase 4:** 홈페이지 (히어로 섹션, 공간 소개)
- **Phase 5:** 공간 소개 페이지
- **Phase 6:** 회의실 예약 시스템
- **Phase 7:** 프로그램 예약 시스템
- **Phase 8:** MY PAGE

---

**마지막 업데이트:** 2025-10-26
**작성자:** MERRYHERE 개발팀
