'use client';

import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/auth-store';
import { refreshTokens } from '@/lib/auth-api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const hydrate = async () => {
      const refreshToken = Cookies.get('refreshToken');
      if (!refreshToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await refreshTokens(refreshToken);
        setAuth(data.user, data.accessToken, data.refreshToken);
      } catch {
        logout();
      }
    };

    hydrate();
  }, [setAuth, setLoading, logout]);

  return <>{children}</>;
}
