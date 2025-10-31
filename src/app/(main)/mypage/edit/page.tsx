import ProfileEditForm from '@/components/ProfileEditForm';
import { requireUserServer, getUserDataServer } from '@/lib/auth/server';

export const dynamic = 'force-dynamic';

export default async function ProfileEditPage() {
  const user = await requireUserServer('/mypage/edit');
  const userData = await getUserDataServer(user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            회원정보 수정
          </h1>

          <ProfileEditForm
            initialNickname={userData?.nickname || ''}
            email={userData?.email || user.email || ''}
          />
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            ℹ️ 안내사항
          </h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• 카카오 계정으로 로그인하여 이메일은 변경할 수 없습니다.</li>
            <li>• 닉네임은 언제든지 변경 가능합니다.</li>
            <li>• 변경된 닉네임은 모든 댓글에 즉시 반영됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
