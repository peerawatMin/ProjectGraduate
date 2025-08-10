// components/ActionButtonsPanel.tsx
'use client'
import Image from 'next/image';
import React from 'react';

interface ActionButtonsPanelProps {
  loading: boolean;
  hasExaminers: boolean;
  hasArrangedSeats: boolean;
  onFetchExaminers: () => void;
  onArrangeSeats: () => void;
  onSaveArrangement: () => void;
}

export default function ActionButtonsPanel({
  loading,
  hasExaminers,
  hasArrangedSeats,
  onFetchExaminers,
  onArrangeSeats,
  onSaveArrangement
}: ActionButtonsPanelProps) {
  return (
    <div className="p-2">
      <div className="flex flex-wrap items-center mx-5 gap-4">
        <button
          onClick={onFetchExaminers}
          disabled={loading}
          
          className="flex px-6 py-3 items-center text-center bg-linear-to-t from-red-400 to-pink-600 text-white rounded-lg font-semibold hover:shadow-2xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="items-center flex">
            <Image src="/import.png" alt='importExaminer' width={40} height={40} className='px-2' />
          {loading ? 'กำลังโหลด...' : 'ดึงผู้เข้าสอบ'} 
          </div>
        </button>
        
        <button
          onClick={onArrangeSeats}
          disabled={!hasExaminers}
          className="px-12  py-3 bg-linear-to-t from-purple-500 to-orange-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          จัดที่นั่ง
        </button>
        <button
          onClick={onSaveArrangement}
          disabled={!hasArrangedSeats}
          className="px-10 py-3 bg-linear-to-t from-emerald-600 to-lime-600 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          บันทึก
        </button>
      </div>
    </div>
  );
}