//* eslint-disable @typescript-eslint/no-unused-vars */
// hooks/useAdminData.ts
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/auth-helpers-nextjs';

interface AdminProfile {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  password?: string; // จะไม่ใช้ในการแสดงผล
  img_profile?: string | null; // <--- เพิ่มบรรทัดนี้: เพื่อให้รับ URL รูปภาพจาก Supabase
}

export const useAdminData = () => {
  const [user, setUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getAdminUser = async () => {
      try {
        // ดึงข้อมูล user ที่ล็อกอินอยู่
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          setError(userError.message);
          setLoading(false);
          return;
        }

        if (user) {
          setUser(user);

          // ดึงข้อมูล admin จากตาราง admin โดยใช้ email
          const { data: adminData, error: adminError } = await supabase
            .from('admin')
            .select('id, email, phone, created_at, first_name, last_name, img_profile') // <--- แก้ไขบรรทัดนี้: เพิ่ม img_profile
            .eq('email', user.email)
            .single();

          if (adminError) {
            console.error('Error fetching admin data from "admin" table:', adminError);
            // ใช้ข้อมูลจาก auth ถ้าไม่มีข้อมูลในตาราง admin หรือเกิดข้อผิดพลาดในการดึง
            setAdminProfile({
              id: user.id,
              email: user.email || '',
              created_at: new Date().toISOString(),
              first_name: user.user_metadata?.first_name || 'Admin',
              last_name: user.user_metadata?.last_name || 'User',
              img_profile: null // <--- เพิ่มบรรทัดนี้: กำหนดให้เป็น null ถ้ามี error หรือไม่มีข้อมูลในตาราง admin
            });
            setError(adminError.message); // ตั้งค่า error
          } else {
            setAdminProfile(adminData);
          }
        } else {
          // ถ้าไม่มี user ที่ล็อกอินอยู่
          setUser(null);
          setAdminProfile(null);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admin data (catch block):', err);
        setError('Failed to fetch admin data');
        setLoading(false);
      }
    };

    getAdminUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          // Refetch admin data when user signs in
          getAdminUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAdminProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]); // เพิ่ม supabase เป็น dependency

  // Helper function to get full name
  const getFullName = () => {
    if (!adminProfile) return 'Admin User';

    const firstName = adminProfile.first_name || '';
    const lastName = adminProfile.last_name || '';

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    } else if (lastName) {
      return lastName;
    } else {
      return adminProfile.email.split('@')[0] || 'Admin User';
    }
  };

  return { user, adminProfile, loading, error, getFullName };
};