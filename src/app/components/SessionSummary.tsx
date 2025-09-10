/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import React from 'react';
import { CurrentExamSessionState } from '../../types/examTypes'; // ตรวจสอบ path ให้ถูกต้อง

interface SessionSummaryProps {
  session: CurrentExamSessionState;
}

export default function SessionSummary({ session }: SessionSummaryProps) {
  const totalAllocated = session.rooms.reduce((sum, room) => sum + room.allocatedSeats, 0);
  const totalCapacity = session.rooms.reduce((sum, room) => sum + room.room.totalSeats, 0);

  const sortedRooms = [...session.rooms].sort((a, b) => {
    if (a.room.id && b.room.id) {
      return a.room.id.localeCompare(b.room.id);
    }
    return 0;
  });

  return (
    <div className="bg-gradient-to-t from-sky-600 to-indigo-700 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center text-white">รายละเอียดรอบสอบ</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="space-y-3">
          <h3 className="font-medium text-white">ชื่อรอบสอบ</h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-md font-semibold text-sky-600">{session.name}</p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-medium text-white">จำนวนผู้เข้าสอบ</h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-md font-semibold text-sky-600">{totalAllocated} / {session.totalExaminees} คน</p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-medium text-white">ทิศทางการจัดเรียง</h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-md font-semibold text-sky-600">{session.seatingPattern}</p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-medium text-white">จำนวนห้องสอบ</h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-md font-semibold text-sky-600">{session.rooms.length} ห้อง</p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-medium text-white">วันที่สอบ</h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-md font-semibold text-sky-600">{session.examDate}</p>
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-medium text-white">ช่วงเวลาที่สอบ</h3>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-md font-semibold text-sky-600">{session.examStartTime} - {session.examEndTime}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 "> 
        <div className="space-y-3">
          <h3 className="font-medium text-white">รายละเอียดห้องสอบ</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            {sortedRooms.map((allocation, index) => (
              <div key={allocation.room.id || index} className={`flex items-center justify-between py-2 ${index > 0 ? 'border-t border-blue-200 mt-2 pt-2' : ''}`}>
                <div>
                  <h4 className="font-medium text-blue-800">{allocation.room.name}</h4>
                  <p className="text-sm text-sky-600">{allocation.room.description || 'ไม่มีคำอธิบาย'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-800">ที่นั่งที่ใช้</p>
                  <p className="font-semibold text-sky-500">{allocation.allocatedSeats} / {allocation.room.totalSeats}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <h3 className="font-medium text-white">รายละเอียดการสอบ</h3>
          {session.description && (
            <div className="bg-blue-50 p-4 items-center rounded-lg mb-4"> {/* Added mb-4 for spacing */}
              <p className="text-sm text-blue-800">คำอธิบาย</p>
              <p className="text-sky-500 font-semibold">{session.description}</p>
            </div>
          )}
          {/* Combined 'สร้างเมื่อ' and 'อัปเดตล่าสุด' into one card */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="mb-2 pb-2 border-b border-blue-200"> {/* Added bottom border for separation */}
              <p className="text-sm text-blue-800">สร้างเมื่อ</p>
              <p className="text-sky-500 font-semibold">{session.createdAt.toLocaleString('th-TH')}</p>
            </div>
            <div>
              <p className="text-sm text-blue-800">อัปเดตล่าสุด</p>
              <p className="text-sky-500 font-semibold">{session.updatedAt.toLocaleString('th-TH')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}