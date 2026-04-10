/**
 * Constant-time string comparison — prevents timing attacks.
 * Uses HMAC to ensure comparison takes the same time regardless of input.
 */
export async function constantTimeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const keyData = enc.encode('timing-safe-compare-key');
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sigA = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(a)));
  const sigB = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(b)));
  if (sigA.length !== sigB.length) return false;
  let result = 0;
  for (let i = 0; i < sigA.length; i++) result |= sigA[i] ^ sigB[i];
  return result === 0;
}
