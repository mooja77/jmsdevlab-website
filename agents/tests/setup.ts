// Shared test setup — API client, auth, cleanup helpers

export const API_BASE = process.env.TEST_API || 'https://jms-admin-portal.mooja77.workers.dev';
const PASSWORD = process.env.TEST_PASSWORD || 'JmsAdmin2026';

let _token: string | null = null;

export async function getToken(): Promise<string> {
  if (_token) return _token;
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: PASSWORD }),
  });
  const data = await res.json() as any;
  _token = data.token;
  return _token!;
}

export async function api<T = any>(path: string, options?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options?.headers as Record<string, string>),
    },
  });
  return res.json() as T;
}

export async function apiRaw(path: string, options?: RequestInit): Promise<Response> {
  const token = await getToken();
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...(options?.headers as Record<string, string>),
    },
  });
}

export async function code(path: string, options?: RequestInit): Promise<number> {
  const res = await apiRaw(path, options);
  return res.status;
}

export async function createTask(overrides: Partial<{
  agent_id: string; type: string; title: string; priority: number;
  description: string; created_by: string; requires_approval: boolean;
  input_json: any; parent_task_id: number;
}> = {}): Promise<any> {
  return api('/api/agents/tasks', {
    method: 'POST',
    body: JSON.stringify({
      agent_id: 'app-smartcash',
      type: 'general',
      title: `Test task ${Date.now()}`,
      ...overrides,
    }),
  });
}

export async function claimTask(id: number): Promise<any> {
  return api(`/api/agents/tasks/${id}/claim`, { method: 'PUT' });
}

export async function completeTask(id: number, data: Partial<{
  output_json: any; model_used: string; tokens_in: number; tokens_out: number; cost_cents: number;
}> = {}): Promise<any> {
  return api(`/api/agents/tasks/${id}/complete`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function failTask(id: number, error_message: string, failure_type?: string): Promise<any> {
  return api(`/api/agents/tasks/${id}/fail`, {
    method: 'PUT',
    body: JSON.stringify({ error_message, failure_type }),
  });
}

export async function timedApi<T = any>(path: string, options?: RequestInit): Promise<{ data: T; ms: number }> {
  const start = Date.now();
  const data = await api<T>(path, options);
  return { data, ms: Date.now() - start };
}

// Reset test agent to known state after tests
export async function resetAgent(id: string): Promise<void> {
  await api(`/api/agents/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'idle', model_default: 'sonnet', budget_daily_cents: 10 }),
  });
}
