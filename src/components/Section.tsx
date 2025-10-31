import Link from 'next/link';
import { Book } from '@/types/book';
import Image from 'next/image';

interface SectionProps {
  title: string;
  books: Book[];
  emptyText?: string;
}

export default function Section({ title, books, emptyText }: SectionProps) {
  return (
    <section className="space-y-2 pb-10">
      <h2 className="text-lg font-bold">{title}</h2>

      {books.length === 0 ? (
        <div className="text-sm text-gray-500 py-6">
          {emptyText ?? '표시할 항목이 없습니다.'}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4 h-40">
          {books.map((book) => (
            <Link href={`/book/${book.isbn}`} key={book.isbn}>
              {/* <img className="w-30 h-40" src={book.cover} alt="book cover" /> */}
              <Image
                src={book.cover}
                alt={book.title}
                width={100}
                height={140}
                className="w-30 h-40 object-cover "
                unoptimized
              />
              <div className="text-sm pt-2 line-clamp-2">{book.title}</div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
