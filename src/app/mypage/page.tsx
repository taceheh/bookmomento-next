import { KakaoLogoutButton } from '@/components/KakaoLogoutButton';
import { getUserServer, requireUserServer } from '@/lib/auth/server';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // const user = await getUserServer();
  const user = await requireUserServer('/mypage');
  console.log(user);

  return (
    <div>
      <div>
        <div
          className="border-b-2 font-semibold border-black flex h-14
         items-center"
        >
          나의 책담 정보
        </div>
        <Link href="/mypage/likes/comments">
          <div
            className="border-b border-[#DBDBDB] flex h-12
          items-center text-sm"
          >
            내가 작성한 댓글
          </div>
        </Link>
        <Link href="/mypage/likes/posts">
          <div
            className="border-b border-[#DBDBDB] flex h-12
         items-center text-sm"
          >
            내가 좋아요한 책
          </div>
        </Link>
      </div>
      <div>
        <div
          className="border-b-2 font-semibold  border-black flex h-14
         items-center mt-4"
        >
          나의 계정 정보
        </div>
        <Link href="/mypage/edit">
          <div
            className="border-b border-[#DBDBDB] flex h-12
         items-center text-sm"
          >
            회원정보 수정
          </div>
        </Link>
        <KakaoLogoutButton />
        <div className="font-light text-xs flex justify-center m-4">
          회원탈퇴
        </div>
      </div>
    </div>
  );
}
