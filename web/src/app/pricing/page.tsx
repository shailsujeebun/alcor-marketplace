'use client';

import Link from 'next/link';
import { Check, Star } from 'lucide-react';
import { usePlans } from '@/lib/queries';
import type { Plan, PlanInterval } from '@/types/api';

const INTERVAL_LABELS: Record<PlanInterval, string> = {
  MONTHLY: 'на місяць',
  QUARTERLY: 'на квартал',
  YEARLY: 'на рік',
};

export default function PricingPage() {
  const { data: plans, isLoading } = usePlans();

  return (
    <div className="container-main section-padding">
      {/* Hero */}
      <div className="text-center mb-16" data-aos="fade-up">
        <h1 className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-6">
          Виберіть свій план
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
          Гнучкі тарифи для бізнесу будь-якого розміру. Почніть безкоштовно або
          оберіть преміум план для більших можливостей.
        </p>
      </div>

      {/* Plans Grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card p-8 animate-pulse">
              <div className="h-6 bg-[var(--border-color)] rounded w-1/2 mb-4" />
              <div className="h-10 bg-[var(--border-color)] rounded w-3/4 mb-6" />
              <div className="space-y-3">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-[var(--border-color)] rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="max-w-6xl mx-auto">
          {/* Fallback static plans when no plans in DB */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Базовий',
                price: '0',
                desc: 'Для початку роботи',
                features: ['До 5 оголошень', 'Базовий профіль', 'Перегляд каталогу', 'Підтримка через email'],
                popular: false,
              },
              {
                name: 'Професійний',
                price: '1 499',
                desc: 'Для активних продавців',
                features: ['До 50 оголошень', 'Розширений профіль', 'Пріоритетна модерація', 'Статистика переглядів', 'Пряма підтримка'],
                popular: true,
              },
              {
                name: 'Бізнес',
                price: '4 999',
                desc: 'Для великих компаній',
                features: ['Необмежені оголошення', 'Преміум профіль', 'Миттєва модерація', 'Розширена аналітика', 'Персональний менеджер', 'API-доступ'],
                popular: false,
              },
            ].map((plan, index) => (
              <div
                key={plan.name}
                className={`glass-card p-8 relative ${plan.popular ? 'border-2 border-blue-bright' : ''}`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 gradient-cta text-white px-4 py-1 rounded-full text-sm font-semibold">
                      <Star size={14} />
                      Популярний
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">{plan.desc}</p>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold gradient-text">{plan.price}</span>
                    <span className="text-[var(--text-secondary)]">UAH</span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">на місяць</div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3">
                      <Check size={20} className="text-blue-bright flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[var(--text-secondary)]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cabinet/subscription"
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                    plan.popular
                      ? 'gradient-cta text-white hover:opacity-90'
                      : 'border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:border-blue-bright/40'
                  }`}
                >
                  Обрати план
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {(plans as Plan[]).map((plan, index) => {
            const features = Array.isArray(plan.features) ? plan.features : [];
            const isPopular = index === 1;

            return (
              <div
                key={plan.id}
                className={`glass-card p-8 relative ${isPopular ? 'border-2 border-blue-bright' : ''}`}
                data-aos="fade-up"
                data-aos-delay={index * 100}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 gradient-cta text-white px-4 py-1 rounded-full text-sm font-semibold">
                      <Star size={14} />
                      Популярний
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-2">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="text-sm text-[var(--text-secondary)] mb-4">
                      {plan.description}
                    </p>
                  )}
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold gradient-text">
                      {Number(plan.priceAmount).toLocaleString()}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {plan.priceCurrency}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {INTERVAL_LABELS[plan.interval]}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check size={20} className="text-blue-bright flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-[var(--text-secondary)]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/cabinet/subscription"
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-all ${
                    isPopular
                      ? 'gradient-cta text-white hover:opacity-90'
                      : 'border-2 border-[var(--border-color)] text-[var(--text-primary)] hover:border-blue-bright/40'
                  }`}
                >
                  Обрати план
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-20 glass-card p-8" data-aos="fade-up">
        <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-6 text-center">
          Часті питання про тарифи
        </h2>
        <div className="space-y-6 text-[var(--text-secondary)]">
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">
              Чи можу я змінити план?
            </h3>
            <p className="text-sm">
              Так, ви можете змінити свій план в будь-який час у налаштуваннях
              кабінету. Зміни вступають в силу негайно.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">
              Як відбувається оплата?
            </h3>
            <p className="text-sm">
              Оплата здійснюється через безпечну систему онлайн-платежів.
              Підтримуємо картки Visa, Mastercard та банківський переказ.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text-primary)] mb-2">
              Чи є знижки для річних планів?
            </h3>
            <p className="text-sm">
              Так, при оплаті річної підписки ви отримуєте знижку до 20%
              порівняно з щомісячною оплатою.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
