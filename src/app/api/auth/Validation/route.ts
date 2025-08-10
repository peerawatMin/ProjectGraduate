// src/app/api/auth/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // npm install jsonwebtoken @types/jsonwebtoken

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'ไม่พบหรือ authorization header ไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // ตัด 'Bearer ' ออก
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // ตัวเลือก: ดึงข้อมูลผู้ใช้จากฐานข้อมูลเพื่อให้แน่ใจว่ายังมีอยู่
      // const user = await getUserById(decoded.userId);
      // if (!user) {
      //   return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 401 });
      // }
      
      return NextResponse.json({
        user: {
          id: decoded.userId,
          // email: user.email, // เพิ่มถ้าดึงจาก DB
        }
      });
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return NextResponse.json(
        { error: 'Token ไม่ถูกต้อง' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('ข้อผิดพลาดในการตรวจสอบ token:', error);
    return NextResponse.json(
      { error: 'ข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}