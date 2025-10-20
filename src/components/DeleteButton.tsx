// components/DeleteAccountButton.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountButton({
  className = '',
}: {
  className?: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '정말로 회원탈퇴하시겠습니까?\n\n' +
        '- 작성한 댓글은 "탈퇴한 회원"으로 표시됩니다\n' +
        '- 좋아요 기록은 모두 삭제됩니다\n' +
        '- 이 작업은 되돌릴 수 없습니다',
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/user', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('회원탈퇴 실패');
      }

      alert('회원탈퇴가 완료되었습니다.');
      router.push('/');
    } catch (error) {
      alert('회원탈퇴 중 오류가 발생했습니다.');
      console.error('Delete account error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDeleteAccount}
      disabled={isDeleting}
      className={`px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded disabled:opacity-50 ${className}`}
    >
      {isDeleting ? '탈퇴 처리 중...' : '회원탈퇴'}
    </button>
  );
}
