// components/ExaminerListModal.tsx
'use client'

import React, { useState, useMemo } from 'react';
import ExaminerCard from './ExaminerCard';
import { Funnel, RefreshCcw, RotateCcw, Sparkles } from 'lucide-react';

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

interface ExaminerListModalProps {
  isOpen: boolean;
  examiners: ExaminerType[];
  onClose: () => void;
  onArrangeSeats?: () => void;
  onReceiveSelectedExaminers?: (selectedExaminers: ExaminerType[]) => void;
}

export default function ExaminerListModal({
  isOpen,
  examiners,
  onClose,
  onArrangeSeats,
  onReceiveSelectedExaminers
}: ExaminerListModalProps) {
  const [selectedExaminers, setSelectedExaminers] = useState<ExaminerType[]>([]);
  
  // Filter states
  const [searchText, setSearchText] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [nationalityFilter, setNationalityFilter] = useState<string>('all');
  const [specialNeedsFilter, setSpecialNeedsFilter] = useState<string>('all');
  const [titleFilter, setTitleFilter] = useState<string>('all');

  // Get unique values for filters - always call useMemo before early return
  const uniqueNationalities = useMemo(() => {
    if (!isOpen) return [];
    return Array.from(new Set(examiners.map(e => e.nationality).filter(Boolean)));
  }, [examiners, isOpen]);

  const uniqueTitles = useMemo(() => {
    if (!isOpen) return [];
    return Array.from(new Set(examiners.map(e => e.title).filter(Boolean)));
  }, [examiners, isOpen]);

  // Filtered examiners
  const filteredExaminers = useMemo(() => {
    if (!isOpen) return [];
    
    return examiners.filter(examiner => {
      // Text search (name, ID card, phone, email)
      const matchesSearch = searchText === '' || 
        examiner.firstname.toLowerCase().includes(searchText.toLowerCase()) ||
        examiner.lastname.toLowerCase().includes(searchText.toLowerCase()) ||
        examiner.idcardnumber.includes(searchText) ||
        examiner.phone.includes(searchText) ||
        examiner.email.toLowerCase().includes(searchText.toLowerCase());

      // Gender filter
      const matchesGender = genderFilter === 'all' || examiner.gender === genderFilter;

      // Nationality filter
      const matchesNationality = nationalityFilter === 'all' || examiner.nationality === nationalityFilter;

      // Special needs filter
      const matchesSpecialNeeds = 
        specialNeedsFilter === 'all' ||
        (specialNeedsFilter === 'has' && examiner.specialneeds && examiner.specialneeds.trim() !== '') ||
        (specialNeedsFilter === 'none' && (!examiner.specialneeds || examiner.specialneeds.trim() === ''));

      // Title filter
      const matchesTitle = titleFilter === 'all' || examiner.title === titleFilter;

      return matchesSearch && matchesGender && matchesNationality && matchesSpecialNeeds && matchesTitle;
    });
  }, [examiners, searchText, genderFilter, nationalityFilter, specialNeedsFilter, titleFilter, isOpen]);

  // Early return after all hooks have been called
  if (!isOpen) return null;

  // Reset filters
  const resetFilters = () => {
    setSearchText('');
    setGenderFilter('all');
    setNationalityFilter('all');
    setSpecialNeedsFilter('all');
    setTitleFilter('all');
  };

  // ฟังก์ชันจัดการการเลือก/ยกเลิกการเลือกผู้เข้าสอบ
  const handleExaminerSelect = (examiner: ExaminerType, isSelected: boolean) => {
    if (isSelected) {
      setSelectedExaminers(prev => [...prev, examiner]);
    } else {
      setSelectedExaminers(prev => prev.filter(e => e.examinerid !== examiner.examinerid));
    }
  };

  // ฟังก์ชันเลือกทั้งหมد
  const handleSelectAll = () => {
    if (selectedExaminers.length === filteredExaminers.length && filteredExaminers.length > 0) {
      // ยกเลิกการเลือกเฉพาะใน filtered list
      setSelectedExaminers(prev => 
        prev.filter(selected => 
          !filteredExaminers.some(filtered => filtered.examinerid === selected.examinerid)
        )
      );
    } else {
      // เลือกทั้งหมดใน filtered list
      const newSelected = [...selectedExaminers];
      filteredExaminers.forEach(examiner => {
        if (!newSelected.some(s => s.examinerid === examiner.examinerid)) {
          newSelected.push(examiner);
        }
      });
      setSelectedExaminers(newSelected);
    }
  };

  // ฟังก์ชันจัดที่นั่งกับผู้เข้าสอบที่เลือก
  const handleArrangeSelectedSeats = () => {
    if (selectedExaminers.length === 0) {
      alert('กรุณาเลือกผู้เข้าสอบก่อนจัดที่นั่ง');
      return;
    }

    if (onReceiveSelectedExaminers) {
      onReceiveSelectedExaminers(selectedExaminers);
    }
  };

  // ฟังก์ชันจัดที่นั่งทั้งหมด
  const handleArrangeAllSeats = () => {
    if (onArrangeSeats) {
      onArrangeSeats();
    }
  };

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-200 p-8 rounded-lg shadow-xl w-[1400px] h-auto max-h-[80vh] max-w-[90vw] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-indigo-700 text-center">
            รายชื่อผู้เข้าสอบ ({examiners.length} คน)
            {filteredExaminers.length !== examiners.length && (
              <span className="text-lg text-blue-600 ml-2">
                (แสดง {filteredExaminers.length} คน)
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-red-600 text-3xl font-bold p-1 hover:bg-transparent rounded-full transition-colors"
            aria-label="ปิด"
          >
            &times;
          </button>
        </div>

        {/* ส่วนกรองข้อมูล */}
        <div className="bg-linear-to-t from-sky-500 to-indigo-800 p-4 rounded-lg shadow-sm mb-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-yellow-300">กรองข้อมูล</h3>
            <button
              onClick={resetFilters}
              className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
            >
              <RefreshCcw/>
            </button>
          </div>
          
          {/* Search Box */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-white mb-1">ค้นหา (ชื่อ, เลขบัตร, โทรศัพท์, อีเมล)</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="พิมพ์คำค้นหา..."
              className="px-3 py-2 text-gray-200 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Gender Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white mb-1">เพศ</label>
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-3 py-2 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="all" className='text-black'>ทั้งหมด</option>
                <option value="ชาย" className='text-black'>ชาย</option>
                <option value="หญิง" className='text-black'>หญิง</option>
              </select>
            </div>

            {/* Title Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white mb-1">คำนำหน้า</label>
              <select
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                className="px-3 py-2 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className='text-black' value="all">ทั้งหมด</option>
                {uniqueTitles.map(title => (
                  <option className='text-black' key={title} value={title}>{title}</option>
                ))}
              </select>
            </div>

            {/* Nationality Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white mb-1">สัญชาติ</label>
              <select
                value={nationalityFilter}
                onChange={(e) => setNationalityFilter(e.target.value)}
                className="px-3 py-2 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className='text-black' value="all">ทั้งหมด</option>
                {uniqueNationalities.map(nationality => (
                  <option className='text-black' key={nationality} value={nationality}>{nationality}</option>
                ))}
              </select>
            </div>

            {/* Special Needs Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white mb-1">ความต้องการพิเศษ</label>
              <select
                value={specialNeedsFilter}
                onChange={(e) => setSpecialNeedsFilter(e.target.value)}
                className="px-3 py-2 text-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className='text-black' value="all">ทั้งหมด</option>
                <option className='text-black' value="has">มีความต้องการพิเศษ</option>
                <option className='text-black' value="none">ไม่มีความต้องการพิเศษ</option>
              </select>
            </div>
          </div>
          {/* ส่วนควบคุมการเลือก */}
          <div className="flex justify-end items-center gap-4">
            <span className="text-sm text-white font-medium">
              เลือกแล้ว: {selectedExaminers.length} / {examiners.length} คน
              {filteredExaminers.length !== examiners.length && (
                <span className="text-yellow-400 ml-1">
                  (ในรายการที่กรอง: {selectedExaminers.filter(s => filteredExaminers.some(f => f.examinerid === s.examinerid)).length} / {filteredExaminers.length})
                </span>
              )}
            </span>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 shadow-md bg-linear-to-tl  from-green-400 to-emerald-800 text-white rounded-md transition-shadow text-[14px]"
              disabled={filteredExaminers.length === 0}
            >
              {selectedExaminers.filter(s => filteredExaminers.some(f => f.examinerid === s.examinerid)).length === filteredExaminers.length && filteredExaminers.length > 0
                ? 'ยกเลิกรายการที่กรอง' 
                : 'เลือกรายการที่กรอง'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExaminers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <p className="text-lg text-red-600">--ไม่พบข้อมูลที่ตรงกับเงื่อนไขการกรอง--</p>
              <button
                onClick={resetFilters}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                <RotateCcw/>
              </button>
            </div>
          ) : (
            filteredExaminers.map((examiner) => (
              <ExaminerCard
                key={examiner.examinerid || `${examiner.firstname}-${examiner.lastname}`}
                examiner={examiner}
                isSelected={selectedExaminers.some(e => e.examinerid === examiner.examinerid)}
                onSelect={(isSelected) => handleExaminerSelect(examiner, isSelected)}
              />
            ))
          )}
        </div>
        
        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={handleArrangeSelectedSeats}
            className="flex px-6 py-3 bg-linear-to-tr from-pink-500 to-purple-700 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={selectedExaminers.length === 0}
          >
            <div className="flex items-center text-[15px] gap-3">
              <Funnel />
              ดึงข้อมูลตามการกรอง ({selectedExaminers.length} คน)
            </div>
          </button>
          
          <button
            onClick={handleArrangeAllSeats}
            className="flex px-4 py-3 object-fill bg-green-500 text-white rounded-lg font-semibold hover:bg-green-800 transition-colors duration-400"
          >
            <div className="flex gap-3  items-center text-[15px]">
              <Sparkles/>
              ดึงข้อมูลทั้งหมด ({examiners.length} คน)
            </div>
            
          </button>

        </div>
      </div>
    </div>
  );
}