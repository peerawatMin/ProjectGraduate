/* eslint-disable @typescript-eslint/no-unused-vars */
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

    // Get user profile from database
    const { data: admin, error } = await supabase
      .from('admin')
      .select('id, email, first_name, last_name, phone')
      .eq('id', decoded.userId)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Format data for Sidebar component
    const fullName = `${admin.first_name || ''} ${admin.last_name || ''}`.trim();
    
    return NextResponse.json({
      id: admin.id,
      name: fullName || 'Admin User', // Fallback if no name
      email: admin.email,
      avatar: '/boy.png', // Default avatar หรือคุณสามารถเพิ่มฟิลด์ avatar ในตาราง admin
      role: 'admin',
      phone: admin.phone,
      // Additional fields if needed
      firstName: admin.first_name || '',
      lastName: admin.last_name || '',
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
