import Link from 'next/link';
import { SearchBar } from './SearchBar';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition">
          Blog
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/categories/TECH" className="text-gray-600 hover:text-gray-900 text-sm">技術</Link>
          <Link href="/categories/DIARY" className="text-gray-600 hover:text-gray-900 text-sm">日記</Link>
          <Link href="/categories/REVIEW" className="text-gray-600 hover:text-gray-900 text-sm">レビュー</Link>
        </nav>
        <SearchBar />
      </div>
    </header>
  );
}
