'use client';

import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '../providers/translation-provider';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-[var(--border-color)]" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-main section-padding">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="logo-link flex items-center gap-3 mb-4">
              <Image
                src="/alcor-logo.png"
                alt={t('brand.logoAlt')}
                width={50}
                height={50}
                className="logo-image h-10 w-auto"
              />
              <span className="logo-text font-heading font-bold text-xl">АЛЬКОР</span>
            </div>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{t('footer.description')}</p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[var(--text-primary)]">
              {t('footer.servicesTitle')}
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors cursor-pointer">
                  {t('footer.autoLeasing')}
                </span>
              </li>
              <li>
                <span className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors cursor-pointer">
                  {t('footer.businessLoans')}
                </span>
              </li>
              <li>
                <span className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors cursor-pointer">
                  {t('footer.factoring')}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[var(--text-primary)]">
              {t('footer.companyTitle')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">
                  {t('footer.partners')}
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">
                  {t('footer.help')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-[var(--text-secondary)] hover:text-blue-bright transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-sm uppercase tracking-wider mb-4 text-[var(--text-primary)]">
              {t('footer.contactsTitle')}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin size={14} className="text-blue-bright flex-shrink-0 mt-0.5" />
                <span>{t('footer.address')}</span>
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
            &copy; {new Date().getFullYear()} АЛЬКОР. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
