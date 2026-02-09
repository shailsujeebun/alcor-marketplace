'use client';

import Link from 'next/link';
import { Layers, ArrowRight } from 'lucide-react';
import { useCategories } from '@/lib/queries';

export function CategoriesGrid() {
  const { data: categories } = useCategories();
  const topLevel = categories?.filter((c) => !c.parentId) ?? [];

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-main">
        <div className="text-center mb-8 md:mb-12" data-aos="fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-orange/10 text-orange border border-orange/20 mb-4">
            Категорії
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-[var(--text-primary)]">
            Перегляд за <span className="gradient-text">категоріями</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6" data-aos="fade-up" data-aos-delay="100">
          {topLevel.map((cat) => (
            <Link
              key={cat.id}
              href={`/listings?categoryId=${cat.id}`}
              className="glass-card card-hover p-3 sm:p-4 md:p-6 text-center group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 mx-auto mb-2 sm:mb-3 md:mb-4 rounded-xl sm:rounded-2xl bg-blue-bright/10 flex items-center justify-center group-hover:bg-blue-bright/20 transition-colors">
                <Layers className="text-blue-bright w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="font-heading font-bold text-xs sm:text-sm text-[var(--text-primary)] leading-tight line-clamp-2">
                {cat.name}
              </h3>
              {cat.children && cat.children.length > 0 && (
                <p className="text-[10px] sm:text-xs text-[var(--text-secondary)] mt-1">
                  {cat.children.length} підкатегорій
                </p>
              )}
            </Link>
          ))}
          {topLevel.length === 0 && (
            <div className="col-span-full text-center py-8 text-[var(--text-secondary)]">
              Категорії з'являться незабаром.
            </div>
          )}
        </div>

        <div className="text-center mt-8 md:mt-10" data-aos="fade-up">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-blue-bright hover:text-blue-light font-semibold transition-colors"
          >
            Усі категорії
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
