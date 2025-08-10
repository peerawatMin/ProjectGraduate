/* eslint-disable @typescript-eslint/no-unused-vars */
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
      return NextResponse.json(
        { message: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      );
    }

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admin')
      .select('email')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { message: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      );
    }

    // เข้ารหัสรหัสผ่านด้วย bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // บันทึกข้อมูลลงฐานข้อมูล
    const { data: newAdmin, error: insertError } = await supabase
      .from('admin')
      .insert([
        {
          email,
          password: hashedPassword,
          phone,
          first_name: firstName,
          last_name: lastName,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      return NextResponse.json(
        { message: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' },
        { status: 500 }
      );
    }

    // สร้าง JWT token สำหรับ auto-login หลังจาก signup
    const token = jwt.sign(
      { userId: newAdmin.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // ส่งข้อมูลกลับ (ไม่ส่งรหัสผ่าน)
    const responseUser = {
      id: newAdmin.id,
      email: newAdmin.email,
    };

    const responseProfile = {
      id: newAdmin.id,
      email: newAdmin.email,
      firstName: newAdmin.first_name || '',
      lastName: newAdmin.last_name || '',
      phone: newAdmin.phone,
    };

    console.log('Signup successful for admin:', newAdmin.id);

    // Set JWT token in HTTP-only cookie
    const response = NextResponse.json({
      user: responseUser,
      profile: responseProfile,
      token: token, // Include token for auto-login
      requiresEmailConfirmation: false,
    });

    // Set HTTP-only cookie as well for additional security
    response.cookies.set('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}