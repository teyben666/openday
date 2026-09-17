import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE = 'neuc_admin_session';

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'neuc-admin-change-me';
}

export function createAdminToken(): string {
  return createHmac('sha256', getAdminPassword()).update('neuc-admin-v1').digest('hex');
}

export function verifyAdminPassword(password: string): boolean {
  const expected = getAdminPassword();
  const a = createHmac('sha256', 'neuc-cmp').update(password).digest();
  const b = createHmac('sha256', 'neuc-cmp').update(expected).digest();
  return timingSafeEqual(a, b) && password === expected;
}

export function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = createAdminToken();
  try {
    const a = Buffer.from(token);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}
