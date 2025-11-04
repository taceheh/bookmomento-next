'use client';

import { create } from 'zustand';

type ReviewModalState = {
  isBookSearchModalOpen: boolean;
  openBookSearchModal: () => void;
  closeBookSearchModal: () => void;
};

export const useReviewModalStore = create<ReviewModalState>((set) => ({
  isBookSearchModalOpen: false,
  openBookSearchModal: () => set({ isBookSearchModalOpen: true }),
  closeBookSearchModal: () => set({ isBookSearchModalOpen: false }),
}));
