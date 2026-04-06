/** Classify a referrer host into a traffic channel */
export function classifyReferrer(host: string): string {
  if (!host || host === '') return 'direct';
  const h = host.toLowerCase();
  if (/google\.|bing\.|yahoo\.|duckduckgo\.|baidu\./.test(h)) return 'search';
  if (/facebook\.|instagram\.|twitter\.|x\.com|t\.co|linkedin\.|reddit\.|dev\.to|youtube\.|tiktok\./.test(h)) return 'social';
  if (/googleads\.|doubleclick\.|googlesyndication\./.test(h)) return 'paid';
  return 'referral';
}

export const CHANNEL_COLORS: Record<string, string> = {
  search: '#3b82f6',
  direct: '#8b5cf6',
  social: '#f59e0b',
  referral: '#10b981',
  paid: '#ef4444',
};
