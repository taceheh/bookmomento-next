'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewFormData } from '@/lib/schemas';
import { addReview } from '@/app/(main)/mypage/reviews/actions';
import { useReviewModalStore } from '@/stores/modalStore';
import { BookSearchModal } from '@/components/mypage/BookSearchModal';

type Book = {
  isbn13: string;
  title: string;
  cover: string;
};

export default function NewReviewPage() {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { openBookSearchModal } = useReviewModalStore();

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
      reset();
      setSelectedBook(null);
      router.push('/mypage/reviews');
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <Link
          href="/mypage/reviews"
          className="text-gray-600 hover:text-gray-900"
        >
          &larr; 내 기록 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-xl w-full z-10 overflow-hidden border">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">읽은 책 기록하기</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2">
            <strong className="text-lg">1. 책 선택하기</strong>
            {selectedBook ? (
              <div className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                <Image
                  src={selectedBook.cover}
                  alt={selectedBook.title}
                  width={60}
                  height={90}
                  className="rounded object-cover shadow-sm"
                  unoptimized
                />
                <div className="flex flex-col justify-center">
                  <h3 className="font-medium">{selectedBook.title}</h3>
                  <button
                    type="button"
                    onClick={() => openBookSearchModal()}
                    className="text-sm text-blue-500 hover:underline mt-1 text-left"
                  >
                    (책 변경하기)
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openBookSearchModal()}
                className="w-full p-3 border-2 border-dashed rounded-lg text-blue-600 hover:bg-blue-50"
              >
                + 책 검색하기
              </button>
            )}
            <input type="hidden" {...register('book_isbn')} />
            {errors.book_isbn && (
              <p className="text-red-500 text-sm">{errors.book_isbn.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <strong className="text-lg">2. 소감 작성하기</strong>
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

          <div className="flex justify-end items-center pt-4 border-t">
            {formError && (
              <p className="text-red-500 text-sm mr-auto">{formError}</p>
            )}
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

      <BookSearchModal onBookSelect={handleBookSelect} />
    </section>
  );
}
