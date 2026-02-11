import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Розміщення оголошення — АЛЬКОР',
};

export default function AdPlacementPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)] py-12">
            <div className="container-main max-w-5xl">
                <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] text-center mb-12">
                    Розміщення оголошення
                </h1>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Private Ad Card */}
                    <Link
                        href="/ad-placement/select-category"
                        className="glass-card p-8 hover:border-blue-bright/40 transition-all group"
                    >
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icons */}
                            <div className="flex gap-4 text-[var(--text-secondary)]">
                                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                                    {/* Tractor icon */}
                                    <circle cx="20" cy="48" r="8" />
                                    <circle cx="48" cy="48" r="8" />
                                    <path d="M12 48h-4v-16h20v16h-8M28 32v-8h16l8 8v16h-4" />
                                    <rect x="32" y="16" width="12" height="8" />
                                </svg>
                                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                                    {/* Truck icon */}
                                    <circle cx="20" cy="48" r="6" />
                                    <circle cx="48" cy="48" r="6" />
                                    <path d="M14 48h-6v-24h24v24h-6M32 24v-8h12l8 8v24h-4" />
                                    <rect x="8" y="16" width="16" height="8" />
                                </svg>
                            </div>

                            {/* Text */}
                            <div>
                                <p className="text-[var(--text-secondary)] mb-4">
                                    Розмістити одне або кілька оголошень
                                </p>
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                    + Приватне оголошення
                                </button>
                            </div>
                        </div>
                    </Link>

                    {/* PRO Account Card */}
                    <Link
                        href="/pro-account"
                        className="glass-card p-8 hover:border-blue-bright/40 transition-all group relative"
                    >
                        {/* PRO Badge */}
                        <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            PRO
                        </div>

                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icons */}
                            <div className="flex gap-4 text-[var(--text-secondary)]">
                                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                                    {/* Truck with trailer */}
                                    <circle cx="16" cy="48" r="6" />
                                    <circle cx="36" cy="48" r="6" />
                                    <circle cx="52" cy="48" r="6" />
                                    <path d="M10 48h-4v-20h16v20h-6M22 28v-8h10l6 8v20h-2M42 48v-20h16v20h-6" />
                                </svg>
                                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                                    {/* Equipment */}
                                    <rect x="16" y="24" width="32" height="16" />
                                    <path d="M20 40v8M44 40v8M24 16h16v8h-16z" />
                                    <circle cx="20" cy="52" r="4" />
                                    <circle cx="44" cy="52" r="4" />
                                </svg>
                                <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
                                    {/* Harvester */}
                                    <circle cx="20" cy="48" r="8" />
                                    <circle cx="48" cy="48" r="6" />
                                    <path d="M12 48h-4v-16h24v16h-4M32 32v-12h16l8 8v20h-4" />
                                    <path d="M32 20h-8l-4-8h16l-4 8z" />
                                </svg>
                            </div>

                            {/* Text */}
                            <div>
                                <p className="text-[var(--text-secondary)] mb-4">
                                    Я регулярно продаю техніку та обладнання
                                </p>
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                                    + PRO акаунт
                                </button>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
