'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="記事を検索..."
        className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded-l focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-r hover:bg-blue-700"
      >
        検索
      </button>
    </form>
  );
}
