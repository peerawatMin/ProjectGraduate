
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {  User, School, Armchair, CalendarRange } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../components/StatCard';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardStats() {
  const searchParams = useSearchParams();
  const tablesParam = searchParams.get('tables');
  const tables = tablesParam ? tablesParam.split(',') : ['exam_rooms','examiner','seating_plans','seat_assignment'];

  const [stats, setStats] = useState<Record<string, number>>({});

  // โหลดข้อมูลครั้งแรก
  const fetchFromApi = async () => {
    const res = await fetch(`/api/dashboard-stats?tables=${tables.join(',')}`);
    const data = await res.json();
    setStats(data);
  };

    useEffect(() => {
    // สร้าง async function ภายใน useEffect
    const loadData = async () => {
      await fetchFromApi(); // ดึงข้อมูลจาก API
    };

    loadData(); // เรียก function แต่ **ไม่ return**

    // Realtime channel
    const channel = supabase.channel('dashboard-changes');
    tables.forEach((table) => {
      channel.on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => {
        setStats((prev) => {
          const currentCount = prev[table] || 0;
          let newCount = currentCount;
          if (payload.eventType === 'INSERT') newCount = currentCount + 1;
          if (payload.eventType === 'DELETE') newCount = Math.max(0, currentCount - 1);
          return { ...prev, [table]: newCount };
        });
      });
    });
    channel.subscribe();

    // cleanup function
    return () => {supabase.removeChannel(channel)};
  }, [tables]);


  return (

    <motion.div
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      {tables.includes('exam_rooms') && <StatCard name="จำนวนห้องสอบ" icon={School} value={(stats.exam_rooms || 0).toLocaleString()} />}
      {tables.includes('examiner') && <StatCard name="จำนวนผู้สอบ" icon={User} value={(stats.examiner || 0).toLocaleString()} />}
      {tables.includes('seating_plans') && <StatCard name="จำนวนแผนที่นั่งสอบ" icon={Armchair} value={(stats.seating_plans || 0).toLocaleString()} />}
      {tables.includes('seat_assignment') && <StatCard name="ผู้สอบที่จัดที่นั่งแล้ว" icon={CalendarRange} value={(stats.seat_assignment || 0).toLocaleString()} />}
    </motion.div>
  );
}