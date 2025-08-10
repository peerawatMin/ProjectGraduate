// components/ExamSessionCard.tsx
import React from 'react';
import { ExamSession } from '../../types/examTypes';
import Link from 'next/link';

interface ExamSessionCardProps {
  session: ExamSession;
}

export default function ExamSessionCard({ session }: ExamSessionCardProps) {
  const totalAllocatedSeats = session.rooms.reduce((sum, room) => sum + room.allocatedSeats, 0);
  const totalCapacity = session.rooms.reduce((sum, room) => sum + room.room.totalSeats, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition-transform duration-200 hover:scale-105 hover:shadow-xl">
      <div className="p-6">
        <h3 className="text-xl font-bold text-indigo-700 mb-2 line-clamp-1">{session.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{session.description || 'ไม่มีคำอธิบาย'}</p>
        <div className="text-sm text-gray-500 mb-4 space-y-1">
          <p><strong>จำนวนผู้เข้าสอบ:</strong> {session.totalExaminees} คน</p>
          <p><strong>จำนวนห้องสอบ:</strong> {session.rooms.length} ห้อง</p>
          <p><strong>ที่นั่งที่จัดสรร:</strong> {totalAllocatedSeats} / {totalCapacity} ที่นั่ง</p>
          <p>
            <strong>สร้างเมื่อ:</strong>{' '}
            {new Date(session.createdAt).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {/* REMOVED: legacyBehavior and <a> tag */}
        <Link
          href={`/exam-sessions/${session.id}`}
          className="inline-block w-full bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center font-medium"
        >
          ดูรายละเอียด
        </Link>
      </div>
    </div>
  );
}