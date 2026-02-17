'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const contactInfo = [
  { icon: MapPin, label: 'Адреса', value: '49044, м. Дніпро, вул. Івана Шулика, 2, офіс 302' },
  { icon: Phone, label: 'Телефон', value: '+38 (068) 319-98-00' },
  { icon: Mail, label: 'Електронна пошта', value: 'alkorfk@gmail.com' },
];

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="section-padding" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-main">
        <div className="text-center mb-8 md:mb-12" data-aos="fade-up">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-bright/10 text-blue-bright border border-blue-bright/20 mb-4">
            Контакти
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl md:text-4xl text-[var(--text-primary)]">
            Зв'яжіться <span className="gradient-text">з нами</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Contact Info */}
          <div data-aos="fade-right">
            <div className="space-y-4 sm:space-y-6">
              {contactInfo.map((info) => (
                <div key={info.label} className="glass-card p-4 sm:p-6 flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-bright/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="text-blue-bright w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-heading font-bold text-sm text-[var(--text-primary)] mb-1">{info.label}</h4>
                    <p className="text-sm text-[var(--text-secondary)] break-words">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div data-aos="fade-left">
            <form onSubmit={handleSubmit} className="glass-card p-5 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Ім&apos;я</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-gray-dim focus:outline-none focus:ring-2 focus:ring-blue-bright/40"
                  placeholder="Ваше ім'я"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Електронна пошта</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-gray-dim focus:outline-none focus:ring-2 focus:ring-blue-bright/40"
                  placeholder="ваш@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Повідомлення</label>
                <textarea
                  rows={4}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-gray-dim focus:outline-none focus:ring-2 focus:ring-blue-bright/40 resize-none"
                  placeholder="Чим ми можемо допомогти?"
                />
              </div>
              <button
                type="submit"
                className="w-full gradient-cta text-white py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {submitted ? 'Повідомлення надіслано!' : (
                  <>
                    Надіслати повідомлення
                    <Send size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
