// eslint-disable @typescript-eslint/no-explicit-any 
'use client'; // ต้องใส่ 'use client' เพราะใช้ useSearchParams

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import SavedPlansPanel from '../components/SavedPlansPanel'; // ตรวจสอบ path
import PlanDetailsModal from '../components/PlanDetailsModal'; // นำเข้าคอมโพเนนต์ Modal

export default function ExamDashboardPage() {
  const searchParams = useSearchParams();
  const initialPlanId = searchParams.get('planId'); // ดึง planId จาก URL เมื่อโหลดครั้งแรก

  const [modalPlanId, setModalPlanId] = useState<string | null>(initialPlanId); // State สำหรับควบคุม Modal
  const [showInitialLoading, setShowInitialLoading] = useState(true); // สำหรับจัดการการโหลดเริ่มต้นจาก URL

  // Effect สำหรับจัดการการเปิด Modal เมื่อมี planId ใน URL ตอนโหลดครั้งแรก
  useEffect(() => {
    if (initialPlanId) {
      setModalPlanId(initialPlanId);
    }
    setShowInitialLoading(false); // ซ่อน loading หลังจากตรวจสอบ initialPlanId
  }, [initialPlanId]);

  // ฟังก์ชันสำหรับโหลดแผนที่นั่ง (จะถูกส่งไปยัง SavedPlansPanel)
  const handleLoadArrangement = (planId: string) => {
    setModalPlanId(planId); // ตั้งค่า planId เพื่อเปิด Modal
  };

  // ฟังก์ชันสำหรับปิด Modal
  const handleCloseModal = () => {
    setModalPlanId(null); // ตั้งค่า planId เป็น null เพื่อปิด Modal
    // สามารถลบ planId ออกจาก URL ได้ถ้าต้องการ
    // const newSearchParams = new URLSearchParams(searchParams.toString());
    // newSearchParams.delete('planId');
    // window.history.replaceState({}, '', `?${newSearchParams.toString()}`);
  };

  // ฟังก์ชันสำหรับจัดการการลบแผน (ส่งผ่านไปยัง SavedPlansPanel)
  const handleDeletePlan = (planId: string) => {
    // Logic เพิ่มเติมหากต้องการทำอะไรหลังจากลบแผน
    console.log(`แผน ID: ${planId} ถูกลบแล้ว`);
    // หาก Modal กำลังแสดงแผนที่ถูกลบอยู่ ก็ควรปิด Modal ด้วย
    if (modalPlanId === planId) {
      setModalPlanId(null);
    }
  };

  if (showInitialLoading) {
    // แสดง loading ชั่วคราวในขณะที่ตรวจสอบ initialPlanId
    return <div className="text-center py-10 text-gray-600">กำลังเตรียมหน้าแผนผังที่นั่งสอบ...</div>;
  }

  return (
    <div className="container mx-auto p-2 min-h-screen font-inter">
      <div className="flex justify-center bg-linear-to-t from-sky-600 to-indigo-700 p-4 rounded-md mb-4">
        <h1 className="text-3xl font-extrabold text-center text-white drop-shadow-md">
        แผนผังที่นั่งสอบทั้งหมด
      </h1>
      </div>
      

      {/* แสดง SavedPlansPanel ที่นี่ */}
      <SavedPlansPanel
        onLoadArrangement={handleLoadArrangement}
        onDeletePlan={handleDeletePlan}
      />

      {/* แสดง Modal รายละเอียดแผน หากมี modalPlanId ถูกตั้งค่า */}
      {modalPlanId && (
        <PlanDetailsModal
          planId={modalPlanId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
