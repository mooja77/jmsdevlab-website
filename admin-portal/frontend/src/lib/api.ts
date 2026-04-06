const API_BASE = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://jms-admin-portal.mooja77.workers.dev'
    : ''
);

let authToken: string | null = localStorage.getItem('portal_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('portal_token', token);
  } else {
    localStorage.removeItem('portal_token');
  }
}

export function getToken(): string | null {
  return authToken;
}

export async function api<T = unknown>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setToken(null);
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((error as { error?: string }).error || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function login(password: string): Promise<boolean> {
  const result = await api<{ success: boolean; token: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
  if (result.success && result.token) {
    setToken(result.token);
    return true;
  }
  return false;
}

export async function logout(): Promise<void> {
  await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
  setToken(null);
}

export async function checkAuth(): Promise<boolean> {
  if (!authToken) return false;
  try {
    const result = await api<{ authenticated: boolean }>('/api/auth/check');
    return result.authenticated;
  } catch {
    return false;
  }
}
