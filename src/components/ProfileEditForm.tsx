'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from './ui/Button';
import Input from './ui/Input';

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

  const [nickname, setNickname] = useState(initialNickname);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // 클라이언트 측 기본 검증
    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    if (nickname === initialNickname) {
      setError('변경사항이 없습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '닉네임 변경에 실패했습니다.');
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/mypage');
        router.refresh();
      }, 2000);
    } catch (err) {
      console.error('요청 에러:', err);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
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
        <Input type="email" value={email} disabled fullWidth />
        <p className="mt-1 text-xs text-gray-500">
          카카오 로그인으로 가입하여 변경할 수 없습니다.
        </p>
      </div>

      {/* 닉네임 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          닉네임
        </label>
        <Input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임을 입력하세요"
          maxLength={20}
          fullWidth
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
        <Button
          type="button"
          onClick={() => router.back()}
          variant="secondary"
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          loadingText="저장 중..."
          className="flex-1"
        >
          저장하기
        </Button>
      </div>
    </form>
  );
}
