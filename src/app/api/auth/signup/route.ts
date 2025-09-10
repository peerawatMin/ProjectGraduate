// src/app/api/auth/signup/route.ts
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
    const { email, password, phone, firstName, lastName } = await request.json();

    if (!email || !password || !phone || !firstName || !lastName) {
      return NextResponse.json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' }, { status: 400 });
    }

    const { data: existingAdmin } = await supabase
      .from('admin')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingAdmin) {
      return NextResponse.json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: newAdmin, error: insertError } = await supabase
      .from('admin')
      .insert([{ email, password: hashedPassword, phone, first_name: firstName, last_name: lastName }])
      .select()
      .single();

    if (insertError || !newAdmin) {
      console.error('Database insert error:', insertError);
      return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }, { status: 500 });
    }

    const token = jwt.sign({ userId: newAdmin.id }, JWT_SECRET, { expiresIn: '24h' });

    const responseUser = { id: newAdmin.id, email: newAdmin.email };
    const responseProfile = {
      id: newAdmin.id,
      email: newAdmin.email,
      firstName: newAdmin.first_name || '',
      lastName: newAdmin.last_name || '',
      phone: newAdmin.phone,
    };

    const res = NextResponse.json({
      user: responseUser,
      profile: responseProfile,
      token,
      requiresEmailConfirmation: false,
    });

    // ✅ ตั้งคุกกี้ทั้งไซต์
    res.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',                      // ✅ ต้องมี
      maxAge: 60 * 60 * 24,
    });

    return res;
  } catch (err) {
    console.error('Signup error:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' }, { status: 500 });
  }
}
