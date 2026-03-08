import Link from 'next/link';

const colorMap: Record<string, string> = {
  TECH: 'bg-blue-100 text-blue-700',
  DIARY: 'bg-green-100 text-green-700',
  REVIEW: 'bg-purple-100 text-purple-700',
};

export function CategoryBadge({ code, name }: { code: string; name: string }) {
  return (
    <Link
      href={`/categories/${code}`}
      className={`px-2 py-0.5 rounded text-xs font-medium ${colorMap[code] || 'bg-gray-100 text-gray-700'}`}
    >
      {name}
    </Link>
  );
}
