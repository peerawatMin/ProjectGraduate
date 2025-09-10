'use client';

import React from 'react';
import { ExamSeat } from '../../types/examTypes';

interface ExaminerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  seat: ExamSeat | null;
}

export const ExaminerDetailsModal: React.FC<ExaminerDetailsModalProps> = ({ isOpen, onClose, seat }) => {
  if (!isOpen || !seat || !seat.examiner) return null;

  const { seat_number, examiner } = seat;
  const {
    examinerid,
    idcardnumber,
    examinee_number,
    title,
    firstname,
    lastname,
    gender,
    phone,
    email,
    nationality,
    specialneeds,
  } = examiner;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-40 backdrop-blur-md">
    <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500 text-white p-6 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-fadeIn">
      {/* ปุ่มปิด */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold"
      >
        &times;
      </button>

      {/* Header */}
      <h3 className="text-xl font-extrabold mb-4 text-center text-white border-b pb-2">
        ข้อมูลผู้เข้าสอบ
      </h3>

      {/* เนื้อหา */}
      <div className="grid grid-cols-[150px_1fr] gap-y-2 text-sm">
        <span className="font-semibold">เลขที่นั่ง:</span>
        <span className="font-semibold text-yellow-400">{seat_number}</span>

        <span className="font-semibold">รหัสผู้สอบ:</span>
        <span className='text-gray-200'>{examinerid}</span>

        <span className="font-semibold">ชื่อ-นามสกุล:</span>
        <span className='text-gray-200'>{`${title} ${firstname} ${lastname}`}</span>

        <span className="font-semibold">เลขประจำตัวสอบ:</span>
        <span className='text-gray-200'>{examinee_number || '-'}</span>

        <span className="font-semibold">เลขบัตรประชาชน:</span>
        <span className='text-gray-200'>{idcardnumber || '-'}</span>

        <span className="font-semibold">เพศ:</span>
        <span className='text-gray-200'>{gender || '-'}</span>

        <span className="font-semibold">สัญชาติ:</span>
        <span className='text-gray-200'>{nationality || '-'}</span>

        <span className="font-semibold">เบอร์โทร:</span>
        <span className='text-gray-200'>{phone || '-'}</span>

        <span className="font-semibold">อีเมล:</span>
        <span className='text-gray-200'>{email || '-'}</span>

        <span className="font-semibold ">เงื่อนไขพิเศษ:</span>
        <span
          className={`italic ${
            specialneeds ? 'text-yellow-400' : 'text-red-500'
          }`}
        >
          {specialneeds || 'ไม่มี'}
        </span>

      </div>
    </div>
  </div>
);

};
