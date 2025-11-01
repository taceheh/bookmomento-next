# <img width="66" height="66" alt="Group 10" src="https://github.com/user-attachments/assets/fdc0f6db-0ecd-41e9-828c-c475fd2058db" />

나의 독서 기록과 생각을 공유하고 토론하는 북 커뮤니티 플랫폼

<br/><br/>


## ⚙️ 기술 스택

**Language & Framework**

<img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"> <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white">

**Style**

<img src="https://img.shields.io/badge/tailwind css-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">

**State Management**

<img src="https://img.shields.io/badge/zustand-E34F26?style=for-the-badge&logo=zustand&logoColor=white"> <img src="https://img.shields.io/badge/tanstack query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white">

**Form Management**

<img src="https://img.shields.io/badge/react hook form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white"> <img src="https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white">

**Database & ORM**

<img src="https://img.shields.io/badge/supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white"> <img src="https://img.shields.io/badge/prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white">

**Code Style**

<img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=Prettier&logoColor=white"> <img src="https://img.shields.io/badge/esLint-4B32C3?style=for-the-badge&logo=esLint&logoColor=white">

<br/><br/>

## 💡 기술적 의사결정

### **TypeScript**

#### 도입 배경

초기 개발 단계에서 JavaScript를 사용했으나, 컴포넌트와 API 응답 데이터가 많아지면서 props로 전달되는 데이터나 API 응답 값이 undefined로 처리되어 런타임 에러가 발생하는 현상 빈번화.

#### 도입 결과

타입 추론을 코드 작성 단계에서 수행하여 런타임 에러를 사전에 차단. 특히 API 응답 타입을 명확히 정의함으로써 데이터 구조를 명확히 파악하고, props 타입을 명시적으로 정의하여 코드 가독성과 유지보수성 향상.

---

### **Next.js (App Router)**

#### 도입 배경

기능 구현 초기에는 useEffect와 useState를 사용한 CSR(클라이언트 사이드 렌더링) 방식으로 개발. 이로 인해 초기 로딩 속도(LCP)가 느리고, SEO에 취약하며, 클라이언트에서 과도한 데이터 페칭 로직 처리.

<details>
<summary><b>기술 선정 과정 (리팩토링)</b></summary>

**CSR (기존 방식)**: useEffect 내에서 fetch를 실행하여 로딩 상태 관리. 초기 HTML이 비어있어 LCP와 SEO에 불리.

**Next.js (App Router)**:
- **RSC (서버 컴포넌트)**: async/await를 사용하여 서버에서 직접 데이터를 페칭, 데이터가 채워진 HTML을 전송하여 LCP 및 SEO 최적화.
- **Streaming & Suspense**: 댓글 목록처럼 무거운 컴포넌트를 분리하여, 사용자가 빠른 UI(책 정보)를 먼저 볼 수 있도록 체감 성능 향상.
- **Server Actions**: use server를 통해 API 라우트 없이 클라이언트가 서버 함수를 직접 호출, 코드 간소화 및 네트워크 레이어 축소.
- **next/image, next/link**: 이미지 최적화(CLS 방지, WebP) 및 클라이언트 사이드 라우팅(Pre-fetching) 기본 제공.

</details>

#### 도입 결과

RSC와 스트리밍을 통해 초기 로딩 성능(LCP)을 극대화. 서버 액션을 도입하여 API 엔드포인트 관리 부담 경감, next/image 등으로 CLS 문제 해결하여 Lighthouse 성능 점수 향상.

---

### **React Query (TanStack Query)**

#### 도입 배경

useEffect와 fetch로 직접 서버 데이터를 관리했으나, '좋아요' 토글, 댓글 목록 갱신 등 클라이언트에서의 상호작용 후 데이터를 다시 불러오고(re-fetching), 캐시를 관리하며, 로딩/에러 상태를 동기화하는 비동기 로직 복잡화.

<details>
<summary><b>기술 선정 과정</b></summary>

**Zustand (단독 사용)**: 클라이언트 상태 관리에는 유용하지만, 서버 상태(캐싱, re-fetching 등)를 전문적으로 관리하기에 부족.

**React Query**:
- **서버 상태 분리**: 클라이언트 상태(Zustand)와 서버 상태(React Query)를 명확히 분리.
- **useQuery**: isLoading, error 상태를 내장하여 비동기 로직 간소화 및 자동 캐싱.
- **useMutation**: 데이터 변경(C,U,D) 로직을 통합 관리.
- **Optimistic Update (낙관적 업데이트)**: '좋아요' 기능에 적용, 서버 응답 전에 UI를 즉시 업데이트하여 UX 극대화.

</details>

#### 도입 결과

useQuery로 '좋아요' 데이터를, useMutation으로 '좋아요' 토글 기능 구현. 특히 낙관적 업데이트를 적용하여 사용자가 버튼 클릭 시 즉각적인 UI 피드백 제공.

