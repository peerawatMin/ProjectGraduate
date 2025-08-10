// components/ExamSessionDetail.tsx
import React from 'react';
import { CurrentExamSessionState } from '../../types/examTypes';
import SessionSummary from '../components/SessionSummary';
import MultiRoomSeatMap from '../components/MultiRoomSeatMap';
import Link from 'next/link';

interface ExamSessionDetailProps {
  session: CurrentExamSessionState;
}

export default function ExamSessionDetail({ session }: ExamSessionDetailProps) {
  if (!session) {
    return (
      <div className="text-center p-10 text-red-500 text-xl bg-white rounded-lg shadow-md mt-10 mx-auto max-w-lg">
        <p>ไม่พบข้อมูลรอบสอบ</p>
        {/* REMOVED: legacyBehavior and <a> tag */}
        <Link
          href="/exam-sessions"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          กลับไปที่หน้ารายการรอบสอบ
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto bg-gray-100 min-h-screen font-inter p-6">
      <div className="bg-gradient-to-tr from-blue-500 to-indigo-800 text-white p-4 rounded-lg shadow-lg mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">{session.name}</h1>
        <p className="text-center text-lg">{session.description || 'ไม่มีคำอธิบาย'}</p>
      </div>

      <SessionSummary session={session} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2 border-gray-300">ผังที่นั่งสอบแต่ละห้อง</h2>
        <MultiRoomSeatMap allocations={session.rooms} />
      </div>

      <div className="flex justify-center mt-8">
        {/* REMOVED: legacyBehavior and <a> tag */}
        <Link
          href="/exam-sessions"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-shadow"
        >
          กลับไปที่หน้ารายการรอบสอบ
        </Link>
      </div>
    </div>
  );
}