import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)]" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-main section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="logo-link flex items-center gap-3 mb-4">
              <Image
                src="/alcor-logo.png"
                alt="АЛЬКОР Logo"
                width={50}
                height={50}
                className="logo-image h-10 w-auto"
              />
              <span className="logo-text font-heading font-bold text-xl">
                АЛЬКОР
              </span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
              Ми створюємо фінансові рішення, які допомагають бізнесу розвиватися. Понад 10 років досвіду та тисячі задоволених клієнтів.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[var(--text-primary)]">
              Послуги
            </h4>
            <ul className="space-y-3">
              <li><span className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors cursor-pointer">Автолізинг</span></li>
              <li><span className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors cursor-pointer">Бізнес-кредитування</span></li>
              <li><span className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors cursor-pointer">Факторинг</span></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[var(--text-primary)]">
              Компанія
            </h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">Про нас</Link></li>
              <li><Link href="/companies" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">Партнери</Link></li>
              <li><Link href="/help" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">Допомога</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">Умови</Link></li>
              <li><Link href="/privacy" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">Конфіденційність</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[var(--text-primary)]">
              Контакти
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={14} className="text-blue-bright flex-shrink-0 mt-0.5" />
                <span>49044, м. Дніпро, вул. Івана Шулика (Якова Самарського), 2, офіс 302</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Phone size={14} className="text-blue-bright flex-shrink-0" />
                <span>+38 (068) 319-98-00</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <Mail size={14} className="text-blue-bright flex-shrink-0" />
                <span>alkorfk@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[var(--border-color)] mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} АЛЬКОР. Усі права захищено.
          </p>
        </div>
      </div>
    </footer>
  );
}