---

### **Zustand**

#### 도입 배경

로그인한 사용자의 정보(ID, 닉네임)는 Header, ProfileEditForm, CommentListClient 등 여러 컴포넌트에서 공통으로 필요. props로 전달하는 방식(Prop Drilling)은 구조가 복잡해질수록 유지보수 어려움으로 경량화된 전역 상태 관리 솔루션 필요.

<details>
<summary><b>기술 선정 과정</b></summary>

**Context API**: 간단한 상태 관리는 가능하나, Provider 내부의 상태가 변경될 때 불필요한 리렌더링 발생 가능성.

**Zustand**:
- **간단한 API**: 보일러플레이트 없이 useAuthStore 훅 하나로 상태 생성 및 사용 가능.
- **성능**: Context Provider가 필요 없어 불필요한 리렌더링 문제에서 자유.
- **React Query와 역할 분담**: 서버 상태는 React Query, 순수 클라이언트 상태(로그인 유저)는 Zustand로 명확히 분리.

</details>

#### 도입 결과

useAuthStore를 생성하여 AuthHydrator로 서버의 초기 사용자 정보를 주입하고, 프로필 수정 시 서버 액션 성공과 동시에 Zustand 스토어의 nickname도 즉시 업데이트하여 UI 반응성 향상.

---

### **React Hook Form & Zod**

#### 도입 배경

프로필 수정 폼과 댓글 폼을 초기에는 useState로 구현. 하지만 입력 필드가 많아지거나 유효성 검사(닉네임 길이, 댓글 내용 비어있는지) 로직이 추가되면서 onChange 핸들러와 onSubmit 함수 비대화, 상태 관리 코드 복잡화.

<details>
<summary><b>기술 선정 과정</b></summary>

**useState (기존 방식)**: 상태(value), 에러 상태(error), 로딩 상태(isLoading) 등 useState 난립. 유효성 검사 로직이 View에 혼재.

**React Hook Form & Zod**:
- **관심사 분리**: 폼 상태 관리는 useForm에, 유효성 검사 규칙은 zod 스키마(schemas.ts)에 위임.
- **성능**: 불필요한 리렌더링을 제어하여 폼 성능 최적화.
- **유지보수성**: '닉네임 2자 이상' 같은 규칙 변경 시, 스키마 파일 한 곳만 수정으로 완료.

</details>

#### 도입 결과

모든 폼(프로필 수정, 새 댓글, 답글, 댓글 수정)을 useForm과 zodResolver로 리팩토링. 컴포넌트는 UI 렌더링에만 집중하고, 상태 및 유효성 검사 로직 분리하여 코드의 가독성과 안정성 확보.

---

### **Supabase & Prisma**

#### 도입 배경

개인 프로젝트에서 빠르고 안정적인 백엔드 구축 필요. 인증, 데이터베이스, 실시간 기능까지 제공하는 BaaS(Backend as a Service) 고려.

<details>
<summary><b>기술 선정 과정</b></summary>

**Firebase**: 인증, 실시간 DB는 강력하지만 NoSQL 기반이라 복잡한 관계형 데이터(댓글 계층 구조 등) 처리에 어려움.

**Supabase**:
- **PostgreSQL 기반**: RDB를 그대로 제공하여 SQL 쿼리 및 관계형 데이터 관리 유연.
- **Prisma ORM 호환**: TypeScript 환경에서 타입 세이프하게 DB를 조작하기 위해 Prisma와 통합.
- **인증 통합**: 카카오 로그인 등 소셜 로그인과 auth.users 테이블을 통한 인증 처리 간편.
- **Database Triggers**: auth.users 가입 시 public.users에 프로필 자동 생성 등 DB 레벨 자동화 구현.

</details>

#### 도입 결과

Supabase로 인증과 DB 해결, Prisma를 ORM으로 사용하여 TypeScript 코드 내에서 타입 안정성 확보. (단, nickname 초기화 이슈 해결을 위해 DB Trigger 수정 - 트러블 슈팅 참고)

---

### **Tailwind CSS**

#### 도입 배경

CSS-in-JS (Styled-Components)나 SCSS도 고려했으나, className만으로 스타일을 빠르게 적용하고 디자인 일관성을 유지할 수 있는 유틸리티 우선 CSS 프레임워크 필요.

#### 도입 결과

유틸리티 클래스를 조합하여 디자인 시스템을 빠르게 구축. Button.tsx, Input.tsx 등 ui 컴포넌트 생성하여 재사용성 향상, 반응형 디자인을 효율적으로 적용.

<br/><br/>

## 💡 주요 기능

### **☑️ 유저 관리**

