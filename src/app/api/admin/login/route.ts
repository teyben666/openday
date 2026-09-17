import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  createAdminToken,
  verifyAdminPassword,
} from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = String(body.password || '');

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_COOKIE, createAdminToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
