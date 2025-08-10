// components/ExaminerCard.tsx
'use client'

import React from 'react';

interface ExaminerType {
  examinerid: number;
  idcardnumber: string;
  title: string;
  firstname: string;
  lastname: string;
  gender: string;
  phone: string;
  email: string;
  specialneeds: string;
  nationality: string;
}

interface ExaminerCardProps {
  examiner: ExaminerType;
  isSelected?: boolean;
  onSelect?: (isSelected: boolean) => void;
}

export default function ExaminerCard({ 
  examiner, 
  isSelected = false, 
  onSelect 
}: ExaminerCardProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelect) {
      onSelect(e.target.checked);
    }
  };

  return (
    <div className={`p-4 rounded-lg shadow-sm border-2 items-center transition-all duration-200 ${
      isSelected 
        ? 'border-blue-500 bg-blue-100' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {/* Checkbox สำหรับเลือก */}
      {onSelect && (
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id={`examiner-${examiner.examinerid}`}
            checked={isSelected}
            onChange={handleCheckboxChange}
            className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
          />
          <label 
            htmlFor={`examiner-${examiner.examinerid}`}
            className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
          >
          </label>
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">
            {examiner.title} {examiner.firstname} {examiner.lastname}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            examiner.gender === 'ชาย' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-pink-100 text-pink-800'
          }`}>
            {examiner.gender}
          </span>
        </div>
        
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center">
            <span className="font-medium min-w-[80px]">เลขบัตร:</span>
            <span>{examiner.idcardnumber}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium min-w-[80px]">โทรศัพท์:</span>
            <span>{examiner.phone || '-'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium min-w-[80px]">อีเมล:</span>
            <span className="break-all">{examiner.email || '-'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium min-w-[80px]">สัชชาติ:</span>
            <span>{examiner.nationality || '-'}</span>
          </div>
          
          {examiner.specialneeds && (
            <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <span className="font-medium text-yellow-800">ความต้องการพิเศษ:</span>
              <p className="text-yellow-700 text-sm mt-1">{examiner.specialneeds}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}