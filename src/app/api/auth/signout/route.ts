/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Processing signout request');

    // Create response
    const response = NextResponse.json({
      message: 'Signed out successfully'
    });

    // Clear the auth cookie
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // Immediately expire
    });

    return response;

  } catch (error) {
    console.error('Signout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}