# MERRYHERE Supabase Database Setup

이 폴더에는 MERRYHERE 웹사이트의 Supabase 데이터베이스 스키마와 마이그레이션 파일이 포함되어 있습니다.

## 데이터베이스 구조

### 테이블

1. **profiles** - 사용자 프로필 정보
   - Supabase Auth와 연동
   - 회원 유형: 관리자, 입주기업(대표자/중간관리자/회원), 일반회원
   - 개인 포인트 및 팀 포인트 관리
   - 소속 조직 관리

2. **meeting_rooms** - 회의실 정보
   - 회의실명, 층, 수용인원
   - 30분당 포인트 비용
   - 예약 설정 (최소/최대 예약 시간)

3. **room_bookings** - 회의실 예약
   - 예약 일시 및 시간대
   - 회의 제목 및 설명
   - 포인트 사용 내역
   - 예약 상태 (확정/취소)

4. **programs** - 프로그램/이벤트
   - 프로그램 정보 (제목, 설명, 상세 내용)
   - 일정 및 정원 관리
   - 현재 참가자 수 자동 계산

5. **program_registrations** - 프로그램 신청
   - 사용자별 프로그램 참가 신청
   - 상태 관리 (신청/참석/취소/불참)

6. **point_transactions** - 포인트 거래 내역
   - 모든 포인트 변동 이력 추적
   - 획득/사용/환불/조정 타입
   - 참조 정보 (예약, 프로그램 등)

### 주요 기능

- ✅ 자동 프로필 생성 (회원가입 시)
- ✅ 포인트 차감 및 환불 (회의실 예약/취소)
- ✅ 프로그램 참가자 수 자동 업데이트
- ✅ 예약 충돌 방지
- ✅ 미래 예약만 가능 (최대 4주 전까지)
- ✅ Row Level Security (RLS) 보안 정책

## 설정 방법

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com) 접속
2. 새 프로젝트 생성
3. 프로젝트 설정에서 다음 정보 확인:
   - Project URL
   - Project API keys (anon/public key)

### 2. 환경변수 설정

`.env.local` 파일에 Supabase 정보 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 데이터베이스 마이그레이션 실행

Supabase Dashboard > SQL Editor에서 다음 순서로 실행:

1. `migrations/20251026_initial_schema.sql` - 기본 스키마 생성
2. `migrations/20251026_rls_policies.sql` - RLS 보안 정책 적용

또는 Supabase CLI 사용:

```bash
# Supabase CLI 설치 (한 번만)
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

### 4. Storage 버킷 생성 (프로필 이미지용)

Supabase Dashboard > Storage:

1. 새 버킷 생성: `avatars`
2. Public 버킷으로 설정
3. 업로드 정책 설정 (인증된 사용자만 업로드 가능)

## 데이터베이스 함수

### process_room_booking

회의실 예약 및 포인트 차감을 처리하는 함수

```sql
SELECT process_room_booking(
  p_room_id := 'room-uuid',
  p_user_id := 'user-uuid',
  p_booking_date := '2025-10-27',
  p_start_time := '10:00',
  p_end_time := '11:00',
  p_meeting_title := '팀 미팅',
  p_points_used := 20,
  p_use_team_points := false
);
```

### cancel_room_booking

예약 취소 및 포인트 환불을 처리하는 함수

```sql
SELECT cancel_room_booking(
  p_booking_id := 'booking-uuid',
  p_user_id := 'user-uuid'
);
```

## 초기 데이터

마이그레이션 파일에 포함된 초기 회의실 데이터:

- 미팅룸 A (4층, 6인, 10포인트/30분)
- 미팅룸 B (5층, 8인, 15포인트/30분)
- 미팅룸 C (6층, 10인, 20포인트/30분)
- 메리홀 (7층, 30인, 50포인트/30분)

## 보안 (RLS)

모든 테이블에 Row Level Security가 적용되어 있습니다:

- 사용자는 자신의 데이터만 조회/수정 가능
- 팀 리더/관리자는 팀원 데이터 조회/수정 가능
- 관리자는 모든 데이터 관리 가능
- 직접적인 포인트 수정 불가 (함수를 통해서만 가능)

## 개발 참고사항

### 타입 정의

TypeScript 타입은 `lib/supabase/database.types.ts`에 정의되어 있습니다.

### 클라이언트 사용

```typescript
// Client Component
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();

// Server Component
import { createClient } from "@/lib/supabase/server";
const supabase = await createClient();
```

### 쿼리 함수

`lib/supabase/queries.ts`에서 재사용 가능한 쿼리 함수 제공

### 뮤테이션 함수

`lib/supabase/mutations.ts`에서 데이터 수정 함수 제공

## 문제 해결

### 마이그레이션 오류

- UUID extension이 없는 경우: Supabase Dashboard > Extensions에서 활성화
- 권한 오류: Service Role Key 사용 확인

### RLS 정책 오류

- 정책이 너무 제한적인 경우: Dashboard에서 직접 수정 가능
- 개발 중 RLS 비활성화: 권장하지 않음 (보안 문제)

## 추가 기능 (향후)

- [ ] 실시간 구독 (예약 현황 실시간 업데이트)
- [ ] 이메일 알림 (예약 확인, 리마인더)
- [ ] 포인트 자동 충전 시스템
- [ ] 회의실 사용 통계
