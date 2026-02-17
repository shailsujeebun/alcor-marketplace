'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="p-2 rounded-xl glass-card disabled:opacity-30 hover:bg-blue-bright/10 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      {pages.map((page, i) =>
        typeof page === 'string' ? (
          <span key={`dots-${i}`} className="px-2 text-[var(--text-secondary)]">{page}</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              'w-10 h-10 rounded-xl text-sm font-medium transition-all',
              page === currentPage
                ? 'gradient-cta text-white'
                : 'glass-card hover:bg-blue-bright/10 text-[var(--text-secondary)]',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="p-2 rounded-xl glass-card disabled:opacity-30 hover:bg-blue-bright/10 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
