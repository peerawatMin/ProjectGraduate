/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // ตรวจสอบว่า path ถูกต้อง
import { SavedPlan, ExamRoomAllocation } from '@/types/examTypes';
import PlanDetailsModal from './PlanDetailsModal'; // Import the new modal component

export default function SavedPlansPanel({
  onLoadArrangement,
  onDeletePlan
}: {
  onLoadArrangement: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
}) {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanIdForModal, setSelectedPlanIdForModal] = useState<string | null>(null); // State to hold the ID for the modal

  const fetchPlans = async (): Promise<void> => {
    setLoading(true);
    const { data, error } = await supabase
      .from('seating_plans')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('โหลดข้อมูลไม่สำเร็จ:', error.message);
    } else {
      setSavedPlans(data as SavedPlan[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDelete = async (planId: string, planName: string) => {
    if (window.confirm(`คุณต้องการลบแผน "${planName}" หรือไม่?`)) {
      const { error } = await supabase
        .from('seating_plans')
        .delete()
        .eq('seatpid', planId);

      if (error) {
        alert('เกิดข้อผิดพลาดขณะลบ: ' + error.message);
      } else {
        setSavedPlans((prev) => prev.filter((p) => p.seatpid !== planId));
        onDeletePlan(planId); // ถ้าคุณมี logic เพิ่มเติมภายนอก
      }
    }
  };

  const handleOpenModal = (planId: string) => {
    setSelectedPlanIdForModal(planId);
  };

  const handleCloseModal = () => {
    setSelectedPlanIdForModal(null);
  };

  const getSeatingPatternText = (pattern: string) => {
    switch (pattern) {
      case 'single_row': return 'แถวเดี่ยว';
      case 'zigzag': return 'สลับฟันปลา';
      case 'checkerboard': return 'หมากรุกดำ';
      case 'diagonal': return 'แนวทแยง';
      case 'spiral': return 'เกลียวหอย';
      case 'random': return 'สุ่ม';
      case 'sequential': return 'จัดตามลำดับ';
      default: return pattern;
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">กำลังโหลดแผนที่นั่ง...</div>;
  }

  if (savedPlans.length === 0) {
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-600">แผนที่นั่งที่บันทึกไว้</h2>
        <div className="text-center text-gray-500 py-8">
          <p className="text-lg">ยังไม่มีแผนที่นั่งที่บันทึกไว้</p>
          <p className="text-sm mt-2">จัดที่นั่งและบันทึกเพื่อดูแผนที่นี่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-sky-600 to-indigo-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">
        แผนที่นั่งที่บันทึกไว้ ({savedPlans.length} แผน)
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedPlans.map((plan) => {
          let totalArrangedSeats = 0;
          if (plan.arrangement_data && Array.isArray(plan.arrangement_data)) {
            plan.arrangement_data.forEach((roomAlloc: ExamRoomAllocation) => {
              totalArrangedSeats += roomAlloc.allocatedSeats;
            });
          }

          return (
            <div
              key={plan.seatpid}
              // Added flex and flex-col to make content within the card a flex container
              // Added justify-between to space items evenly along the column axis
              className="p-4 bg-white border border-gray-500 rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col"
            >
              <div className="mb-3 border-b pb-2">
                <h3 className="font-semibold text-lg text-gray-800 truncate" title={plan.plan_name}>
                  {plan.plan_name}
                </h3>
                {plan.exam_room_name && (
                  <p className="text-sm text-blue-600 font-medium">🏫 {plan.exam_room_name}</p>
                )}
              </div>

              <div className="space-y-2 mb-3">
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">รูปแบบ:</span> {getSeatingPatternText(plan.seating_pattern)}
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">ขนาดห้อง:</span> {plan.room_rows}×{plan.room_cols}
                </p>
                {plan.total_examinees !== undefined && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">จำนวนผู้เข้าสอบ:</span> {plan.total_examinees} คน
                  </p>
                )}
                {plan.exam_count !== undefined && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">จัดที่นั่งแล้ว:</span> {plan.exam_count} คน
                  </p>
                )}
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">รวมที่จัด:</span> {totalArrangedSeats} ที่นั่ง
                </p>
              </div>

              {plan.exam_room_description && (
                <div className="mb-3 p-1 bg-gray-50 rounded text-sm">
                  <p className="text-gray-700 line-clamp-2" title={plan.exam_room_description}>
                    💭 {plan.exam_room_description}
                  </p>
                </div>
              )}

              <p className="text-gray-500 text-xs mb-3">
                📅 {new Date(plan.created_at).toLocaleString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {/* Added mt-auto to push this div to the bottom */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => handleOpenModal(plan.seatpid)} // Call new handler
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  📋 โหลดแผนนี้
                </button>
                <button
                  onClick={() => handleDelete(plan.seatpid, plan.plan_name)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  title="ลบแผนนี้"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Render the modal component if selectedPlanIdForModal is not null */}
      {selectedPlanIdForModal && (
        <PlanDetailsModal
          planId={selectedPlanIdForModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}