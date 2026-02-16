'use client';

import { Phone, Mail, Sun, Moon } from 'lucide-react';
import { useTheme } from '../providers/theme-provider';
import { useTranslation } from '../providers/translation-provider';

export function TopBar() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="border-b border-[var(--border-color)]" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container-main flex items-center justify-between py-2 text-sm">
        <div className="flex items-center gap-6">
          <a href="tel:+380683199800" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-bright transition-colors">
            <Phone size={14} />
            <span className="hidden sm:inline">+38 (068) 319-98-00</span>
          </a>
          <a href="mailto:alkorfk@gmail.com" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-blue-bright transition-colors">
            <Mail size={14} />
            <span className="hidden sm:inline">alkorfk@gmail.com</span>
          </a>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-[var(--border-color)] transition-colors text-[var(--text-secondary)] hover:text-blue-bright"
          aria-label={t('topBar.toggleTheme')}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}
