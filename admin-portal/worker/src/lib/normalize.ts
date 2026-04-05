/**
 * Normalize different app response shapes into a common format.
 * Some apps wrap in { success, data }, others return data directly.
 */

export function extractData(response: unknown): Record<string, unknown> {
  if (!response || typeof response !== 'object') return {};
  const obj = response as Record<string, unknown>;

  // ProfitShield pattern: { success: true, data: { ... } }
  if ('success' in obj && 'data' in obj && typeof obj.data === 'object') {
    return obj.data as Record<string, unknown>;
  }

  // SmartCash pattern: data returned directly
  return obj;
}

export interface NormalizedHealth {
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  dbConnected: boolean;
  dbResponseMs: number;
  memoryMb: number;
  version: string;
  uptime: number;
}

export function normalizeHealth(raw: Record<string, unknown>): NormalizedHealth {
  return {
    status: ((raw.status as string) || (raw.dbConnected ? 'healthy' : 'degraded')) as NormalizedHealth['status'],
    dbConnected: Boolean(raw.dbConnected ?? raw.db_connected),
    dbResponseMs: Number(raw.dbResponseMs ?? raw.db_response_ms ?? 0),
    memoryMb: Number(raw.memoryUsageMb ?? raw.memory_mb ?? raw.memoryMb ?? 0),
    version: String(raw.version ?? 'unknown'),
    uptime: Number(raw.uptime ?? 0),
  };
}

export interface NormalizedDashboard {
  totalUsers: number;
  activeUsers: number;
  newSignups7d: number;
  newSignups30d: number;
  mrr: number;
  errorCount: number;
}

export function normalizeDashboard(raw: Record<string, unknown>): NormalizedDashboard {
  return {
    totalUsers: Number(raw.totalUsers ?? raw.total_users ?? raw.totalShops ?? raw.totalStores ?? 0),
    activeUsers: Number(raw.activeUsers ?? raw.active_users ?? raw.activeShops ?? raw.activeStores ?? 0),
    newSignups7d: Number(raw.newSignups7d ?? raw.new_signups_7d ?? raw.newStores7d ?? 0),
    newSignups30d: Number(raw.newSignups30d ?? raw.new_signups_30d ?? raw.newStores30d ?? 0),
    mrr: Number(raw.mrr ?? 0),
    errorCount: Number(raw.errorCount24h ?? raw.error_count ?? raw.errorCount ?? raw.errorScans24h ?? 0),
  };
}
