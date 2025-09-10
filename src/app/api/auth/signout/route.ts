/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  try {
    const res = NextResponse.json({ message: 'Signed out successfully' });
    res.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',        // ✅ ล้างทั้งไซต์
      maxAge: 0,
    });
    return res;
  } catch (err) {
    console.error('Signout error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
