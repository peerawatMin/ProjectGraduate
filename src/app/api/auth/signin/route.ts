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

    console.log('Signin attempt for email:', email);

    // Basic validation
    if (!email || !password) {
      console.log('Missing required fields');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin by email
    console.log('Looking for admin with email:', email);
    const { data: admin, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Database error:', error);
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('Admin not found');
        return NextResponse.json(
          { message: 'Invalid email or password' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { message: 'Database error while finding admin' },
        { status: 500 }
      );
    }

    if (!admin) {
      console.log('Admin not found');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Admin found, verifying password...');
    
    // Verify password using bcrypt
    const isValidPassword = await bcrypt.compare(password, admin.password);
    
    if (!isValidPassword) {
      console.log('Invalid password');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Password verified successfully');

    // Create JWT token
    const token = jwt.sign(
      { userId: admin.id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data (ไม่ส่ง password กลับ)
    const responseUser = {
      id: admin.id,
      email: admin.email,
    };

    const responseProfile = {
      id: admin.id,
      email: admin.email,
      firstName: admin.first_name || '',
      lastName: admin.last_name || '',
      phone: admin.phone,
    };

    console.log('Signin successful for admin:', admin.id);

    // Set JWT token in HTTP-only cookie
    const response = NextResponse.json({
      user: responseUser,
      profile: responseProfile,
      token: token, // Include token in response for client-side storage
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
    console.error('Signin error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}