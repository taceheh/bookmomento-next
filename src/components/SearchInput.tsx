// src/components/search/SearchInput.tsx
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Input from '@/components/ui/Input';

interface SearchInputProps {
  initialQuery: string;
}

export default function SearchInput({ initialQuery }: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className=" flex border border-gray-300 bg-white px-2 py-2 w-[80%] m-auto mt-10 mb-2">
      <Input
        type="text"
        value={query} // 로컬 state와 연결
        onChange={handleChange} // 로컬 state 변경
        placeholder="검색어 입력"
        fullWidth
        className="bg-transparent text-sm"
      />
      {/* Link가 query state를 사용해 동적으로 URL 생성 */}
      <Link href={`/search?q=${query}`}>
        <Search className="w-4 ml-2 cursor-pointer" />
      </Link>
    </div>
  );
}
