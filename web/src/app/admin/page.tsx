'use client';

import Link from 'next/link';
import { Users, Package, Building2, MessageSquare } from 'lucide-react';
import { useAdminStats } from '@/lib/queries';

const quickLinks = [
  { href: '/admin/users', label: 'Управління користувачами', desc: 'Перегляд та редагування користувачів' },
  { href: '/admin/moderation', label: 'Модерація оголошень', desc: 'Схвалення та відхилення нових оголошень' },
  { href: '/admin/tickets', label: 'Тікети підтримки', desc: 'Перегляд всіх звернень' },
  { href: '/admin/dealer-leads', label: 'Заявки дилерів', desc: 'Обробка заявок на реєстрацію' },
];

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    { label: 'Користувачі', value: stats?.usersCount ?? 0, icon: Users, bgClass: 'bg-blue-500/20', iconClass: 'text-blue-400' },
    { label: 'Оголошення', value: stats?.listingsCount ?? 0, icon: Package, bgClass: 'bg-orange-500/20', iconClass: 'text-orange-400' },
    { label: 'Компанії', value: stats?.companiesCount ?? 0, icon: Building2, bgClass: 'bg-green-500/20', iconClass: 'text-green-400' },
    { label: 'Активні тікети', value: stats?.activeTicketsCount ?? 0, icon: MessageSquare, bgClass: 'bg-purple-500/20', iconClass: 'text-purple-400' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Панель адміністратора
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl ${card.bgClass} flex items-center justify-center`}>
                  <Icon size={24} className={card.iconClass} />
                </div>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                {isLoading ? '...' : card.value.toLocaleString()}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                {card.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-4">
          Швидкі дії
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="p-4 rounded-lg border border-[var(--border-color)] hover:border-blue-bright/40 transition-colors"
            >
              <div className="font-medium text-[var(--text-primary)]">{link.label}</div>
              <div className="text-sm text-[var(--text-secondary)] mt-1">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
