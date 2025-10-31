'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '@/lib/schemas';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { updateUserNickname } from '@/app/(main)/mypage/edit/action';

interface ProfileEditFormProps {
  initialNickname: string;
  email: string;
}

export default function ProfileEditForm({
  initialNickname,
  email,
}: ProfileEditFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { setUser, user: currentUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nickname: initialNickname },
  });

  const onValidSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    const formData = new FormData();
    formData.append('nickname', data.nickname);

    startTransition(async () => {
      const result = await updateUserNickname(formData);

      if (result?.error) {
        setServerError(result.error);
      } else if (result?.success) {
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            nickname: data.nickname,
          };
          setUser(updatedUser);
        }

        alert(result.message || '닉네임이 성공적으로 변경되었습니다.');
        router.refresh(); // 서버 데이터 갱신도 함께 수행
      } else {
        setServerError('알 수 없는 오류가 발생했습니다.');
      }
    });
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
          disabled={isPending || !isDirty}
          isLoading={isPending}
          loadingText="저장 중..."
        >
          회원정보 저장
        </Button>
      </div>
    </form>
  );
}
