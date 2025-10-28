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
      nickname: initialNickname,
    },
  });

  const onValidSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    try {
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
      alert('닉네임이 성공적으로 변경되었습니다.');
      router.refresh();
    } catch (error: any) {
      setServerError(error.message);
    }
  };

  return (
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
          disabled
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
          {...register('nickname')}
          error={errors.nickname?.message}
        />
      </div>

      {serverError && <p className="text-sm text-red-600">{serverError}</p>}

      <div>
        <Button
          type="submit"
          size="full"
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
