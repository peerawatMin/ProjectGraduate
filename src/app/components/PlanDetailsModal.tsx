/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { SavedPlan, ExamRoomAllocation } from '@/types/examTypes';
import { MultiRoomSeatMap } from './MultiRoomSeatMap';
import { supabase } from '../../lib/supabaseClient';

interface PlanDetailsModalProps {
  planId: string | null;
  onClose: () => void;
}

export default function PlanDetailsModal({ planId, onClose }: PlanDetailsModalProps) {
  const [planData, setPlanData] = useState<SavedPlan | null>(null);
  const [examSession, setExamSession] = useState<{
    session_name: string;
    exam_date: string;
    exam_start_time: string;
    exam_end_time: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) {
      setLoading(false);
      setError("ไม่พบรหัสแผนที่นั่ง");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1️⃣ Fetch seating plan
        const { data: plan, error: planError } = await supabase
          .from('seating_plans')
          .select('*')
          .eq('seatpid', planId)
          .single();

        if (planError) throw new Error(planError.message);
        if (!plan) throw new Error("ไม่พบข้อมูลแผนที่นั่งสำหรับ ID นี้");

        setPlanData(plan as SavedPlan);

        // 2️⃣ Fetch exam_session แยก
        if (plan.session_id) {
          const { data: sessionData, error: sessionError } = await supabase
            .from('exam_session')
            .select('session_name, exam_date, exam_start_time, exam_end_time')
            .eq('session_id', plan.session_id)
            .single();

          if (sessionError) throw new Error(sessionError.message);
          setExamSession(sessionData);
        } else {
          setExamSession(null);
        }
      } catch (err: any) {
        console.error("Error fetching plan or session:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [planId]);

  // Calculate total arranged seats
  let totalArrangedSeats = 0;
  if (planData?.arrangement_data && Array.isArray(planData.arrangement_data)) {
    planData.arrangement_data.forEach((roomAlloc: ExamRoomAllocation) => {
      totalArrangedSeats += roomAlloc.allocatedSeats;
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-t from-sky-500 via-blue-600  to-indigo-700 p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-800 hover:text-red-500 text-3xl font-bold leading-none"
        >
          &times;
        </button>

        <h1 className="text-2xl font-bold mb-6 text-center text-white">รายละเอียดแผนที่นั่ง</h1>

        {loading && <div className="text-center py-10 text-gray-200">กำลังโหลดข้อมูลแผนที่นั่ง...</div>}
        {error && <div className="text-center py-10 text-red-600">{error}</div>}
        {!loading && !error && !planData && (
          <div className="text-center py-10 text-gray-200">ไม่พบข้อมูลแผนที่นั่งสำหรับ ID นี้</div>
        )}

        {planData && (
          <>
            <div className="space-y-6">
              {/* ชื่อแผน */}
              <div>
                <p className="text-[20px] font-bold text-white">{planData.plan_name}</p>
              </div>

              {/* ข้อมูลหลัก */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200">
                <div className="flex flex-col gap-2">
                  <p><strong>รูปแบบการจัด:</strong> {planData.seating_pattern}</p>
                  <p><strong>ห้องสอบ:</strong> {planData.exam_room_name || 'ไม่ระบุ'}</p>
                  <p><strong>จำนวนผู้เข้าสอบทั้งหมด:</strong> {planData.total_examinees} คน</p>
                  <p><strong>รวมที่นั่งที่จัด:</strong> {totalArrangedSeats} ที่นั่ง</p>
                </div>

                <div className="flex flex-col gap-2">
                  {examSession ? (
                    <>
                      <p><strong>รอบสอบ:</strong> {examSession.session_name}</p>
                      <p><strong>วันที่สอบ:</strong> {examSession.exam_date}</p>
                      <p><strong>เวลา:</strong> {examSession.exam_start_time} - {examSession.exam_end_time}</p>
                    </>
                  ) : (
                    <p>ไม่พบข้อมูล session</p>
                  )}
                  <p><strong>ขนาดห้อง (สูงสุด):</strong> {planData.room_rows} x {planData.room_cols}</p>
                </div>
              </div>

              {/* คำอธิบาย */}
              <div>
                <h2 className="text-[18px] font-semibold text-white mb-2">คำอธิบาย:</h2>
                <p className="bg-sky-100 p-4 rounded-md font-medium text-blue-800 border border-gray-200">
                  {planData.exam_room_description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับแผนนี้'}
                </p>
              </div>

              {/* วันที่บันทึก */}
              <div className="text-sm text-gray-200 border-t pt-4 flex flex-col gap-1">
                <p>บันทึกเมื่อ: {new Date(planData.created_at).toLocaleString('th-TH')}</p>
                <p>อัปเดตล่าสุด: {new Date(planData.updated_at || planData.created_at).toLocaleString('th-TH')}</p>
              </div>
            </div>


            {planData.arrangement_data && planData.arrangement_data.length > 0 && (
              <div className="mt-8">
                <MultiRoomSeatMap allocations={planData.arrangement_data} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
