import { KakaoLogoutButton } from '@/components/KakaoLogoutButton';
import { getUserServer, requireUserServer } from '@/lib/auth/server';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
  // const user = await getUserServer();
  const user = await requireUserServer('/mypage');
  console.log(user);

  return (
    <div>
      <div>마이페이지 내용이 여기에 들어갑니다.</div>
      <KakaoLogoutButton />
    </div>
  );
}
