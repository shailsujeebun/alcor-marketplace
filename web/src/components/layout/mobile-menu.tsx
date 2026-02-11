'use client';

import Link from 'next/link';
import { X, LogIn, UserPlus, LogOut } from 'lucide-react';
import type { User } from '@/types/api';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  isAuthenticated: boolean;
  user: User | null;
  onLogout: () => void;
}

export function MobileMenu({ open, onClose, links, isAuthenticated, user, onLogout }: MobileMenuProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[85%] max-w-[400px] glass-card !rounded-none !rounded-l-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <span className="font-heading font-bold text-lg gradient-text">Меню</span>
          <button onClick={onClose} className="p-2 text-[var(--text-secondary)]" aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        {isAuthenticated && user && (
          <div className="flex items-center gap-3 mb-6 px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <div className="w-10 h-10 rounded-full gradient-cta flex items-center justify-center text-white font-bold">
              {(user.firstName?.[0] || user.email[0]).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-[var(--text-secondary)] truncate">
                {user.email}
              </p>
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-all font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          {isAuthenticated ? (
            <button
              onClick={() => { onClose(); onLogout(); }}
              className="w-full flex items-center justify-center gap-2 border border-red-500/30 text-red-400 px-5 py-3 rounded-full font-semibold hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} />
              Вийти
            </button>
          ) : (
            <>
              <Link
                href="/ad-placement"
                onClick={onClose}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-full font-semibold transition-colors"
              >
                <span className="text-lg">+</span>
                Розмістити оголошення
              </Link>
              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 border border-[var(--border-color)] text-[var(--text-primary)] px-5 py-3 rounded-full font-semibold hover:border-blue-bright/40 transition-colors"
              >
                <LogIn size={18} />
                Вхід
              </Link>
              <Link
                href="/register"
                onClick={onClose}
                className="flex items-center justify-center gap-2 gradient-cta text-white px-5 py-3 rounded-full font-semibold"
              >
                <UserPlus size={18} />
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
