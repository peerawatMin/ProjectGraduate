'use client'

import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState } from 'react';

// Import Recharts components
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// 1. (สำหรับ TypeScript) Import Type จาก Supabase
import { PostgrestError } from '@supabase/supabase-js';

// 2. (สำหรับ TypeScript) กำหนด Interface สำหรับโครงสร้างข้อมูลของ Examiner
// คุณต้องปรับแก้ interface นี้ให้ตรงกับคอลัมน์จริงในตาราง 'examiner' ของคุณ
interface Examiner {
  ExaminerID: number;
  SessionID: number;
  RoomID: number;
  IDCardNumber: string;
  Title: string;
  FirstName: string;
  LastName: string;
  Gender: string;
  TitleEng: string;
  FirstNameEng: string;
  LastNameEng: string;
  Phone: string;
  Email: string;
  SpecialNeeds: string | null; // อาจเป็น null ได้
  Nationality: string;
  // เพิ่มคอลัมน์ที่เป็นตัวเลขที่คุณต้องการใช้สำหรับ dataKey ของ Line chart
  // ตัวอย่าง: ถ้ามีคอลัมน์ 'exams_conducted' หรือ 'average_score'
  exams_conducted?: number; // ตัวอย่าง: เพิ่ม property นี้ถ้ามีใน DB
  average_score?: number; // ตัวอย่าง: เพิ่ม property นี้ถ้ามีใน DB
}


const OverviewChart = () => {
  // 3. ระบุ Type ที่ชัดเจนให้กับ useState
  const [examinerData, setExaminerData] = useState<Examiner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchExaminersFromSupabase = async () => {
      setLoading(true);
      setErrorMessage(null);

      try {
        const { data, error } = await supabase
          .from('examiner')
          .select('*');

        if (error) {
          console.error('Error Loading Examiners from Supabase:', error);
          // 4. (สำหรับ TypeScript) Cast error เป็น PostgrestError เพื่อให้แน่ใจว่ามี .message
          setErrorMessage((error as PostgrestError).message);
          setExaminerData([]);
        } else {
          // 5. (สำหรับ TypeScript) Cast data เป็น Examiner[]
          setExaminerData((data as Examiner[]) || []);
        }
      } catch (err) {
        console.error('Unexpected error during Supabase fetch:', err);
        // (สำหรับ TypeScript) Cast err เป็น Error เพื่อให้แน่ใจว่ามี .message
        setErrorMessage((err as Error).message || 'An unexpected error occurred during data fetching.');
        setExaminerData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExaminersFromSupabase();
  }, []);

  return (
    <div>
      <div className="bg-linear-to-tr from-indigo-800 to-sky-800 p-4 md:p-6 mx-2 md:mx-0
      backdrop-blur-md shadow-lg rounded-xl">
        <h2 className="text-base md:text-lg font-medium mb-4 text-gray-100 text-center md:text-left">
          Examiner Overview
        </h2>

        {loading && <p className="text-gray-300 text-center">Loading examiner data for chart...</p>}
        {errorMessage && <p className="text-red-400 text-center">Error: {errorMessage}</p>}

        {!loading && !errorMessage && examinerData.length === 0 && (
          <p className="text-gray-300 text-center">No examiner data available to display in chart.</p>
        )}

        {!loading && !errorMessage && examinerData.length > 0 && (
          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={examinerData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                <XAxis
                  // 6. dataKey นี้ต้องมีอยู่ใน interface Examiner ที่คุณสร้างขึ้น
                  dataKey="FirstNameEng" // ตัวอย่าง: ใช้ชื่อภาษาอังกฤษ
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.8)",
                    borderColor: "#4b5563",
                    fontSize: "12px"
                  }}
                  itemStyle={{ color: "#e5e7eb" }}
                />
                <Line
                  type="monotone"
                  // 7. dataKey นี้ต้องเป็น property ที่เป็นตัวเลขใน interface Examiner
                  dataKey="exams_conducted" // **คุณต้องเปลี่ยนเป็นชื่อคอลัมน์ตัวเลขจริงในตาราง Examiner ของคุณ**
                                          // เช่น 'exams_conducted' หรือ 'average_score' ตามที่คุณเพิ่มใน interface ด้านบน
                  stroke="#9c27b0"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewChart;