'use client';

import LikeList from '@/components/LikeList';
import { use } from 'react';

export default function Page({
  params,
}: {
  params: { type: 'posts' | 'comments' };
}) {
  const { type } = params;

  if (type !== 'posts' && type !== 'comments') {
    return <div>잘못된 접근입니다.</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-lg font-bold mb-4">
        {type === 'posts' ? '내가 좋아요한 책' : '내가 작성한 댓글'}
      </h1>

      <LikeList type={type} />
    </div>
  );
}
