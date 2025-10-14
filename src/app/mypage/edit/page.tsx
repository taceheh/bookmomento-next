// app/mypage/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Page() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [nickname, setNickname] = useState('');
  const [currentNickname, setCurrentNickname] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 현재 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // users 테이블에서 정보 가져오기
      const { data: userData } = await supabase
        .from('users')
        .select('nickname, email')
        .eq('id', user.id)
        .single();

      if (userData) {
        setNickname(userData.nickname || '');
        setCurrentNickname(userData.nickname || '');
        setEmail(userData.email || user.email || '');
      }
    };

    fetchUserInfo();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 유효성 검사
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname.length < 2) {
      setError('닉네임은 최소 2글자 이상이어야 합니다.');
      return;
    }

    if (nickname.length > 20) {
      setError('닉네임은 최대 20글자까지 가능합니다.');
      return;
    }

    if (nickname === currentNickname) {
      setError('변경사항이 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('로그인이 필요합니다.');
        return;
      }

      // users 테이블 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({
          nickname: nickname.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(true);
      setCurrentNickname(nickname);

      // 2초 후 마이페이지로 이동
      setTimeout(() => {
        router.push('/mypage');
      }, 2000);
    } catch (err) {
      console.error('업데이트 에러:', err);
      setError('닉네임 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-md rounded-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            회원정보 수정
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이메일
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                카카오 로그인으로 가입하여 변경할 수 없습니다.
              </p>
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                닉네임
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="닉네임을 입력하세요"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                maxLength={20}
              />
              <p className="mt-1 text-xs text-gray-500">
                2-20자 사이로 입력해주세요.
              </p>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* 성공 메시지 */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                닉네임이 성공적으로 변경되었습니다! 🎉
              </div>
            )}

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
              >
                {isLoading ? '저장 중...' : '저장하기'}
              </button>
            </div>
          </form>
        </div>

        {/* 추가 정보 */}
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
