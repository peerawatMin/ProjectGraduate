/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get user from database
    const { data: admin, error } = await supabase
      .from('admin')
      .select('id, email, first_name, last_name, phone')
      .eq('id', decoded.userId)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name || '',
      lastName: admin.last_name || '',
      phone: admin.phone,
    });

  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}