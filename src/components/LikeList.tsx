'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LikeList({ type }: { type: 'posts' | 'comments' }) {
  const endpoint = `/api/likes/${type}`;
  const { data, error, isLoading } = useSWR(endpoint, fetcher);

  // 디버깅을 위한 콘솔 로그
  console.log('API Response:', { data, error, isLoading });

  if (isLoading) return <div>불러오는 중...</div>;
  if (error)
    return <div>에러가 발생했습니다: {error.message || '알 수 없는 오류'}</div>;

  // data가 배열이 아닌 경우 처리
  if (!data) {
    return <div>데이터를 불러올 수 없습니다.</div>;
  }

  // data가 에러 객체인 경우
  if (data.error) {
    return <div>API 오류: {data.error}</div>;
  }

  // data가 배열이 아닌 경우
  if (!Array.isArray(data)) {
    return <div>잘못된 데이터 형식입니다. (받은 데이터: {typeof data})</div>;
  }

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
    <ul className="space-y-4">
      {data.map((item: any) => (
        <li key={item.id} className="border p-4 rounded">
          {type === 'posts' ? (
            <div>
              <div className="font-bold">{item.title}</div>
              <div className="text-sm text-gray-600">{item.author}</div>
            </div>
          ) : (
            <div>
              <div className="text-sm">{item.body}</div>
              <div className="text-xs text-gray-500">
                작성일: {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
