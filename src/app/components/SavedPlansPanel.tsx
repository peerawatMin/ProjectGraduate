/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { SavedPlan, ExamRoomAllocation } from '@/types/examTypes';
import PlanDetailsModal from './PlanDetailsModal';
import Loading from './Loading';
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'react-toastify';
import SavedPlanExportModal, { ExamSessionLite } from './SavedPlanExportModal';
import { FolderInput, RotateCcw } from 'lucide-react';

type Props = {
  onLoadArrangement: (planId: string) => void;
  onDeletePlan: (planId: string) => void;
};

type ExamSession = {
  session_id: string;
  session_name?: string;
  exam_date: string;
  exam_start_time: string;
  exam_end_time: string;
};

const patternTH = (pattern: string) => {
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

const formatThaiDateTime = (iso: string) =>
  new Date(iso).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function SavedPlansPanel({ onLoadArrangement, onDeletePlan }: Props) {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlanIdForModal, setSelectedPlanIdForModal] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPlanForDelete, setSelectedPlanForDelete] = useState<SavedPlan | null>(null);

  // Export
  const [showExport, setShowExport] = useState(false);
  const [selectedPlanForExport, setSelectedPlanForExport] = useState<SavedPlan | null>(null);

  const fetchPlans = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const { data: plansData, error: plansError } = await supabase
        .from('seating_plans')
        .select('*')
        .order('created_at', { ascending: false });
      if (plansError) throw plansError;
      setSavedPlans((plansData || []) as SavedPlan[]);

      const { data: sessionsData, error: sessionsError } = await supabase
        .from('exam_session')
        .select('*')
        .order('exam_date', { ascending: true });
      if (sessionsError) throw sessionsError;
      setExamSessions((sessionsData || []) as ExamSession[]);
    } catch (err: any) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      setSavedPlans([]);
      setExamSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleDelete = useCallback(
    async (planId: string, planName: string) => {
      const { error } = await supabase.from('seating_plans').delete().eq('seatpid', planId);
      if (error) {
        toast.error('เกิดข้อผิดพลาดขณะลบ: ' + error.message);
      } else {
        toast.success('ลบแผนที่นั่งสอบสำเร็จ');
        setSavedPlans((prev) => prev.filter((p) => p.seatpid !== planId));
        onDeletePlan(planId);
      }
    },
    [onDeletePlan]
  );

  const onRefresh = useCallback(() => {
    fetchPlans();
  }, [fetchPlans]);

  const sessionById = useCallback(
    (sid?: string | null) => examSessions.find((s) => s.session_id === sid) as ExamSessionLite,
    [examSessions]
  );

  if (loading) return <Loading />;

  if (savedPlans.length === 0) {
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-sky-600 to-indigo-800 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">แผนที่นั่งที่บันทึกไว้</h2>
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 text-sm"
            aria-label="รีเฟรชข้อมูล"
          >
            รีเฟรช
          </button>
        </div>

        <div className="text-center text-yellow-300 py-8">
          <p className="text-lg">ยังไม่มีแผนที่นั่งที่บันทึกไว้</p>
          <p className="text-sm mt-2 opacity-90">จัดที่นั่งและบันทึกเพื่อดูแผนที่นี่</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 p-6 bg-gradient-to-r from-sky-600 to-indigo-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">
          แผนที่นั่งที่บันทึกไว้ ({savedPlans.length} แผน)
        </h2>
        <button
          onClick={onRefresh}
          className="px-2 py-2 bg-gray-800 rounded-full text-white  hover:bg-gray-600 hover:text-yellow-500 text-sm"
          aria-label="รีเฟรชข้อมูล"
        >
          <RotateCcw/>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedPlans.map((plan) => {
          const totalArrangedSeats = Array.isArray(plan.arrangement_data)
            ? (plan.arrangement_data as ExamRoomAllocation[]).reduce((sum, r) => sum + (r?.allocatedSeats ?? 0), 0)
            : 0;

          const examSession = sessionById(plan.session_id);

          return (
            <div
              key={plan.seatpid}
              className="p-5 bg-white border border-gray-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] flex flex-col"
            >
              {/* หัวข้อแผน */}
              <div className="mb-2 border-b pb-3">
                <h3 className="font-semibold text-xl text-gray-800 truncate" title={plan.plan_name}>
                  {plan.plan_name}
                </h3>
                {plan.exam_room_name && (
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    🏫 {plan.exam_room_name}
                  </p>
                )}
              </div>

              {/* รายละเอียดห้อง + รอบสอบ */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <span className="font-medium text-gray-600">รูปแบบ</span>
                  <span>{patternTH(plan.seating_pattern)}</span>

                  <span className="font-medium text-gray-600">ขนาดห้อง</span>
                  <span>{plan.room_rows} × {plan.room_cols}</span>

                  <span className="font-medium text-gray-600">ผู้เข้าสอบ</span>
                  <span>{plan.total_examinees ?? 0} คน</span>

                  <span className="font-medium text-gray-600">จัดที่นั่งแล้ว</span>
                  <span>{plan.exam_count ?? 0} คน</span>

                  <span className="font-medium text-gray-600">รวมที่จัด</span>
                  <span>{totalArrangedSeats} ที่นั่ง</span>

                  {examSession ? (
                    <>
                      <span className="font-medium text-gray-600">วันที่สอบ</span>
                      <span>{examSession.exam_date}</span>

                      <span className="font-medium text-gray-600">เวลา</span>
                      <span>{examSession.exam_start_time} - {examSession.exam_end_time}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-gray-600">รอบสอบ</span>
                      <span className="text-red-500">⚠️ ไม่พบข้อมูลรอบสอบ</span>
                    </>
                  )}
                </div>
              </div>

              {/* คำอธิบายห้องสอบ */}
              {plan.exam_room_description && (
                <div className="mb-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  💭 {plan.exam_room_description}
                </div>
              )}

              {/* วันที่สร้าง */}
              <p className="text-gray-500 text-xs mb-4">
                📅 {formatThaiDateTime(plan.created_at)}
              </p>

              {/* ปุ่ม action */}
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={() => onLoadArrangement(plan.seatpid)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                  aria-label={`โหลดแผน ${plan.plan_name}`}
                >
                  📋 โหลดแผนนี้
                </button>

                <button
                  onClick={() => {
                    setSelectedPlanForDelete(plan);
                    setShowConfirm(true);
                  }}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                  title="ลบแผนนี้"
                  aria-label={`ลบแผน ${plan.plan_name}`}
                >
                  🗑️
                </button>

                {/* ปุ่มใหม่: ส่งออก */}
                <button
                  onClick={() => {
                    setSelectedPlanForExport(plan);
                    setShowExport(true);
                  }}
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm"
                  title="ส่งออกผัง/QR/PDF"
                  aria-label={`ส่งออกแผน ${plan.plan_name}`}
                >
                  <FolderInput/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal ดูรายละเอียดเดิม (ถ้าใช้) */}
      {selectedPlanIdForModal && (
        <PlanDetailsModal
          planId={selectedPlanIdForModal}
          onClose={() => setSelectedPlanIdForModal(null)}
        />
      )}

      {/* Confirm ลบ */}
      <ConfirmDialog
        show={showConfirm}
        title="ยืนยันการลบ"
        message={`คุณต้องการลบแผน "${selectedPlanForDelete?.plan_name}" ใช่หรือไม่?`}
        onConfirm={() => {
          if (selectedPlanForDelete) {
            handleDelete(selectedPlanForDelete.seatpid, selectedPlanForDelete.plan_name);
          }
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
        confirmLabel="ลบ"
        cancelLabel="ยกเลิก"
      />

      {/* Modal Export */}
      {showExport && selectedPlanForExport && (
        <SavedPlanExportModal
          plan={selectedPlanForExport}
          examSession={sessionById(selectedPlanForExport.session_id)}
          onClose={() => {
            setShowExport(false);
            setSelectedPlanForExport(null);
          }}
          onSaved={() => {
            // ถ้าต้องการให้โหลดรายการใหม่เพื่อเห็น URL ที่อัปเดตบนการ์ด
            fetchPlans();
          }}
        />
      )}
    </div>
  );
}
