'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, LogIn, UserPlus, User, LogOut, ChevronDown, LayoutDashboard, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { logoutUser } from '@/lib/auth-api';
import Cookies from 'js-cookie';
import { MobileMenu } from './mobile-menu';
import { NotificationBell } from './notification-bell';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isLoading, accessToken, logout } = useAuthStore();

  const navLinks = [
    { href: '/', label: 'Головна' },
    { href: '/listings', label: 'Оголошення' },
    { href: '/companies', label: 'Компанії' },
    { href: '/categories', label: 'Категорії' },
    ...((user?.role === 'ADMIN' || user?.role === 'MANAGER')
      ? [{ href: '/admin', label: 'Адмін' }]
      : []),
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    const refreshToken = Cookies.get('refreshToken');
    if (accessToken && refreshToken) {
      try {
        await logoutUser(accessToken, refreshToken);
      } catch {
        // Ignore errors on logout
      }
    }
    logout();
    router.push('/');
  };

  const displayName = user?.firstName || user?.email?.split('@')[0] || 'Користувач';

  return (
    <>
      <header className="sticky top-0 z-50 glass-card !rounded-none border-x-0 border-t-0">
        <div className="container-main flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-cta flex items-center justify-center text-white font-bold text-lg">
              А
            </div>
            <span className="font-heading font-bold text-xl gradient-text">
              АЛЬКОР
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors relative py-1',
                  pathname === link.href
                    ? 'text-blue-bright'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-bright rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-[var(--border-color)] animate-pulse" />
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--border-color)] hover:border-blue-bright/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full gradient-cta flex items-center justify-center text-white text-xs font-bold">
                      {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                    </div>
                    <span className="text-sm text-[var(--text-primary)] font-medium max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown size={14} className={cn('text-[var(--text-secondary)] transition-transform', dropdownOpen && 'rotate-180')} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 glass-card py-2 shadow-xl z-50">
                      <div className="px-4 py-2 border-b border-[var(--border-color)]">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/cabinet"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-color)] transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        Кабінет
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Вийти
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
                >
                  <LogIn size={16} />
                  Вхід
                </Link>
                <Link
                  href="/register"
                  className="gradient-cta text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <UserPlus size={16} />
                  Реєстрація
                </Link>
                <Link
                  href="/ad-placement"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="text-lg">+</span>
                  Розмістити оголошення
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-[var(--text-secondary)]"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
}
