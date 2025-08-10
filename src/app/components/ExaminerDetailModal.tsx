// src/components/ExaminerDetailsModal.tsx

import React from 'react';
import { SeatPosition as Seat } from '../../types/examTypes'; // ใช้ SeatPosition ตาม type ใหม่

interface ExaminerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: Seat | null; // ส่ง seat object เข้ามา
}

export const ExaminerDetailsModal: React.FC<ExaminerDetailsModalProps> = ({ isOpen, onClose, seat }) => {
  if (!isOpen || !seat || !seat.examiner) {
    return null; // ไม่แสดง Modal ถ้าไม่เปิด หรือไม่มีข้อมูลที่นั่ง/ผู้สอบ
  }

  const { examinerid, title, firstname, lastname } = seat.examiner;
  const { seatNumber } = seat;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md animate-fade-in">
      <div className="bg-linear-to-t from-sky-600 to-indigo-700 p-6 items-center rounded-lg shadow-xl max-w-sm w-full mx-4 relative transform scale-95 transition-transform duration-500 ease-out sm:scale-100">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-2xl font-bold transition-colors duration-200"
          aria-label="Close modal"
        >
          &times;
        </button>
        <h3 className="text-2xl font-extrabold mb-4 text-white text-center border-b pb-2">ข้อมูลผู้เข้าสอบ</h3>
        <div className="space-y-3 text-white text-base">
          <p><strong>ที่นั่ง:</strong> <span className="font-semibold text-yellow-500">{seatNumber}</span></p>
          <p><strong>รหัสผู้สอบ:</strong> <span className="font-medium">{examinerid}</span></p>
          <p><strong>ชื่อ-นามสกุล:</strong> <span className="font-medium">{title} {firstname} {lastname}</span></p>
        </div>
      </div>
    </div>
  );
};