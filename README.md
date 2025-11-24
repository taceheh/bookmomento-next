![KakaoTalk_20251124_220946194](https://github.com/user-attachments/assets/48aca7fa-e005-449f-918a-b69066c4c378)# <img width="100" height="100" alt="Group 10" src="https://github.com/user-attachments/assets/fdc0f6db-0ecd-41e9-828c-c475fd2058db" />
<img width="1600" height="960" alt="Group 13720 (1)" src="https://github.com/user-attachments/assets/eeb290df-fff4-467c-8861-df6f4e9631ab" />


나의 독서 기록과 생각을 공유하고 토론하는 북 커뮤니티 플랫폼

<br/><br/>

## 📖 프로젝트 배경
북모멘토는 Node.js + EJS 템플릿 기반의 팀 프로젝트로 시작하여, 알라딘 API를 활용한 도서 추천 및 감상평 공유 플랫폼으로 기획되었습니다.

이후 개인 리팩토링 프로젝트로 전환하여, 기존 EJS 서버 렌더링 방식의 레거시 코드를 현대화하는 것을 목표로 Next.js 15 (App Router) 마이그레이션 및 TypeScript 도입을 진행, 이를 통해 타입 안정성을 확보했습니다.
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

### **1. TypeScript**

- #### 도입 배경

   초기 개발 단계에서 JavaScript를 사용했으나, 컴포넌트와 API 응답 데이터가 많아지면서 props로 전달되는 데이터나 API 응답 값이 undefined로 처리되어 런타임 에러가 발생하는 현상 빈번화.

- #### 도입 결과

  타입 추론을 코드 작성 단계에서 수행하여 런타임 에러를 사전에 차단. 특히 API 응답 타입을 명확히 정의함으로써 데이터 구조를 명확히 파악하고, props 타입을 명시적으로 정의하여 코드 가독성과 유지보수성 향상.

---

### **2. Next.js (App Router)**

- #### 도입 배경

  기능 구현 초기에는 useEffect와 useState를 사용한 CSR(클라이언트 사이드 렌더링) 방식으로 개발. 이로 인해 초기 로딩 속도(LCP)가 느리고, SEO에 취약하며, 클라이언트에서 과도한 데이터 페칭 로직 처리.

<details>
  <summary><b>기술 선정 과정 (리팩토링)</b></summary>
 
  - **CSR (기존 방식)**: useEffect 내에서 fetch를 실행하여 로딩 상태 관리. 초기 HTML이 비어있어 LCP와 SEO에 불리.

  - **Next.js (App Router)**:
    - **RSC (서버 컴포넌트)**: async/await를 사용하여 서버에서 직접 데이터를 페칭, 데이터가 채워진 HTML을 전송하여 LCP 및 SEO 최적화.
    - **Streaming & Suspense**: 댓글 목록처럼 무거운 컴포넌트를 분리하여, 사용자가 빠른   UI(책 정보)를 먼저 볼 수 있도록 체감 성능 향상.
    - **Server Actions**: use server를 통해 API 라우트 없이 클라이언트가 서버 함수를 직접 호출, 코드 간소화 및 네트워크 레이어 축소.
    - **next/image, next/link**: 이미지 최적화(CLS 방지, WebP) 및 클라이언트 사이드 라우팅(Pre-fetching) 기본 제공.

</details>

 - #### 도입 결과

   RSC와 스트리밍을 통해 초기 로딩 성능(LCP)을 극대화. 서버 액션을 도입하여 API 엔드포인트 관리 부담 경감, next/image 등으로 CLS 문제 해결하여 Lighthouse 성능 점수 향상.

---

### **3. React Query (TanStack Query)**

- #### 도입 배경

  useEffect와 fetch로 직접 서버 데이터를 관리했으나, '좋아요' 토글, 댓글 목록 갱신 등 클라이언트에서의 상호작용 후 데이터를 다시 불러오고(re-fetching), 캐시를 관리하며, 로딩/에러 상태를 동기화하는 비동기 로직 복잡화.

<details>
<summary><b>기술 선정 과정</b></summary>

- **Zustand (단독 사용)**: 클라이언트 상태 관리에는 유용하지만, 서버 상태(캐싱, re-fetching 등)를 전문적으로 관리하기에 부족.

- **React Query**:
  - **서버 상태 분리**: 클라이언트 상태(Zustand)와 서버 상태(React Query)를 명확히 분리.
  - **useQuery**: isLoading, error 상태를 내장하여 비동기 로직 간소화 및 자동 캐싱.
  - **useMutation**: 데이터 변경(C,U,D) 로직을 통합 관리.
  - **Optimistic Update (낙관적 업데이트)**: '좋아요' 기능에 적용, 서버 응답 전에 UI를 즉시 업데이트하여 UX 극대화.

</details>

- #### 도입 결과

  useQuery로 '좋아요' 데이터를, useMutation으로 '좋아요' 토글 기능 구현. 특히 낙관적 업데이트를 적용하여 사용자가 버튼 클릭 시 즉각적인 UI 피드백 제공.

---

### **4. Zustand**

- #### 도입 배경

  로그인한 사용자의 정보(ID, 닉네임)는 Header, ProfileEditForm, CommentListClient 등 여러 컴포넌트에서 공통으로 필요. props로 전달하는 방식(Prop Drilling)은 구조가 복잡해질수록 유지보수 어려움으로 경량화된 전역 상태 관리 솔루션 필요.

<details>
<summary><b>기술 선정 과정</b></summary>

- **Context API**: 간단한 상태 관리는 가능하나, Provider 내부의 상태가 변경될 때 불필요한 리렌더링 발생 가능성.

- **Zustand**:
  - **간단한 API**: 보일러플레이트 없이 useAuthStore 훅 하나로 상태 생성 및 사용 가능.
  - **성능**: Context Provider가 필요 없어 불필요한 리렌더링 문제에서 자유.
  - **React Query와 역할 분담**: 서버 상태는 React Query, 순수 클라이언트 상태(로그인 유저)는 Zustand로 명확히 분리.

</details>

- #### 도입 결과

  useAuthStore를 생성하여 AuthHydrator로 서버의 초기 사용자 정보를 주입하고, 프로필 수정 시 서버 액션 성공과 동시에 Zustand 스토어의 nickname도 즉시 업데이트하여 UI 반응성 향상.

---

### **5. React Hook Form & Zod**

- #### 도입 배경

  프로필 수정 폼과 댓글 폼을 초기에는 useState로 구현. 하지만 입력 필드가 많아지거나 유효성 검사(닉네임 길이, 댓글 내용 비어있는지) 로직이 추가되면서 onChange 핸들러와 onSubmit 함수 비대화, 상태 관리 코드 복잡화.

<details>
<summary><b>기술 선정 과정</b></summary>

- **useState (기존 방식)**: 상태(value), 에러 상태(error), 로딩 상태(isLoading) 등 useState 난립. 유효성 검사 로직이 View에 혼재.

- **React Hook Form & Zod**:
  - **관심사 분리**: 폼 상태 관리는 useForm에, 유효성 검사 규칙은 zod 스키마(schemas.ts)에 위임.
  - **성능**: 불필요한 리렌더링을 제어하여 폼 성능 최적화.
  - **유지보수성**: '닉네임 2자 이상' 같은 규칙 변경 시, 스키마 파일 한 곳만 수정으로 완료.

</details>

- #### 도입 결과

  모든 폼(프로필 수정, 새 댓글, 답글, 댓글 수정)을 useForm과 zodResolver로 리팩토링. 컴포넌트는 UI 렌더링에만 집중하고, 상태 및 유효성 검사 로직 분리하여 코드의 가독성과 안정성 확보.

---

### **6. Supabase & Prisma**

- #### 도입 배경

  개인 프로젝트에서 빠르고 안정적인 백엔드 구축 필요. 인증, 데이터베이스, 실시간 기능까지 제 공하는 BaaS(Backend as a Service) 고려.

<details>
<summary><b>기술 선정 과정</b></summary>

- **Firebase**: 인증, 실시간 DB는 강력하지만 NoSQL 기반이라 복잡한 관계형 데이터(댓글 계층 구조 등) 처리에 어려움.

- **Supabase**:
  - **PostgreSQL 기반**: RDB를 그대로 제공하여 SQL 쿼리 및 관계형 데이터 관리 유연.
  - **Prisma ORM 호환**: TypeScript 환경에서 타입 세이프하게 DB를 조작하기 위해 Prisma와 통합.
  - **인증 통합**: 카카오 로그인 등 소셜 로그인과 auth.users 테이블을 통한 인증 처리 간편.
  - **Database Triggers**: auth.users 가입 시 public.users에 프로필 자동 생성 등 DB 레벨 자동화 구현.

</details>

- #### 도입 결과

  Supabase로 인증과 DB 해결, Prisma를 ORM으로 사용하여 TypeScript 코드 내에서 타입 안정성 확보. (단, nickname 초기화 이슈 해결을 위해 DB Trigger 수정 - 트러블 슈팅 참고)


<br/><br/>

## 💡 주요 기능

### **☑️ 유저 관리**

- **카카오 로그인**: 카카오 계정을 통한 간편 로그인 및 users 테이블 자동 프로필 생성 (DB Trigger)
- **프로필 수정**: 사용자 닉네임 수정 기능
- **Zustand**: useAuthStore를 통해 로그인 상태 전역 관리
![KakaoTalk_20251124_221021225](https://github.com/user-attachments/assets/bb20a2cb-46ab-4fe3-8b09-77a80860743e)

<br/><br/>

### ☑️ 도서 정보 및 검색

- **메인 페이지**: 베스트셀러, 신간 추천, 리뷰 순위 등 도서 목록 제공 (RSC)
- **도서 검색**: 무한 스크롤 기반 실시간 책 검색 기능 (useInfiniteQuery)
- **도서 상세**: 책 소개, '좋아요/싫어요' 기능 (Server Shell + useQuery/useMutation)
  
![KakaoTalk_20251124_220946194](https://github.com/user-attachments/assets/6dcea0ef-47c5-48e5-8f65-dfd6023ef28e)

<br/><br/>

### **☑️ 읽은 책 기록**

- **기록 페이지**: /mypage/reviews에서 사용자의 읽은 책 목록 조회
- **기록 작성**: /mypage/reviews/new에서 새로운 읽은 책 기록 작성
- **책 검색 모달**: 무한 스크롤 방식의 모달 내 책 검색 기능 (use-debounce, useInfiniteQuery)
- **비정규화 구조**: 읽기 성능 최적화를 위해 reviews 테이블에 book_title, book_author, book_cover 중복 저장

  
![KakaoTalk_20251124_220917018](https://github.com/user-attachments/assets/1bc54585-b3f2-426a-aaf5-67eb67a47c44)

<br/><br/>

### **☑️ 댓글 및 토론 (Server Actions)**

- **댓글 CRUD**: 댓글 작성, 수정, 삭제 기능 (Server Actions)
- **계층형 댓글**: 대댓글(답글) 작성 기능
- **연쇄 Soft Delete**: 댓글 삭제 시 재귀 쿼리(CTE)를 통해 모든 자손 댓글까지 논리적 삭제
- **자동 갱신**: 서버 액션 성공 후 router.refresh()를 통해 댓글 목록 자동 업데이트
- **폼 유효성 검사**: react-hook-form + zod 적용
  
![KakaoTalk_20251124_221032921](https://github.com/user-attachments/assets/b421c3d4-5295-4b02-97bd-02ae869b05e8)
![KakaoTalk_20251124_220956179](https://github.com/user-attachments/assets/26c0b68f-8345-4fa6-a0a2-43de7e6359da)

<br/><br/>

### **☑️ 인증 및 접근 제어**

- **미들웨어 기반 보호**: middleware.ts에서 /mypage 등 인증이 필요한 경로에 대해 비로그인 사용자 접근 원천 차단
- **클라이언트 사이드 보호**: useAuthStore를 구독하여 API/액션 호출 전 인증 상태 확인
- **사용자 피드백**: 비로그인 상태에서 인증이 필요한 기능(좋아요, 댓글 등) 사용 시 토스트 알림과 함께 로그인 버튼 제공
- **통합 에러 처리**: 서버 액션이 { error: '...' } 객체 반환 시, 사용자에게 명확한 에러 메시지 표시

<br/><br/>

## 📈 성능 최적화

### **RSC & Streaming**

리팩토링 전, book/[id] (상세 페이지)는 모든 데이터를 useEffect와 fetch로 가져오는 단일 클라이언트 컴포넌트('use client'). 사용자는 책 정보, 좋아요, 댓글 목록 등 모든 API 요청이 완료될 때까지 로딩 스피너만 봐야 함 (LCP, TBT 성능 저하).

**해결 방법**:

1. **Server Shell 패턴**: app/book/[id]/page.tsx는 서버 컴포넌트(셸)로 변경. async로 빠른 데이터(책 정보, 좋아요)만 await로 가져와서 BookDetailClient 컴포넌트에 props로 전달.

2. **Streaming & Suspense**: 느린 데이터(댓글 목록)는 CommentListLoader.tsx라는 별도 서버 컴포넌트로 분리하고, page.tsx에서 React.Suspense로 감쌈.

3. **Skeleton UI**: Suspense의 fallback으로 CommentSkeleton.tsx를 제공하여, 댓글이 로드되는 동안 스켈레톤 UI 표시로 UX 향상.

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

---

### **next/image를 통한 이미지 최적화**

기존 `<img>` 태그를 Next.js의 `<Image>` 컴포넌트로 전면 교체하여 성능 개선:

- **CLS (Cumulative Layout Shift) 방지**: width/height 또는 fill prop으로 이미지 로드 전 공간 사전 확보로 레이아웃 밀림 현상 원천 차단.
- **자동 최적화**: WebP 변환, 자동 리사이징으로 데이터 사용량 감소 및 로딩 속도 향상.
- **지연 로딩**: priority prop 미사용 이미지는 뷰포트 밖일 시 자동 지연 로딩으로 초기 로딩 시간 단축.

---

### **무한 스크롤 기반 검색**

검색 페이지를 클라이언트 컴포넌트로 마이그레이션하고 useInfiniteQuery 도입:

- **useInfiniteQuery**: 페이지별 데이터 페칭 및 캐시 관리 자동화.
- **IntersectionObserver**: 스크롤 하단 감지 시 다음 페이지 자동 로드.
- **useSearchParams**: URL 검색 파라미터 변경을 실시간 감지하여 새로고침 없이 즉시 검색 갱신.

<br/><br/>

## 🎯 트러블 슈팅

### 1. 닉네임 저장 후 null로 초기화되는 현상

#### 문제 상황

/mypage/edit 페이지에서 닉네임을 성공적으로 저장(DB 저장 확인)해도, 잠시 후 (주로 새로고침 또는 재로그인 시) nickname이 다시 null로 초기화 버그 발생.

#### 원인 분석

- app/mypage/edit/actions.ts (서버 액션)는 public.users의 nickname을 잘 업데이트
- Supabase Trigger 목록 조회 결과, auth.users 테이블 변경 시 sync_user_from_auth 함수가 실행되는 트리거(on_auth_user_changed) 발견
- 해당 함수가 auth.users의 메타데이터(new.raw_user_meta_data->>'nickname')를 public.users로 덮어쓰는데, 로그인 시점의 auth.users 메타데이터에는 nickname이 null이었기 때문에 public.users의 nickname까지 null로 덮어쓰고 있었음.

#### 해결 방법

sync_user_from_auth DB 함수 코드를 수정. ON CONFLICT ... DO UPDATE 구문에서 nickname을 업데이트할 때, COALESCE 함수를 사용하여 auth.users에서 가져온 값이 null이면 기존 public.users.nickname 값을 유지하도록 변경.

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

### 2. 댓글/답글 UI가 즉시 갱신되지 않는 문제

#### 문제 상황

댓글 작성/수정/삭제 시 서버 액션(addComment 등)을 호출하고 revalidatePath도 실행했으나, UI가 새로고침(F5)을 해야만 갱신.

#### 원인 분석

- revalidatePath는 Next.js의 서버 데이터 캐시만 무효화
- CommentListClient 컴포넌트는 initialComments prop을 받아 useState (const [comments, setComments] = ...)에 저장하여 사용 중
- 서버 캐시가 갱신되어도, 이미 렌더링된 클라이언트 컴포넌트의 useState 변수는 자동으로 갱신 안 됨.

#### 해결 방법

router.refresh() 호출: 서버 액션 성공 시(result.success), next/navigation의 router.refresh()를 호출. router.refresh()는 서버 컴포넌트를 다시 실행하고, 업데이트된 props (initialComments)를 클라이언트 컴포넌트에 전달하여 useState를 갱신시킴 (소프트 리프레시). 대댓글의 경우 부모(CommentItem)의 loadReplies() 함수를 prop으로 받아 직접 호출하여 replies 상태를 즉시 갱신하여 UX 향상.

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

### 3. book_reactions 테이블의 isbn 불일치로 '좋아요' 목록 조회 실패

#### 문제 상황

마이페이지의 '좋아요' 목록이 'Unknown Title'로 표시됨.

#### 원인 분석

- book_reactions 테이블은 isbn10 또는 'K'로 시작하는 ID(Dirty ID)를 저장.
- books 테이블은 isbn13을 기본 키로 사용(Clean ID).
- 마이페이지 API가 book_reactions에서 가져온 isbn10 목록으로 books 테이블의 isbn13 컬럼을 조회하여 데이터 매칭 실패.

#### 해결 방법

API 조회 로직에 OR 쿼리를 적용하여 isbn13과 isbn10 두 컬럼 모두를 검색 조건에 포함.

```typescript
// app/api/likes/[type]/route.ts
const books = await prisma.books.findMany({
  where: {
    OR: [
      { isbn13: { in: likedIsbns } },
      { isbn10: { in: likedIsbns } },
    ],
  },
});
```

<br/>


### **4. 비로그인 사용자가 /mypage에 URL로 직접 접근 가능했던 문제**

#### 문제 상황

라우터 보호 없이 비로그인 사용자가 /mypage URL을 직접 입력하여 접근 가능하고, 비로그인 상태로 '좋아요', '댓글' 버튼 클릭 시 Unauthorized 에러가 노출되는 버그 발생.

#### 원인 분석

- middleware.ts에 인증 검사 로직이 없어 URL 직접 접근 원천 차단 미흡.
- 클라이언트 컴포넌트(BookDetailClient, CommentListClient 등)에서 useAuthStore를 확인하지 않고 즉시 API/액션을 호출하여, 비로그인 시 Unauthorized 에러가 사용자에게 노출.

#### 해결 방법

**서버 사이드 (middleware.ts)**: supabase.auth.getUser()로 사용자 인증 여부 확인 후, !user && /mypage인 경우 /login으로 리디렉션하여 URL 직접 접근 원천 차단.

**클라이언트 사이드 (컴포넌트)**: API/액션 호출 전에 useAuthStore에서 user 상태 확인. 비로그인이면 API 호출을 중단하고, sonner의 toast.error로 알림 및 로그인 버튼 제공.

```typescript
// 컴포넌트 예시 (BookDetailClient.tsx)
const { user, loading: authLoading } = useAuthStore();

const handleReactionClick = (reactionType: 'like' | 'dislike') => {
  if (authLoading) return;

  if (!user) {
    toast.error('로그인이 필요한 기능입니다.', {
      action: {
        label: '로그인',
        onClick: () => router.push('/login'),
      },
    });
    return;
  }

  toggleReaction(reactionType);
};
```

<br/>

### **5. 서버 액션의 에러 처리 및 사용자 피드백 개선**

#### 문제 상황

서버 액션에서 throw new Error 발생 시 클라이언트의 useTransition에서 에러를 명확하게 캐치하기 어렵고, 에러 메시지가 사용자에게 적절히 전달되지 않음.

#### 원인 분석

- throw 발생 시 try...catch로 감싸지 않으면 앱이 중단될 수 있음.
- 각 컴포넌트에서 별도의 에러 상태(submitError 등)를 useState로 관리하여 일관성 없는 에러 처리 발생.

#### 해결 방법

서버 액션이 throw Error 대신 { error: '...' } 객체를 반환하도록 통일. 클라이언트는 if (result.error)로 안전하게 에러를 받아 toast.error(result.error)로 전역 알림으로 표시하여 일관된 UX 제공.

```typescript
// app/(main)/book/[id]/actions.ts
export async function addComment(...) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: '로그인이 필요합니다.' }; // ⭐️ throw 대신 객체 반환
    }
    // ...
    return { success: true };
  } catch (err) {
    return { error: '댓글 작성 중 오류가 발생했습니다.' };
  }
}

// CommentListClient.tsx
const result = await addComment(...);
if (result.error) {
  toast.error(result.error); // ⭐️ 전역 토스트 알림
}
```

<br/><br/>

## 📁 폴더구조

```
📁 app (라우팅, 서버 컴포넌트, 서버 액션)
┣ 📁 (auth) (인증)
┃  ┣ 📁 auth
┃  ┃  ┗ 📁 callback
┃  ┃     ┗ 📄 route.ts
┃  ┗ 📁 signin
┃     ┗ 📄 page.tsx
┣ 📁 (main) (핵심 서비스)
┃  ┣ 📁 book
┃  ┃  ┗ 📁 [id]
┃  ┃     ┣ 📄 actions.ts     (댓글 CRUD 서버 액션)
┃  ┃     ┗ 📄 page.tsx       (서버 셸)
┃  ┣ 📁 mypage
┃  ┃  ┣ 📁 edit
┃  ┃  ┃  ┣ 📄 action.ts
┃  ┃  ┃  ┗ 📄 page.tsx
┃  ┃  ┣ 📁 likes
┃  ┃  ┃  ┗ 📁 [type]
┃  ┃  ┃     ┗ 📄 page.tsx
┃  ┃  ┣ 📁 reviews
┃  ┃  ┃  ┣ 📄 actions.ts     (읽은 책 기록 서버 액션)
┃  ┃  ┃  ┣ 📁 new
┃  ┃  ┃  ┃  ┗ 📄 page.tsx    (기록 작성 페이지)
┃  ┃  ┃  ┗ 📄 page.tsx       (기록 목록 페이지)
┃  ┃  ┗ 📄 page.tsx
┃  ┣ 📁 search
┃  ┃  ┗ 📄 page.tsx          (클라이언트 컴포넌트, useInfiniteQuery)
┃  ┗ 📄 page.tsx             (홈페이지)
┣ 📁 api
┃  ┣ 📁 book
┃  ┃  ┣ 📄 route.ts                  (통합 도서 목록 API, sort 쿼리)
┃  ┃  ┣ 📁 bookdetail
┃  ┃  ┃  ┗ 📄 route.ts
┃  ┃  ┗ 📁 [bookId]
┃  ┃     ┣ 📁 comments
┃  ┃     ┃  ┗ 📄 route.ts    (GET 핸들러 - 답글 조회용)
┃  ┃     ┗ 📁 reaction
┃  ┃        ┗ 📄 route.ts
┃  ┣ 📁 likes
┃  ┃  ┗ 📁 [type]
┃  ┃     ┗ 📄 route.ts
┃  ┣ 📁 search
┃  ┃  ┗ 📄 route.ts
┃  ┗ 📁 user
┃     ┗ 📄 route.ts
┣ 📁 auth
┃  ┗ 📄 action.ts
┣ 📄 layout.tsx
┗ 📄 globals.css

📁 components (클라이언트 컴포넌트)
┣ 📄 AuthHydrator.tsx
┣ 📁 book
┃  ┗ 📄 ...
┣ 📁 layout
┃  ┣ 📄 header.tsx
┃  ┗ 📄 footer.tsx
┣ 📁 mypage
┃  ┗ 📄 BookSearchModal.tsx  (무한 스크롤 책 검색 모달)
┣ 📁 providers
┃  ┗ 📄 QueryProvider.tsx
┣ 📁 ui
┃  ┣ 📄 Button.tsx
┃  ┗ 📄 Input.tsx
┣ 📄 Section.tsx
┣ 📄 SearchInput.tsx
┣ 📄 ProfileEditForm.tsx
┗ 📄 KakaoLogoutButton.tsx

📁 lib (핵심 로직 및 설정)
┣ 📁 auth
┃  ┗ 📄 server.ts
┣ 📁 supabase
┃  ┗ 📄 server.ts
┣ 📄 fetchers.ts
┣ 📄 prisma.ts
┣ 📄 schemas.ts        (Zod 유효성 검사 스키마)
┗ 📄 supabase.ts

📁 stores (Zustand 전역 상태)
┣ 📄 authStore.ts
┗ 📄 modalStore.ts

📁 types (TypeScript 타입 정의)
┣ 📄 book.ts
┗ 📄 comment.ts

📁 middleware.ts (라우트 보호, 인증 검사)
```
---
## 배포주소
https://bookmomento-next.vercel.app/
