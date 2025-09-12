'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LikeList({ type }: { type: 'posts' | 'comments' }) {
  const endpoint = `/api/likes/${type}`;
  const { data, error, isLoading } = useSWR(endpoint, fetcher);

  if (isLoading) return <div>불러오는 중...</div>;
  if (error) return <div>에러가 발생했습니다.</div>;
  if (!data || data.length === 0)
    return (
      <div>
        {type === 'posts'
          ? '아직 좋아요한 책이 없습니다.'
          : '아직 작성한 댓글이 없습니다.'}
      </div>
    );

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
