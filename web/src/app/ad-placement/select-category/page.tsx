'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useCategories } from '@/lib/queries';

// Category tabs - these are just views/filters of existing categories
const CATEGORY_TABS = [
    { id: 'agroline', label: 'Agroline', icon: '🚜' },
    { id: 'autoline', label: 'Autoline', icon: '🚛' },
    { id: 'machineryline', label: 'Machineryline', icon: '⚙️' },
];

export default function SelectCategoryPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('autoline');
    const [searchQuery, setSearchQuery] = useState('');
    const { data: categories, isLoading } = useCategories();

    // Filter categories based on active tab and search
    const filteredCategories = categories?.filter((cat) => {
        const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
        // For now, show all categories in all tabs
        // You can add category.type field in database to filter by tab
        return matchesSearch;
    });

    const handleCategorySelect = (categoryId: string) => {
        router.push(`/ad-placement/details?categoryId=${categoryId}`);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Breadcrumb */}
            <div className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <div className="container-main py-3">
                    <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <Link href="/" className="hover:text-[var(--text-primary)]">Agroline</Link>
                        <span>/</span>
                        <Link href="/ad-placement" className="hover:text-[var(--text-primary)]">Розміщення оголошення</Link>
                        <span>/</span>
                        <span className="text-[var(--text-primary)]">Оберіть розділ</span>
                    </div>
                </div>
            </div>

            <div className="container-main py-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="xl:col-span-3">
                    {/* Step Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-blue-bright text-white flex items-center justify-center font-bold">
                                1
                            </div>
                            <h1 className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                                Оберіть розділ
                            </h1>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6">
                        <div className="relative max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={20} />
                            <input
                                type="text"
                                placeholder="Пошук..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] focus:border-blue-bright outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-8 border-b border-[var(--border-color)]">
                        {CATEGORY_TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-3 font-medium transition-colors relative ${activeTab === tab.id
                                    ? 'text-blue-bright'
                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </span>
                                {activeTab === tab.id && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-bright" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Categories Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="glass-card p-6 animate-pulse">
                                    <div className="w-16 h-16 bg-[var(--border-color)] rounded-lg mx-auto mb-3" />
                                    <div className="h-4 bg-[var(--border-color)] rounded" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredCategories?.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category.id)}
                                    className="glass-card p-6 hover:border-blue-bright/40 transition-all group text-center"
                                >
                                    {/* Icon placeholder - you can add category icons later */}
                                    <div className="w-16 h-16 mx-auto mb-3 text-4xl flex items-center justify-center">
                                        {getCategoryIcon(category.name)}
                                    </div>
                                    <p className="text-sm text-[var(--text-primary)] font-medium group-hover:text-blue-bright transition-colors">
                                        {category.name}
                                    </p>
                                </button>
                            ))}
                        </div>
                    )}

                    {filteredCategories?.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <p className="text-[var(--text-secondary)]">
                                Категорій не знайдено. Спробуйте інший пошуковий запит.
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Steps */}
                <div className="hidden xl:block xl:col-span-1">
                    <div className="sticky top-24">
                        <div className="glass-card p-6 w-full">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-blue-bright text-white text-xs flex items-center justify-center font-bold">
                                        1
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Rozdil</span>
                                </div>
                                <div className="flex items-center gap-3 opacity-50">
                                    <div className="w-6 h-6 rounded-full border-2 border-[var(--border-color)] text-xs flex items-center justify-center">
                                        2
                                    </div>
                                    <span className="text-sm text-[var(--text-secondary)]">Opis</span>
                                </div>
                                <div className="flex items-center gap-3 opacity-50">
                                    <div className="w-6 h-6 rounded-full border-2 border-[var(--border-color)] text-xs flex items-center justify-center">
                                        3
                                    </div>
                                    <span className="text-sm text-[var(--text-secondary)]">Foto ta video</span>
                                </div>
                                <div className="flex items-center gap-3 opacity-50">
                                    <div className="w-6 h-6 rounded-full border-2 border-[var(--border-color)] text-xs flex items-center justify-center">
                                        4
                                    </div>
                                    <span className="text-sm text-[var(--text-secondary)]">Kontakty prodavtsya</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to get category icon based on name
function getCategoryIcon(name: string): string {
    const nameLower = name.toLowerCase();

    if (nameLower.includes('трактор') || nameLower.includes('tractor')) return '🚜';
    if (nameLower.includes('вантаж') || nameLower.includes('truck')) return '🚛';
    if (nameLower.includes('автобус') || nameLower.includes('bus')) return '🚌';
    if (nameLower.includes('причіп') || nameLower.includes('trailer')) return '🚚';
    if (nameLower.includes('авто') || nameLower.includes('car')) return '🚗';
    if (nameLower.includes('мото') || nameLower.includes('motorcycle')) return '🏍️';
    if (nameLower.includes('екскаватор') || nameLower.includes('excavator')) return '🏗️';
    if (nameLower.includes('навантажувач') || nameLower.includes('loader')) return '⚙️';
    if (nameLower.includes('комбайн') || nameLower.includes('harvester')) return '🌾';
    if (nameLower.includes('запчастин') || nameLower.includes('parts')) return '🔧';

    return '📦';
}
