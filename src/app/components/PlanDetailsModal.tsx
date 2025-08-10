/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { SavedPlan, ExamRoomAllocation } from '@/types/examTypes'; // Adjust path if necessary
import MultiRoomSeatMap from './MultiRoomSeatMap'; // Adjust path if necessary
import { supabase } from '../../lib/supabaseClient'; // Make sure supabase is accessible here

interface PlanDetailsModalProps {
  planId: string | null;
  onClose: () => void;
}

export default function PlanDetailsModal({ planId, onClose }: PlanDetailsModalProps) {
  const [planData, setPlanData] = useState<SavedPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (planId) {
      const fetchPlanData = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data, error } = await supabase
            .from('seating_plans')
            .select('*')
            .eq('seatpid', planId)
            .single(); // Fetch a single record

          if (error) {
            throw new Error(error.message);
          }

          if (data) {
            setPlanData(data as SavedPlan);
          } else {
            setError("ไม่พบข้อมูลแผนที่นั่งสำหรับ ID นี้");
          }
        } catch (err: any) {
          console.error("Error fetching plan data:", err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchPlanData();
    } else {
      setLoading(false);
      setError("ไม่พบรหัสแผนที่นั่ง");
    }
  }, [planId]);

  // Calculate total arranged seats if needed
  let totalArrangedSeats = 0;
  if (planData?.arrangement_data && Array.isArray(planData.arrangement_data)) {
    planData.arrangement_data.forEach((roomAlloc: ExamRoomAllocation) => {
      totalArrangedSeats += roomAlloc.allocatedSeats;
    });
  }

  return (
    <div className="fixed inset-0 bg-tranparent backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-linear-to-t from-sky-600 to-indigo-700 p-8 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-red-800 hover:text-red-500 text-3xl font-bold leading-none"
        >
          &times;
        </button>
        <h1 className="text-2xl font-bold mb-6 text-center text-white">รายละเอียดแผนที่นั่ง</h1>

        {loading && (
          <div className="text-center py-10 text-gray-600">กำลังโหลดข้อมูลแผนที่นั่ง...</div>
        )}

        {error && (
          <div className="text-center py-10 text-red-600">เกิดข้อผิดพลาด: {error}</div>
        )}

        {!loading && !error && !planData && (
          <div className="text-center py-10 text-gray-500">ไม่พบข้อมูลแผนที่นั่งสำหรับ ID นี้</div>
        )}

        {planData && (
          <>
            <p className="text-[18px] mb-3 font-semibold text-white">
              <span className="text-white">ชื่อแผน:</span> {planData.plan_name}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-200 mb-6">
              <p><strong>รูปแบบการจัด:</strong> {planData.seating_pattern}</p>
              <p><strong>ห้องสอบ:</strong> {planData.exam_room_name || 'ไม่ระบุ'}</p>
              <p><strong>จำนวนผู้เข้าสอบทั้งหมด:</strong> {planData.total_examinees} คน</p>
              <p><strong>จำนวนที่จัดแล้ว:</strong> {planData.exam_count} คน</p>
              <p><strong>รวมที่นั่งที่จัด:</strong> {totalArrangedSeats} ที่นั่ง</p>
              <p><strong>ขนาดห้อง (สูงสุด):</strong> {planData.room_rows} x {planData.room_cols}</p>
            </div>
            <div className="mb-6">
              <h2 className="text-[18px] font-semibold text-white mb-2">คำอธิบาย:</h2>
              <p className="bg-sky-100 p-4 rounded-md font-semibold text-blue-800 border border-gray-200">
                {planData.exam_room_description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับแผนนี้'}
              </p>
            </div>
            <div className="text-sm text-gray-200 border-t pt-4">
              <p>บันทึกเมื่อ: {new Date(planData.created_at).toLocaleString('th-TH')}</p>
              <p>อัปเดตล่าสุด: {new Date(planData.updated_at || planData.created_at).toLocaleString('th-TH')}</p>
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