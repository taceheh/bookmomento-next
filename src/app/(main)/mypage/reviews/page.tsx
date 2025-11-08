import Image from 'next/image';
import Link from 'next/link';
import { getMyReviews } from './actions';

export default async function ReviewsPage() {
  const myReviews = await getMyReviews();

  return (
    <section className="w-full max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">내가 읽은 책 기록</h2>
        <Link
          href="/mypage/reviews/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          + 읽은 책 기록하기
        </Link>
      </div>

      <hr className="my-6" />

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">
          내 기록 목록 ({myReviews.length}권)
        </h3>
        {myReviews.length === 0 && (
          <p className="text-gray-500">아직 기록이 없습니다.</p>
        )}
        <ul className="space-y-4">
          {myReviews.map((review) => (
            <li
              key={review.id}
              className="flex gap-4 p-4 border rounded-lg shadow-sm"
            >
              <Link href={`/book/${review.book_isbn}`}>
                <Image
                  src={review.book_cover || '/default-cover.png'}
                  alt={review.book_title}
                  width={80}
                  height={120}
                  className="rounded object-cover flex-shrink-0"
                  unoptimized
                />
              </Link>
              <div className="flex flex-col">
                <Link
                  href={`/book/${review.book_isbn}`}
                  className="hover:underline"
                >
                  <strong className="text-lg">{review.book_title}</strong>
                </Link>
                <p className="text-sm text-gray-600">{review.book_author}</p>
                <p className="mt-2 text-gray-700 italic">
                  &quot;{review.review}&quot;
                </p>
                <time className="text-sm text-gray-500 mt-auto pt-2">
                  {new Date(review.created_at).toLocaleDateString()}
                </time>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