- **카카오 로그인**: 카카오 계정을 통한 간편 로그인 및 users 테이블 자동 프로필 생성 (DB Trigger)
- **프로필 수정**: 사용자 닉네임 수정 기능
- **Zustand**: useAuthStore를 통해 로그인 상태 전역 관리

<br/><br/>

### **☑️ 도서 정보 및 검색**

- **메인 페이지**: 베스트셀러, 신간 추천, 리뷰 순위 등 도서 목록 제공 (RSC)
- **도서 검색**: app/search 페이지를 통한 도서 검색 기능 (RSC)
- **도서 상세**: 책 소개, '좋아요/싫어요' 기능 (Server Shell + useQuery/useMutation)

<br/><br/>

### **☑️ 댓글 및 토론 (Server Actions)**

- **댓글 CRUD**: 댓글 작성, 수정, 삭제 기능 (Server Actions)
- **계층형 댓글**: 대댓글(답글) 작성 기능
- **자동 갱신**: 서버 액션 성공 후 router.refresh()를 통해 댓글 목록 자동 업데이트
- **폼 유효성 검사**: react-hook-form + zod 적용

<br/><br/>

## 📈 성능 최적화 (RSC & Streaming)

### 문제 상황

리팩토링 전, book/[id] (상세 페이지)는 모든 데이터를 useEffect와 fetch로 가져오는 단일 클라이언트 컴포넌트('use client'). 사용자는 책 정보, 좋아요, 댓글 목록 등 모든 API 요청이 완료될 때까지 로딩 스피너만 봐야 함 (LCP, TBT 성능 저하).

### 원인 분석

- 클라이언트 컴포넌트가 모든 데이터 페칭을 차단(blocking)
- 빠른 데이터(책 정보)와 느린 데이터(댓글 목록)가 분리 안 됨

### 해결 방법

1. **Server Shell 패턴**: app/book/[id]/page.tsx는 서버 컴포넌트(셸)로 변경. async로 빠른 데이터(책 정보, 좋아요)만 await로 가져와서 BookDetailClient 컴포넌트에 props로 전달.

2. **Streaming & Suspense**: 느린 데이터(댓글 목록)는 CommentListLoader.tsx라는 별도 서버 컴포넌트로 분리하고, page.tsx에서 React.Suspense로 감쌈.

3. **Skeleton UI**: Suspense의 fallback으로 CommentSkeleton.tsx를 제공하여, 댓글이 로드되는 동안 스켈레톤 UI 표시로 UX 향상.

### 최종 코드 (구조)

```typescript
// app/book/[id]/page.tsx (서버 셸)
export default async function Page({ params }) {
  // 1. '빠른' 데이터만 await
  const [book, reactionData] = await Promise.all([
    getBookDetail(id),
    getInitialReactions(id),
  ]);

  return (
    <>
      {/* 2. '빠른' UI는 즉시 렌더링 */}
      <BookDetailClient initialBook={book} initialReactionData={reactionData} />

      {/* 3. '느린' UI는 Suspense로 감싸 스트리밍 */}
      <Suspense fallback={<CommentSkeleton />}>
        <CommentListLoader bookId={id} />
      </Suspense>
    </>
  );
}
```

<br/><br/>

## 🎯 트러블 슈팅

### **1. 닉네임 저장 후 null로 초기화되는 현상**

#### 문제 상황

/mypage/edit 페이지에서 닉네임을 성공적으로 저장(DB 저장 확인)해도, 잠시 후 (주로 새로고침 또는 재로그인 시) nickname이 다시 null로 초기화 버그 발생.

#### 원인 분석

- app/mypage/edit/actions.ts (서버 액션)는 public.users의 nickname을 잘 업데이트
- Supabase Trigger 목록 조회 결과, auth.users 테이블 변경 시 sync_user_from_auth 함수가 실행되는 트리거(on_auth_user_changed) 발견
- 해당 함수가 auth.users의 메타데이터(new.raw_user_meta_data->>'nickname')를 public.users로 덮어쓰는데, 로그인 시점의 auth.users 메타데이터에는 nickname이 null이었기 때문에 public.users의 nickname까지 null로 덮어쓰고 있었음.

#### 해결 방법

sync_user_from_auth DB 함수 코드를 수정. ON CONFLICT ... DO UPDATE 구문에서 nickname을 업데이트할 때, COALESCE 함수를 사용하여 auth.users에서 가져온 값이 null이면 기존 public.users.nickname 값을 유지하도록 변경.

#### 최종 코드 (SQL)

```sql
-- ...
ON CONFLICT (id) DO UPDATE
SET 
  email = excluded.email,
  provider = excluded.provider,
  -- ⭐️ auth.users의 닉네임(excluded.nickname)이 NULL이면, 
  -- ⭐️ 기존 닉네임(public.users.nickname)을 유지
  nickname = COALESCE(excluded.nickname, public.users.nickname);
```

<br/>

