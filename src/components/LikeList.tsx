'use client';

import { useAuthStore } from '@/stores/authStore';
import useSWR from 'swr';
import Button from './ui/Button';

const fetcher = async (url: string) => {
  // console.log('Fetching:', url);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  // console.log('📦 Data:', data);
  return data;
};

export default function LikeList({ type }: { type: 'posts' | 'comments' }) {
  // 스토어에서 직접 사용자 정보 가져오기
  const { user, loading: authLoading } = useAuthStore();

  // API 엔드포인트 - 사용자 ID를 URL에 포함
  const endpoint = user?.id ? `/api/likes/${type}?userId=${user.id}` : null;

  const { data, error, isLoading, mutate } = useSWR(endpoint, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  // 인증 로딩 중
  if (authLoading) {
    return <div>인증 확인 중...</div>;
  }

  // 로그인 안 됨
  if (!user?.id) {
    return <div>로그인이 필요합니다.</div>;
  }

  // API 로딩 중
  if (isLoading) {
    return (
      <div>
        <div>불러오는 중...</div>
      </div>
    );
  }

  // 에러 발생
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

  // 잘못된 데이터 형식
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

  // 데이터 표시
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
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-16 h-24 object-cover"
                  />
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
