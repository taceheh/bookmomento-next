'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface ProfileEditFormProps {
  userId: string;
  initialNickname: string;
  email: string;
}

export default function ProfileEditForm({
  userId,
  initialNickname,
  email,
}: ProfileEditFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [nickname, setNickname] = useState(initialNickname);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

    if (nickname === initialNickname) {
      setError('변경사항이 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // users 테이블 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({ nickname: nickname.trim() })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess(true);

      // 2초 후 마이페이지로 이동
      setTimeout(() => {
        router.push('/mypage');
        router.refresh(); // 서버 컴포넌트 새로고침
      }, 2000);
    } catch (err) {
      console.error('업데이트 에러:', err);
      setError('닉네임 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
