'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModalStore } from '@/stores/modalStore';
import { reviewSchema, type ReviewFormData } from '@/lib/schemas';
import { addReview } from '@/app/(main)/mypage/reviews/actions';
import SearchInput from '../SearchInput';

type Book = {
  isbn13: string;
  title: string;
  cover: string;
};

export function AddReviewModal() {
  const { isAddReviewModalOpen, closeAddReviewModal } = useModalStore();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      book_isbn: '',
      review: '',
    },
  });

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setValue('book_isbn', book.isbn13, { shouldValidate: true });
  };

  const onSubmit = async (data: ReviewFormData) => {
    setFormError(null);
    const formData = new FormData();
    formData.append('book_isbn', data.book_isbn);
    formData.append('review', data.review);

    const result = await addReview(formData);

    if (result.error) {
      setFormError(result.error);
    } else if (result.success) {
      handleClose();
    }
  };

  const handleClose = () => {
    reset();
    setSelectedBook(null);
    setFormError(null);
    closeAddReviewModal();
  };

  if (!isAddReviewModalOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl z-50 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">읽은 책 기록하기</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-800 text-2xl"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {!selectedBook && (
            <div className="space-y-2">
              <strong className="text-lg">1. 책 이름으로 검색</strong>
              {/* <SearchInput searchType="title" onBookSelect={handleBookSelect} /> */}
              <p className="text-sm text-gray-500">
                <SearchInput initialQuery={selectedBook ?? ''} />
                {/* (SearchInput 컴포넌트를 여기에 연결하세요) */}
              </p>
              <input
                placeholder="임시 책 제목 검색"
                onChange={(e) => {
                  /* 임시 검색 로직 */
                }}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                className="p-2 bg-gray-200 rounded"
                onClick={() =>
                  handleBookSelect({
                    isbn13: '1234567890123',
                    title: '테스트용 책',
                    cover: 'https://placehold.co/80x120',
                  })
                }
              >
                임시 책 선택
              </button>
              {errors.book_isbn && (
                <p className="text-red-500 text-sm">
                  {errors.book_isbn.message}
                </p>
              )}
            </div>
          )}

          {selectedBook && (
            <div className="space-y-4">
              <strong className="text-lg">2. 소감 작성하기</strong>
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <Image
                  src={selectedBook.cover}
                  alt={selectedBook.title}
                  width={60}
                  height={90}
                  className="rounded object-cover shadow-sm"
                />
                <div className="flex flex-col justify-center">
                  <h3 className="font-medium">{selectedBook.title}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBook(null);
                      setValue('book_isbn', '', { shouldValidate: true });
                    }}
                    className="text-sm text-red-500 hover:underline mt-1"
                  >
                    (책 선택 취소)
                  </button>
                </div>
              </div>
              <input type="hidden" {...register('book_isbn')} />
              <textarea
                {...register('review')}
                placeholder="책에 대한 소감을 10자 이상 남겨주세요."
                rows={5}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.review && (
                <p className="text-red-500 text-sm">{errors.review.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end items-center pt-4 border-t">
            {formError && (
              <p className="text-red-500 text-sm mr-auto">{formError}</p>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 rounded-lg mr-2 hover:bg-gray-100"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!selectedBook || isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
