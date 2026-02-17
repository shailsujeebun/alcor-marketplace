import type { AuthResponse, User } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const CSRF_COOKIE_NAME = 'alcor_csrf_token';

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const encodedName = `${name}=`;
  const entries = document.cookie.split(';');
  for (const entry of entries) {
    const cookie = entry.trim();
    if (cookie.startsWith(encodedName)) {
      return decodeURIComponent(cookie.slice(encodedName.length));
    }
  }

  return null;
}

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Auth error: ${res.status}`);
  }
  return res.json();
}

export async function registerUser(data: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<{ message: string }> {
  return authFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return authFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshTokens(): Promise<AuthResponse> {
  const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
  if (!csrfToken) {
    throw new Error('Missing CSRF token');
  }

  return authFetch('/auth/refresh', {
    method: 'POST',
    headers: { 'x-csrf-token': csrfToken },
  });
}

export async function logoutUser(accessToken: string | null): Promise<void> {
  const csrfToken = getCookieValue(CSRF_COOKIE_NAME);
  if (!csrfToken) {
    throw new Error('Missing CSRF token');
  }

  await authFetch('/auth/logout', {
    method: 'POST',
    headers: {
      'x-csrf-token': csrfToken,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
}

export async function forgotPassword(email: string): Promise<{ ok: boolean }> {
  return authFetch('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ ok: boolean }> {
  return authFetch('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}

export async function getMe(accessToken: string): Promise<User> {
  return authFetch('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function verifyEmail(data: {
  email: string;
  code: string;
}): Promise<AuthResponse> {
  return authFetch('/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function resendVerification(
  email: string,
): Promise<{ ok: boolean }> {
  return authFetch('/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}
