'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/lib/schemas';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty }, // isDirty: 수정 여부
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: initialNickname, // ⭐️ 폼의 기본값 설정
    },
  });

  // ⭐️ 폼 유효성 검사 통과 시 실행될 함수
  const onValidSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    try {
      // ⭐️ 나중에 '서버 액션'으로 바꿀 부분입니다. (Day 2)
      // ⭐️ (PR 템플릿에 있던 /api/user PATCH를 임시로 사용)
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: data.nickname }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.error || '닉네임 변경에 실패했습니다.');
      }

      // 성공 시
      alert('닉네임이 성공적으로 변경되었습니다.'); // (나중에 더 좋은 UI로 변경)
      router.refresh(); // ⭐️ 서버 데이터를 새로고침 (페이지 리로드 X)
    } catch (error: any) {
      setServerError(error.message);
    }
  };

  return (
    // ⭐️ handleSubmit이 onValidSubmit을 호출
    <form onSubmit={handleSubmit(onValidSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          이메일 (변경 불가)
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled // ⭐️ 비활성화
          fullWidth
          className="mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="nickname"
          className="block text-sm font-medium text-gray-700"
        >
          닉네임
        </label>
        <Input
          id="nickname"
          fullWidth
          className="mt-1"
          // ⭐️ RHF의 register 함수로 Input 등록
          {...register('nickname')}
          // ⭐️ Zod가 감지한 에러 메시지를 Input의 error prop으로 전달
          error={errors.nickname?.message}
        />
      </div>

      {/* ⭐️ 서버 측 에러가 발생하면 표시 */}
      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div>
        <Button
          type="submit"
          size="full"
          // ⭐️ isSubmitting: API 요청 중일 때
          // ⭐️ !isDirty: 폼이 수정되지 않았을 때
          disabled={isSubmitting || !isDirty}
          isLoading={isSubmitting}
          loadingText="저장 중..."
        >
          회원정보 저장
        </Button>
      </div>
    </form>
  );
}
