'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Pagination as PaginationType } from '@/types';

export function Pagination({ pagination, basePath }: { pagination: PaginationType; basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(pagination.totalItems / pagination.itemsPerPage) || 1;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${basePath}?${params}`);
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => goTo(pagination.currentPage - 1)}
        disabled={pagination.currentPage <= 1}
        className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-40"
      >
        前へ
      </button>
      <span className="text-sm text-gray-600">
        {pagination.currentPage} / {totalPages}
      </span>
      <button
        onClick={() => goTo(pagination.currentPage + 1)}
        disabled={pagination.currentPage >= totalPages}
        className="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-40"
      >
        次へ
      </button>
    </div>
  );
}