### **2. 댓글/답글 UI가 즉시 갱신되지 않는 문제**

#### 문제 상황

댓글 작성/수정/삭제 시 서버 액션(addComment 등)을 호출하고 revalidatePath도 실행했으나, UI가 새로고침(F5)을 해야만 갱신.

#### 원인 분석

- revalidatePath는 Next.js의 서버 데이터 캐시만 무효화
- CommentListClient 컴포넌트는 initialComments prop을 받아 useState (const [comments, setComments] = ...)에 저장하여 사용 중
- 서버 캐시가 갱신되어도, 이미 렌더링된 클라이언트 컴포넌트의 useState 변수는 자동으로 갱신 안 됨.

#### 해결 방법

router.refresh() 호출: 서버 액션 성공 시(result.success), next/navigation의 router.refresh()를 호출. router.refresh()는 서버 컴포넌트를 다시 실행하고, 업데이트된 props (initialComments)를 클라이언트 컴포넌트에 전달하여 useState를 갱신시킴 (소프트 리프레시). 대댓글 즉시 갱신: 대댓글(ReplyItem) 수정/삭제 시, router.refresh()와 더불어 부모(CommentItem)의 loadReplies() 함수를 prop으로 받아 직접 호출, replies 상태를 즉시 갱신하여 UX 향상.

#### 최종 코드 (React)

```typescript
// CommentListClient.tsx
import { useRouter } from 'next/navigation';

export default function CommentListClient(...) {
  const router = useRouter();
  // ...
  const onValidSubmit = async (data: CommentFormData) => {
    // ...
    startTransitionAdd(async () => {
      const result = await addComment(bookId, null, formData);
      if (result?.success) {
        reset();
        router.refresh(); // ⭐️ UI 자동 갱신
      }
      // ...
    });
  };
  // ...
}
```

<br/>

### **3. next/image fill prop 사용 시 이미지 안 나옴**

#### 문제 상황

BookDetailClient의 배경 블러 이미지를 <img>에서 <Image fill ... />로 교체했으나 이미지가 렌더링 안 됨.

#### 원인 분석

fill prop은 Next.js가 position: absolute, w-full, h-full 등의 스타일을 자동으로 적용. className에 absolute inset-0 w-full h-full 등 레이아웃 스타일이 중복으로 적용되어 충돌 발생.

#### 해결 방법

fill prop 사용 시, className에는 레이아웃/위치 클래스(absolute, inset-0, w-full, h-full)를 제거하고, 순수 스타일링(object-cover, blur-md, scale-110)만 남김.

#### 최종 코드 (React)

```jsx
{/* ❌ 기존 코드 */}
<Image fill className="absolute inset-0 w-full h-full object-cover blur-md" ... />

{/* ✅ 수정 코드 */}
<Image fill className="object-cover blur-md scale-110" ... />
```

<br/><br/>

## 📁 폴더구조

```
📁 src
┣ 📁 app (라우팅, 서버 컴포넌트, 서버 액션)
┃  ┣ 📁 (routes)
┃  ┃  ┣ 📁 book
┃  ┃  ┃  ┗ 📁 [id]
┃  ┃  ┃     ┣ 📄 actions.ts  (댓글 서버 액션)
┃  ┃  ┃     ┗ 📄 page.tsx    (서버 셸)
┃  ┃  ┣ 📁 mypage
┃  ┃  ┃  ┗ 📁 edit
┃  ┃  ┃     ┣ 📄 actions.ts  (프로필 서버 액션)
┃  ┃  ┃     ┗ 📄 page.tsx    (서버 컴포넌트)
┃  ┣ 📄 layout.tsx
┃  ┗ 📄 page.tsx
┣ 📁 components (클라이언트 컴포넌트)
┃  ┣ 📁 book
┃  ┃  ┣ 📄 BookDetailClient.tsx
┃  ┃  ┣ 📄 CommentListClient.tsx
┃  ┃  ┗ 📄 CommentSkeleton.tsx
┃  ┣ 📁 home
┃  ┃  ┗ 📄 Section.tsx
┃  ┣ 📁 providers
┃  ┃  ┣ 📄 AuthHydrator.tsx
┃  ┃  ┗ 📄 QueryProvider.tsx
┃  ┗ 📁 ui (표준 UI)
┃     ┣ 📄 Button.tsx
┃     ┗ 📄 Input.tsx
┣ 📁 lib (핵심 로직 및 설정)
┃  ┣ 📁 auth
┃  ┃  ┗ 📄 server.ts
┃  ┣ 📄 prisma.ts
┃  ┣ 📄 schemas.ts (Zod 스키마)
┃  ┗ 📄 supabase.ts
┣ 📁 stores (Zustand 전역 상태)
┃  ┗ 📄 auth.ts
┗ 📁 types (TypeScript 타입 정의)
   ┗ 📄 book.ts
```
