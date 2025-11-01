import { create } from 'zustand';

type ModalState = {
  isAddReviewModalOpen: boolean;
  openAddReviewModal: () => void;
  closeAddReviewModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  isAddReviewModalOpen: false,
  openAddReviewModal: () => set({ isAddReviewModalOpen: true }),
  closeAddReviewModal: () => set({ isAddReviewModalOpen: false }),
}));
