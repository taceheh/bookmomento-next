import KakaoLoginButton from '@/components/KakaoLoginButton';
import Image from 'next/image';
import Link from 'next/link';

export default function Page() {
  return (
    <section className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center bg-gray-50 p-4">
      <div className="flex w-full max-w-sm flex-col items-center space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-800">로그인하고</h1>
          <h2 className="text-2xl font-bold text-gray-800">
            나만의 책 기록을 시작해 보세요.
          </h2>
        </div>
        <KakaoLoginButton />
        <Link
          href="/"
          className="text-sm text-gray-600 underline underline-offset-4 transition-colors hover:text-gray-900"
        >
          로그인 없이 둘러보기
        </Link>
        <p className="text-center text-xs text-gray-500">
          로그인 시 서비스의 이용약관 과 개인정보처리방침에
          <br />
          동의하는 것으로 간주합니다.
        </p>
      </div>
    </section>
  );
}
