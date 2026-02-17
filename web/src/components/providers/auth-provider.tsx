'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { refreshTokens } from '@/lib/auth-api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    const hydrate = async () => {
      try {
        const data = await refreshTokens();
        setAuth(data.user, data.accessToken);
      } catch {
        logout();
      }
    };

    hydrate();
  }, [setAuth, logout]);

  return <>{children}</>;
}
