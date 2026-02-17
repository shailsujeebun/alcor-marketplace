import { StarRating } from '@/components/ui/star-rating';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Джеймс Мітчелл',
    company: 'Mitchell Heavy Industries',
    rating: 5,
    text: 'Ми знайшли трьох надійних постачальників для нашої виробничої лінії протягом тижня. Система верифікації дає нам впевненість у кожній угоді.',
  },
  {
    name: 'Сара Чен',
    company: 'Pacific Equipment Co.',
    rating: 5,
    text: 'Як дилер, цей маркетплейс розширив наш доступ до міжнародних покупців, з якими ми раніше ніколи не змогли б зв\'язатися.',
  },
  {
    name: 'Маркус Вебер',
    company: 'Weber Construction GmbH',
    rating: 4,
    text: 'Детальні оголошення зі специфікаціями економлять нам години досліджень. Ми можемо порівнювати обладнання без зусиль.',
  },
];

export function Testimonials() {
  return (
    <section className="section-padding">
      <div className="container-main">
        <div className="text-center mb-8 md:mb-12" data-aos="fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-bright/10 text-blue-bright border border-blue-bright/20 mb-4">
            Відгуки
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-[var(--text-primary)]">
            Що кажуть наші <span className="gradient-text">користувачі</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="glass-card card-hover p-5 sm:p-6 md:p-8"
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <Quote className="text-blue-bright/30 mb-3 sm:mb-4 w-5 h-5 sm:w-6 sm:h-6" />
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4 sm:mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <StarRating rating={t.rating} size={14} className="mb-3 sm:mb-4" />
              <div>
                <p className="font-heading font-bold text-sm text-[var(--text-primary)]">{t.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{t.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
