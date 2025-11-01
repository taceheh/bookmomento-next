'use client';

import { useModalStore } from '@/stores/modalStore'; // (경로 확인)

export function AddReviewButton() {
  const { openAddReviewModal } = useModalStore();

  return <button onClick={openAddReviewModal}>+ 읽은 책 기록하기</button>;
}
