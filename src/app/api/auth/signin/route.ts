// src/app/api/auth/signin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !admin) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = jwt.sign({ userId: admin.id }, JWT_SECRET, { expiresIn: '24h' });

    const responseUser = { id: admin.id, email: admin.email };
    const responseProfile = {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name || '',
      lastName: admin.last_name || '',
      phone: admin.phone,
    };

    const res = NextResponse.json({
      user: responseUser,
      profile: responseProfile,
      token, // optional: เผื่อ client อยากเก็บเอง (แต่ไม่จำเป็น)
    });

    // 🔧 จุดสำคัญ: ตั้งคุกกี้แบบ HTTP-only ใช้ได้ทั้งไซต์
    res.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',          // 'lax' จะเวิร์กกับ flow redirect ได้ดี
      path: '/',                // ✅ ต้องมี! ไม่งั้น cookie ใช้ได้เฉพาะ /api/auth/*
      maxAge: 60 * 60 * 24,     // 24h
    });

    return res;
  } catch (err) {
    console.error('Signin error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
