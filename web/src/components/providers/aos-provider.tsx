'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AOS from 'aos';
import 'aos/dist/aos.css';

export function AOSProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Only enable AOS on public-facing pages, not on cabinet/admin forms
    const isFormPage = pathname.startsWith('/cabinet') || pathname.startsWith('/admin');

    if (!isFormPage) {
      AOS.init({
        duration: 800,
        once: true,
        offset: 100,
        easing: 'ease-out-cubic',
      });
    }
  }, [pathname]);

  return <>{children}</>;
}
