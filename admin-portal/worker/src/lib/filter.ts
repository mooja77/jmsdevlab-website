/**
 * Single source of truth for test account detection.
 * Used by EVERY endpoint that touches user data.
 * NO duplicates of this logic anywhere else.
 */

const TEST_DOMAINS = [
  '@example.com', '@test.com', '@mailinator.com', '@x.com',
  '@staffhubtest.com', '@spamshield.app', '@jewelvalue.app',
  '@smartcashapp.net', '@staffhubapp.com', '@mygrowthmap.net',
  '@shopify.com', '@repairdeskapp.net', '@customdesign.com',
  '@customdesigncrm.com', '@testorg.com',
];

const TEST_WORDS = ['test', 'demo', 'e2e', 'smoke', 'qa', 'cors-', 'fake', 'seed'];

const INTERNAL_EMAILS = [
  'mooja77@gmail.com', 'john@mooresjewellers.com', 'john@jmsdevlab.com',
];

export function isTestEmail(email: string): boolean {
  if (!email) return true;
  const lower = email.toLowerCase();
  if (INTERNAL_EMAILS.includes(lower)) return true;
  if (lower.endsWith('.test')) return true;
  if (lower.match(/mooja77\+.*@gmail\.com/)) return true;
  if (TEST_DOMAINS.some(d => lower.endsWith(d))) return true;
  if (TEST_WORDS.some(w => lower.includes(w))) return true;
  if (lower.startsWith('admin@')) return true;
  return false;
}
