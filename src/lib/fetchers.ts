// src/lib/fetchers.ts (예시 - 없다면 page.tsx 상단에)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getBestSellers() {
  const res = await fetch(`${BASE_URL}/api/book/bestseller`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getNewBooks() {
  const res = await fetch(`${BASE_URL}/api/book/brendnew`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  return res.json();
}

async function getReviewRanking() {
  const res = await fetch(`${BASE_URL}/api/book/most-commented`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const { items } = await res.json();
  return items
    .filter((it: any) => it.book)
    .map((it: any) => ({
      isbn: it.isbn,
      title: it.book.title,
      cover: it.book.cover,
    }));
}

async function getLikeRanking() {
  // ... (getReviewRanking과 동일한 로직)
  const res = await fetch(`${BASE_URL}/api/book/most-liked`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const { items } = await res.json();
  return items
    .filter((it: any) => it.book)
    .map((it: any) => ({
      isbn: it.isbn,
      title: it.book.title,
      cover: it.book.cover,
    }));
}
