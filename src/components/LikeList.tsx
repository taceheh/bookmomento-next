'use client';

import { useAuthStore } from '@/stores/authStore';
import useSWR from 'swr';
import Button from './ui/Button';
import Image from 'next/image';

const fetcher = async (url: string) => {
  // console.log('Fetching:', url);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return data;
};

export default function LikeList({ type }: { type: 'posts' | 'comments' }) {
  const { user, loading: authLoading } = useAuthStore();

  const endpoint = user?.id ? `/api/likes/${type}?userId=${user.id}` : null;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (authLoading) {
    return <div>인증 확인 중...</div>;
  }

  if (!user?.id) {
    return <div>로그인이 필요합니다.</div>;
  }

  if (isLoading) {
    return (
      <div>
        <div>불러오는 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="text-red-500">에러가 발생했습니다:</div>
        <div className="text-sm text-red-400">{error.message}</div>
        <Button onClick={() => mutate()} variant="primary" className="mt-2">
          다시 시도
        </Button>
      </div>
    );
  }

  // 데이터 없음
  if (!data || data.error) {
    return (
      <div>
        <div>데이터를 불러올 수 없습니다.</div>
        {data?.error && (
          <div className="text-sm text-red-400">{data.error}</div>
        )}
        <Button onClick={() => mutate()} variant="ghost" size="sm">
          새로고침
        </Button>
      </div>
    );
  }

  if (!Array.isArray(data)) {
    return (
      <div>
        <div>잘못된 데이터 형식입니다.</div>
        <Button onClick={() => mutate()} variant="ghost" size="sm">
          새로고침
        </Button>
      </div>
    );
  }

  // 빈 데이터
  if (data.length === 0) {
    return (
      <div>
        {type === 'posts'
          ? '아직 좋아요한 책이 없습니다.'
          : '아직 작성한 댓글이 없습니다.'}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-500">총 {data.length}개</span>
        <Button onClick={() => mutate()} variant="ghost" size="sm">
          새로고침
        </Button>
      </div>

      <ul className="space-y-4">
        {data.map((item: any) => (
          <li key={item.id} className="border p-4 rounded-lg">
            {type === 'posts' ? (
              <div>
                <div className="font-bold text-lg mb-1">{item.title}</div>
                <div className="text-sm text-gray-600 mb-2">{item.author}</div>
                {item.cover && (
                  <Image
                    src={item.cover}
                    alt={item.title}
                    width={64}
                    height={96}
                    className="w-16 h-24 object-cover"
                    unoptimized
                  />
                  // <img
                  //   src={item.cover}
                  //   alt={item.title}
                  //   className="w-16 h-24 object-cover"
                  // />
                )}
                <div className="text-xs text-gray-400 mt-2">
                  좋아요한 날짜: {new Date(item.likedAt).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2">{item.body}</div>
                <div className="text-xs text-gray-500">
                  작성일: {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
