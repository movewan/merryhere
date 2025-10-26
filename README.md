# MERRYHERE 웹사이트

MERRYHERE 소셜벤처 공유 오피스 웹사이트 및 관리 시스템

## 기능

### 사용자 페이지
- 홈페이지 (Hero, 공간 소개, MYSC 소개, 문의 폼)
- 공간 소개 페이지 (Lounge, Office, Meeting Room, Merry Hall)
- 회의실 예약 시스템
- 프로그램 신청 시스템
- 마이페이지 (프로필, 포인트, 활동 내역, 계약 현황)

### 관리자 페이지
- 대시보드
- 회원 관리
- 계약 관리
- 회의실 관리
- 프로그램 관리

## 기술 스택

- Next.js 16.0.0 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v3
- Supabase (PostgreSQL, Auth, Storage)
- Resend (Email Service)
- shadcn/ui

## 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=your_site_url
RESEND_API_KEY=your_resend_api_key
```

## 개발 시작

```bash
npm install
npm run dev
```

## 배포

Vercel을 통해 배포됩니다.

## 데이터베이스 마이그레이션

Supabase 대시보드에서 `supabase/migrations/` 폴더의 SQL 파일들을 실행하세요.

## 테스트 데이터

`supabase/seed_contracts.sql` 파일을 실행하여 테스트 계약 데이터를 추가할 수 있습니다.
