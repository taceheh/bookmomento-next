import Image from 'next/image';
import Link from 'next/link';

import { getMyReviews } from './actions';

export default async function ReadBooksPage() {
  const myReviews = await getMyReviews();

  return (
    <section>
      <h2>내가 읽은 책 기록</h2>

      <hr />

      <h3>내 기록 목록 ({myReviews.length}권)</h3>
      <div>
        {myReviews.length === 0 && <p>아직 기록이 없습니다.</p>}

        {myReviews.map((review) => (
          <div key={review.id}>
            {review.books && (
              <Link href={`/book/${review.books.isbn13}`}>
                <Image
                  src={review.books.cover || '/default-cover.png'}
                  alt={review.books.title}
                  width={80}
                  height={120}
                />
                <strong>{review.books.title}</strong>
              </Link>
            )}
            <p>{review.review}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
