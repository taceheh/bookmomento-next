// app/auth/auth-code-error/page.tsx

import Link from 'next/link';

export default async function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const sp = await searchParams; // ← 반드시 await
  const reason = sp.reason ?? '인증 과정에서 오류가 발생했습니다';
  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-xl font-bold">로그인 실패</h1>
      <p className="text-sm text-gray-600">{reason}</p>
      <div className="space-x-2">
        <Link href="/signin" className="underline">
          다시 시도
        </Link>
        <Link href="/" className="underline">
          홈으로
        </Link>
      </div>
    </main>
  );
}
