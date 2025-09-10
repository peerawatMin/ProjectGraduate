// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    // ✅ 1) ลองอ่านจากคุกกี้ก่อน
    const cookieToken = request.cookies.get('authToken')?.value;

    // ✅ 2) เผื่อ client เก่าที่ยังส่ง header อยู่
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');

    const token = cookieToken || headerToken;
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let decoded: { userId: string };
    try {
      decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    const { data: admin, error } = await supabase
      .from('admin')
      .select('id, email, first_name, last_name, phone')
      .eq('id', decoded.userId)
      .single();

    if (error || !admin) {
      return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim();

    return NextResponse.json({
      id: admin.id,
      name: fullName || 'Admin User',
      email: admin.email,
      avatar: '/boy.png',
      role: 'admin',
      phone: admin.phone,
      firstName: admin.first_name || '',
      lastName: admin.last_name || '',
    });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
