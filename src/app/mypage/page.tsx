import { getUserServer } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const user = await getUserServer();
  console.log(user);

  return <div>마이페이지 내용이 여기에 들어갑니다.</div>;
}
