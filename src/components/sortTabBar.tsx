'use client';

import { Bell, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const tab = ['베스트셀러', '신간추천', '리뷰 순위', '좋아요 순위'];

export const SortTabBar = () => {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearchClick = () => {
    if (searching && query) {
      console.log('검색 실행:', query);
    }
    setSearching(true);
  };

  return (
    <nav className="relative h-10 flex justify-between items-center border-b-2 border-black px-4 text-sm">
      <Search className="w-5 cursor-pointer" onClick={handleSearchClick} />

      {searching && (
        <div className="absolute top-[0.5] left-0 flex items-center border border-gray-300 bg-white px-2 py-1 z-50 w-40 shadow">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="검색어 입력"
            className="bg-transparent outline-none w-full text-sm text-black"
          />
          <Link href={`/search?q=${query}`}>
            <Search
              className="w-4 ml-2 cursor-pointer"
              onClick={handleSearchClick}
            />
          </Link>
        </div>
      )}

      <div className="flex justify-center items-center">
        {tab.map((name) => (
          <div className="px-4 whitespace-nowrap" key={name}>
            {name}
          </div>
        ))}
      </div>

      <div className="flex items-center">
        <Bell className="w-5" />
        <Link href="/mypage" prefetch={false} aria-label="마이페이지">
          <UserRound className="w-5 ml-4" />
        </Link>
      </div>
    </nav>
  );
};
