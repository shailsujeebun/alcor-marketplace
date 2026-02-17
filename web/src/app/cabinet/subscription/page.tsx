'use client';

import Link from 'next/link';
import { Crown, Calendar, Check } from 'lucide-react';
import { useMySubscription, usePlans } from '@/lib/queries';
import type { Plan } from '@/types/api';

export default function SubscriptionPage() {
  const { data: subscription, isLoading: subLoading } = useMySubscription();
  const { data: plans, isLoading: plansLoading } = usePlans();

  const currentPlan = subscription?.plan;

  return (
    <div>
      <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-6">
        Підписка
      </h1>

      {/* Current Plan */}
      {subLoading ? (
        <div className="glass-card p-6 animate-pulse mb-8">
          <div className="h-6 bg-[var(--border-color)] rounded w-1/3 mb-3" />
          <div className="h-4 bg-[var(--border-color)] rounded w-1/2" />
        </div>
      ) : currentPlan ? (
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-cta flex items-center justify-center">
                <Crown size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-bold text-[var(--text-primary)]">
                  {currentPlan.name}
                </h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  Поточний план
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold gradient-text">
                {Number(currentPlan.priceAmount).toLocaleString()}{' '}
                {currentPlan.priceCurrency}
              </div>
              <div className="text-sm text-[var(--text-secondary)]">
                на місяць
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
            <Calendar size={16} />
            <span>
              Активна до:{' '}
              {new Date(subscription.endDate).toLocaleDateString('uk')}
            </span>
          </div>

          <div className="border-t border-[var(--border-color)] pt-4">
            <h3 className="font-semibold text-[var(--text-primary)] mb-3">
              Доступні функції:
            </h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {Array.isArray(currentPlan.features) &&
                currentPlan.features.map((feature: string, idx: number) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                  >
                    <Check
                      size={16}
                      className="text-green-400 flex-shrink-0 mt-0.5"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="glass-card p-6 mb-8 text-center">
          <Crown
            size={48}
            className="mx-auto text-[var(--text-secondary)] mb-4"
          />
          <h2 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-2">
            Базовий план
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">
            Ви користуєтесь безкоштовним планом
          </p>
          <Link
            href="/pricing"
            className="inline-flex gradient-cta text-white px-6 py-3 rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            Переглянути тарифи
          </Link>
        </div>
      )}

      {/* Available Plans */}
      <h2 className="text-2xl font-heading font-bold text-[var(--text-primary)] mb-4">
        Доступні плани
      </h2>

      {plansLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-6 bg-[var(--border-color)] rounded w-1/2 mb-3" />
              <div className="h-4 bg-[var(--border-color)] rounded w-3/4 mb-4" />
              <div className="h-10 bg-[var(--border-color)] rounded" />
            </div>
          ))}
        </div>
      ) : !plans || plans.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-[var(--text-secondary)]">
            Плани ще не налаштовані. Перегляньте{' '}
            <Link href="/pricing" className="text-blue-bright hover:underline">
              сторінку тарифів
            </Link>{' '}
            для отримання додаткової інформації.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {(plans as Plan[])
            .filter((p) => p.id !== currentPlan?.id)
            .map((plan) => {
              const features = Array.isArray(plan.features)
                ? plan.features
                : [];

              return (
                <div key={plan.id} className="glass-card p-6">
                  <h3 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-bold gradient-text">
                      {Number(plan.priceAmount).toLocaleString()}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {plan.priceCurrency} / міс
                    </span>
                  </div>

                  <ul className="space-y-2 mb-6">
                    {features.slice(0, 4).map((feature: string, idx: number) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <Check
                          size={16}
                          className="text-blue-bright flex-shrink-0 mt-0.5"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className="w-full gradient-cta text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Оновити до {plan.name}
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
