/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/ExamSessionManager/page.tsx
'use client'

import { supabase } from '../../lib/supabaseClient';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ExamRoom, ExamRoomAllocation, ExaminerType, SeatPosition,
  SavedPlan, InsertPlanData, CurrentExamSessionState
} from '../../types/examTypes'; // ตรวจสอบ path
import RoomSelector from '../components/RoomSelector'; // ตรวจสอบ path
import SessionSummary from '../components/SessionSummary'; // ตรวจสอบ path
import MultiRoomSeatMap from '../components/MultiRoomSeatMap'; // ตรวจสอบ path
import { RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';


export default function ExamSessionManager() {
  const router = useRouter();

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<CurrentExamSessionState | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [totalExaminees, setTotalExaminees] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState<ExamRoom[]>([]);
  const [examinees, setExaminees] = useState<ExaminerType[]>([]);
  const [roomAllocations, setRoomAllocations] = useState<ExamRoomAllocation[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  // แก้ไข Type ของ allocationType State ให้รองรับ 'custom_layout'
  const [allocationType, setAllocationType] = useState<CurrentExamSessionState['seatingPattern']>('sequential');
  const [arrangementDirection, setArrangementDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [userId, setUserId] = useState<string>(''); // ในแอปจริงควรได้มาจากระบบ Auth

  const checkTotalExaminer = async (number:number) =>{
    
    if(number <= 0 ){
      setTotalExaminees(0)
      
    }else{
      setTotalExaminees(number)
    }
  }
    const createExamSession = async () => {
  if (!sessionName || selectedRooms.length === 0 || totalExaminees === 0 || !userId) {
    alert('กรุณากรอกชื่อรอบสอบ, จำนวนผู้เข้าสอบ และเลือกห้องสอบ');
    return;
  }

  if (totalExaminees > totalCapacity) {
    alert(`จำนวนผู้เข้าสอบ (${totalExaminees}) เกินความจุของห้องสอบที่เลือก (${totalCapacity})`);
    return;
  }

  const newSessionId = crypto.randomUUID();
  const maxRows = selectedRooms.reduce((max, room) => Math.max(max, room.seatPattern.rows), 0);
  const maxCols = selectedRooms.reduce((max, room) => Math.max(max, room.seatPattern.cols), 0);

  const initialArrangementData: ExamRoomAllocation[] = [];

  const dataToInsert: InsertPlanData = {
    plan_name: sessionName,
    seating_pattern: allocationType,
    room_rows: maxRows,
    room_cols: maxCols,
    arrangement_data: initialArrangementData,
    user_id: userId,
    exam_count: 0,
    exam_room_name: selectedRooms.map(room => room.name).join(', '),
    exam_room_description: sessionDescription,
    total_examinees: totalExaminees,
  };

  try {
    // ✅ 1. ดึงข้อมูลผู้เข้าสอบจาก Supabase
    const { data: examineeData, error } = await supabase
      .from('examiner') // ← ชื่อ table จริงของคุณ
      .select('*')
      .order('examinerid', { ascending: true })
      .limit(totalExaminees);

    if (error) throw new Error(`ไม่สามารถดึงข้อมูลผู้เข้าสอบ: ${error.message}`);

    if (!examineeData || examineeData.length < totalExaminees) {
      alert(`พบผู้เข้าสอบในระบบเพียง ${examineeData?.length || 0} คนจาก ${totalExaminees}`);
      return;
    }

    // ✅ 2. บันทึก Plan ลง backend
    const response = await fetch(`/api/seating-plans/${newSessionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToInsert),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody.substring(0, 200)}...`);
    }

    const result = await response.json();
    const savedData = result.data as SavedPlan;

    // ✅ 3. เซฟ examinees ที่ดึงจาก DB เข้า state
    setExaminees(examineeData);

    // ✅ 4. สร้าง session ตามปกติ
    setCurrentSession({
      id: savedData.seatpid,
      name: savedData.plan_name,
      description: savedData.exam_room_description || undefined,
      totalExaminees: savedData.total_examinees,
      rooms: [],
      createdAt: new Date(savedData.created_at),
      updatedAt: new Date(savedData.updated_at || savedData.created_at),
      seatingPattern: savedData.seating_pattern as CurrentExamSessionState['seatingPattern'],
      roomDimensions: { rows: savedData.room_rows, cols: savedData.room_cols },
      exam_count: savedData.exam_count,
      examRoomName: savedData.exam_room_name || undefined,
      examRoomDescription: savedData.exam_room_description || undefined,
    });

    setIsSessionActive(true);
    toast.success('สร้างรอบสอบสำเร็จ!');
    fetchSavedPlans();
  } catch (error: any) {
    console.error('Error creating session:', error);
    toast.error('เกิดข้อผิดพลาดในการสร้างรอบสอบ: ' + error.message);
  }
};


  // --- MOCK User ID for demonstration (Replace with actual Auth) ---
  useEffect(() => {
    let storedUserId = localStorage.getItem('user_id');
    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem('user_id', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

      async function fetchExamineesFromSupabase(limit: number): Promise<ExaminerType[]> {
      const { data, error } = await supabase
        .from('examiner')
        .select('*')
        .order('examinerid', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('เกิดข้อผิดพลาดในการดึงข้อมูล:', error);
        throw new Error('ดึงข้อมูลไม่สำเร็จ');
      }

      return data as ExaminerType[];
    }
  // --- Computed Values ---
  const totalCapacity = useMemo(() => {
    return selectedRooms.reduce((sum, room) => sum + room.totalSeats, 0);
  }, [selectedRooms]);

  // --- Helper Functions ---
  const generateDummyExaminees = useCallback((count: number): ExaminerType[] => {
    const dummyData: ExaminerType[] = [];
    for (let i = 1; i <= count; i++) {
      dummyData.push({
        examinerid: 1000 + i,
        idcardnumber: `123456789012${i.toString().padStart(2, '0')}`,
        title: i % 2 === 0 ? 'นาย' : 'นางสาว',
        firstname: `ผู้เข้าสอบ${i}`,
        lastname: `นามสกุล${i}`,
        gender: i % 2 === 0 ? 'ชาย' : 'หญิง',
        phone: `081-123-45${i.toString().padStart(2, '0')}`,
        email: `examinee${i}@example.com`,
        specialneeds: i % 5 === 0 ? 'ต้องการความช่วยเหลือพิเศษ' : null,
        nationality: 'ไทย',
        titleeng: i % 2 === 0 ? 'Mr.' : 'Mrs.',
        firstnameeng: `FirstName${i}`,
        lastnameeng: `LastName${i}`
      });
    }
    return dummyData;
  }, []);

  const generateSeatArrangement = useCallback((room: ExamRoom, examineesForRoom: ExaminerType[], direction: 'horizontal' | 'vertical'): SeatPosition[] => {
    const arrangement: SeatPosition[] = [];
    let examineeIndex = 0;

    // แก้ไข: ตรวจสอบทั้ง 'custom' และ 'custom_layout'
    if ((room.seatPattern.type === 'custom' || room.seatPattern.type === 'custom_layout') && room.seatPattern.customLayout) {
      room.seatPattern.customLayout.forEach(seat => {
        arrangement.push({
          ...seat,
          occupied: examineeIndex < examineesForRoom.length,
          examiner: examineeIndex < examineesForRoom.length ? examineesForRoom[examineeIndex] : undefined
        });
        if (examineeIndex < examineesForRoom.length) {
          examineeIndex++;
        }
      });
      arrangement.sort((a, b) => a.seatNumber - b.seatNumber);
    } else {
      const { rows, cols } = room.seatPattern;
      if (direction === 'horizontal') {
        for (let row = 1; row <= rows; row++) {
          for (let col = 1; col <= cols; col++) {
            const seatNumber = ((row - 1) * cols) + col;
            arrangement.push({
              gridRow: row,
              gridCol: col,
              seatNumber,
              occupied: examineeIndex < examineesForRoom.length,
              examiner: examineeIndex < examineesForRoom.length ? examineesForRoom[examineeIndex] : undefined
            });
            if (examineeIndex < examineesForRoom.length) {
              examineeIndex++;
            }
          }
        }
      } else { // vertical
        for (let col = 1; col <= cols; col++) {
          for (let row = 1; row <= rows; row++) {
            const seatNumber = ((col - 1) * rows) + row;
            arrangement.push({
              gridRow: row,
              gridCol: col,
              seatNumber,
              occupied: examineeIndex < examineesForRoom.length,
              examiner: examineeIndex < examineesForRoom.length ? examineesForRoom[examineeIndex] : undefined
            });
            if (examineeIndex < examineesForRoom.length) {
              examineeIndex++;
            }
          }
        }
      }
    }
    return arrangement;
  }, []);

  const allocateExamineesToRooms = useCallback(() => {
    if (examinees.length === 0 || selectedRooms.length === 0) {
      setRoomAllocations([]);
      return;
    }

    let examineesToAllocate = [...examinees];
    if (allocationType === 'random') {
      for (let i = examineesToAllocate.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [examineesToAllocate[i], examineesToAllocate[j]] = [examineesToAllocate[j], examineesToAllocate[i]];
      }
    }

    const allocations: ExamRoomAllocation[] = [];
    let currentExamineeIndex = 0;

    // --- MODIFICATION STARTS HERE ---
    // Sort selected rooms by their ID (ascending) for consistent allocation order
    const sortedSelectedRooms = [...selectedRooms].sort((a, b) => a.id.localeCompare(b.id));
    // --- MODIFICATION ENDS HERE ---

    sortedSelectedRooms.forEach(room => {
      const roomExaminees: ExaminerType[] = [];
      const availableSeatsInRoom = room.totalSeats;
      const examineesForThisRoom = Math.min(availableSeatsInRoom, examineesToAllocate.length - currentExamineeIndex);

      for (let i = 0; i < examineesForThisRoom; i++) {
        roomExaminees.push(examineesToAllocate[currentExamineeIndex + i]);
      }
      currentExamineeIndex += examineesForThisRoom;

      allocations.push({
        room,
        allocatedSeats: roomExaminees.length,
        examinees: roomExaminees,
        seatArrangement: generateSeatArrangement(room, roomExaminees, arrangementDirection)
      });
    });

    setRoomAllocations(allocations);
  }, [examinees, selectedRooms, allocationType, arrangementDirection, generateSeatArrangement]);

  // --- API Interaction Functions ---

  const fetchSavedPlans = useCallback(async () => {
    if (!userId) {
      console.warn('User ID is not available, skipping fetching saved plans.');
      return;
    }

    try {
      // แก้ไข URL: เปลี่ยนจาก /api/saved-plans เป็น /api/seating-plans และส่ง userId
      const response = await fetch(`/api/seating-plans?userId=${userId}`);
      if (!response.ok) {
        // อ่าน response เป็น text เพื่อดู Error message จาก Server
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody.substring(0, 200)}...`);
      }
      const data: SavedPlan[] = await response.json();
      setSavedPlans(data);
    } catch (error) {
      console.error('Error fetching saved plans:', error);
      toast.error('เกิดข้อผิดพลาดในการดึงรายการแผนที่นั่ง: ' + (error as Error).message);
      setSavedPlans([]);
    }
  }, [userId]);

  const createExamSessionDummy = async () => {
    if (!sessionName || selectedRooms.length === 0 || totalExaminees === 0 || !userId) {
      toast.info('กรุณากรอกชื่อรอบสอบ, จำนวนผู้เข้าสอบ และเลือกห้องสอบ');
      return;
    }

    if (totalExaminees > totalCapacity) {
      toast.info(`จำนวนผู้เข้าสอบ (${totalExaminees}) เกินความจุของห้องสอบที่เลือก (${totalCapacity})`);
      return;
    }

    const newSessionId = crypto.randomUUID();
    const maxRows = selectedRooms.reduce((max, room) => Math.max(max, room.seatPattern.rows), 0);
    const maxCols = selectedRooms.reduce((max, room) => Math.max(max, room.seatPattern.cols), 0);

    const initialArrangementData: ExamRoomAllocation[] = [];

    const dataToInsert: InsertPlanData = {
      plan_name: sessionName,
      seating_pattern: allocationType, // ตรงนี้จะใช้ค่าที่เลือกจาก Radio button (sequential, random, custom_layout)
      room_rows: maxRows,
      room_cols: maxCols,
      arrangement_data: initialArrangementData,
      user_id: userId,
      exam_count: 0,
      exam_room_name: selectedRooms.map(room => room.name).join(', '),
      exam_room_description: sessionDescription,
      total_examinees: totalExaminees,
    };

    try {
      const response = await fetch(`/api/seating-plans/${newSessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToInsert),
      });

      // แก้ไข: ตรวจสอบ response.ok ก่อนเรียก response.json()
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody.substring(0, 200)}...`);
      }

      const result = await response.json();

      const savedData = result.data as SavedPlan;
      const generatedExaminees = generateDummyExaminees(totalExaminees);
      setExaminees(generatedExaminees);

      setCurrentSession({
        id: savedData.seatpid,
        name: savedData.plan_name,
        description: savedData.exam_room_description || undefined,
        totalExaminees: savedData.total_examinees,
        rooms: [],
        createdAt: new Date(savedData.created_at),
        updatedAt: new Date(savedData.updated_at || savedData.created_at), // จัดการ updated_at ที่อาจเป็น null
        seatingPattern: savedData.seating_pattern as CurrentExamSessionState['seatingPattern'], // Cast เพื่อให้ตรง Type
        roomDimensions: { rows: savedData.room_rows, cols: savedData.room_cols },
        exam_count: savedData.exam_count,
        examRoomName: savedData.exam_room_name || undefined,
        examRoomDescription: savedData.exam_room_description || undefined,
      });
      setIsSessionActive(true);
      toast.success('สร้างรอบสอบสำเร็จ!');
      fetchSavedPlans();
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error('เกิดข้อผิดพลาดในการสร้างรอบสอบ: ' + (error as Error).message);
    }
  };

  const saveExamSession = async () => {
    if (!currentSession || !currentSession.id || roomAllocations.length === 0 || !userId) {
      alert('ไม่มีรอบสอบที่ใช้งานอยู่ หรือไม่มี ID รอบสอบที่จะบันทึก, หรือยังไม่ได้จัดที่นั่ง');
      return;
    }

    const sessionToUpdate: SavedPlan = {
      seatpid: currentSession.id,
      plan_name: currentSession.name,
      seating_pattern: currentSession.seatingPattern === 'custom_layout' ? 'custom_layout' : currentSession.seatingPattern,
      room_rows: currentSession.roomDimensions?.rows || 0,
      room_cols: currentSession.roomDimensions?.cols || 0,
      arrangement_data: roomAllocations,
      created_at: currentSession.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
      user_id: userId,
      exam_count: examinees.length,
      exam_room_name: currentSession.examRoomName || selectedRooms.map(room => room.name).join(', '),
      exam_room_description: currentSession.description || sessionDescription,
      total_examinees: currentSession.totalExaminees,
    };

    try {
      // แก้ไข URL: เปลี่ยนจาก /api/saved-plans เป็น /api/seating-plans
      const response = await fetch(`/api/seating-plans/${currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionToUpdate),
      });

      // แก้ไข: ตรวจสอบ response.ok ก่อนเรียก response.json()
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody.substring(0, 200)}...`);
      }

      const result = await response.json();

      console.log('บันทึกรอบสอบสำเร็จ!', result.data);
      toast.success('บันทึกรอบสอบสำเร็จ!');
      fetchSavedPlans();
      router.push(`/exam-dashboard`);
    } catch (error: any) {
      console.error('Error saving session:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + (error as Error).message);
    }
  };

  const loadExamSession = async (planId: string) => {
    if (!planId) return;

    try {
      const response = await fetch(`/api/seating-plans/${planId}`);
      // แก้ไข: ตรวจสอบ response.ok ก่อนเรียก response.json()
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody.substring(0, 200)}...`);
      }

      const result = await response.json();

      const loadedPlan: SavedPlan = result;

      const uniqueRooms: ExamRoom[] = [];
      loadedPlan.arrangement_data.forEach(alloc => {
        if (!uniqueRooms.some(r => r.id === alloc.room.id)) {
          uniqueRooms.push(alloc.room);
        }
      });

      const allExaminees: ExaminerType[] = [];
      loadedPlan.arrangement_data.forEach(alloc => {
        alloc.seatArrangement.forEach(seat => {
          if (seat.examiner) {
            allExaminees.push(seat.examiner);
          }
        });
      });

      setSessionName(loadedPlan.plan_name);
      setSessionDescription(loadedPlan.exam_room_description || '');
      setTotalExaminees(loadedPlan.total_examinees);
      setSelectedRooms(uniqueRooms);
      setExaminees(allExaminees);
      setRoomAllocations(loadedPlan.arrangement_data);

      // Logic เพื่อตั้งค่า allocationType ให้ตรงกับที่ UI คาดหวัง
      const dbSeatingPattern = loadedPlan.seating_pattern;
      if (dbSeatingPattern === 'sequential' || dbSeatingPattern === 'random') {
        setAllocationType(dbSeatingPattern);
      } else {
        setAllocationType('custom_layout'); // ถือว่าเป็นรูปแบบที่กำหนดเอง (เช่น single_row, zigzag)
      }

      setArrangementDirection('horizontal'); // หรือต้องบันทึก direction ด้วยถ้าสำคัญ

      setCurrentSession({
        id: loadedPlan.seatpid,
        name: loadedPlan.plan_name,
        description: loadedPlan.exam_room_description || undefined,
        totalExaminees: loadedPlan.total_examinees,
        rooms: loadedPlan.arrangement_data,
        createdAt: new Date(loadedPlan.created_at),
        updatedAt: new Date(loadedPlan.updated_at || loadedPlan.created_at), // แก้ไข: จัดการ updated_at ที่อาจเป็น null
        seatingPattern: loadedPlan.seating_pattern as CurrentExamSessionState['seatingPattern'], // แก้ไข: Cast Type
        roomDimensions: { rows: loadedPlan.room_rows, cols: loadedPlan.room_cols },
        exam_count: loadedPlan.exam_count,
        examRoomName: loadedPlan.exam_room_name || undefined,
        examRoomDescription: loadedPlan.exam_room_description || undefined,
      });

      setIsSessionActive(true);
      toast.success('โหลดรอบสอบสำเร็จ!');
    } catch (error: any) {
      console.error('Error loading session:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดรอบสอบ: ' + (error as Error).message);
    }
  };

  const deleteExamSession = async (planId: string) => {
    if (!planId) return;

    try {
      const response = await fetch(`/api/seating-plans/${planId}`, {
        method: 'DELETE',
      });

      // แก้ไข: ตรวจสอบ response.ok ก่อนเรียก response.json()
      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, Body: ${errorBody.substring(0, 200)}...`);
      }

      const result = await response.json();

      toast.success('ลบแผนที่นั่งสำเร็จ!');
      fetchSavedPlans();
      if (currentSession && currentSession.id === planId) {
        resetSession();
      }
    } catch (error: any) {
      console.error('Error deleting plan:', error);
      toast.error('เกิดข้อผิดพลาดในการลบแผน: ' + (error as Error).message);
    }
  };

  // --- Session Management ---
  const resetSession = useCallback(() => {
    setCurrentSession(null);
    setIsSessionActive(false);
    setSessionName('');
    setSessionDescription('');
    setTotalExaminees(0);
    setSelectedRooms([]);
    setExaminees([]);
    setRoomAllocations([]);
    setAllocationType('sequential');
    setArrangementDirection('horizontal');
  }, []);

  // --- Effects ---
  useEffect(() => {
    if (userId) {
      fetchSavedPlans();
    }
  }, [userId, fetchSavedPlans]);

  useEffect(() => {
    if (isSessionActive && examinees.length > 0 && selectedRooms.length > 0) {
      allocateExamineesToRooms();
    } else if (isSessionActive && (examinees.length === 0 || selectedRooms.length === 0)) {
      setRoomAllocations([]);
    }
  }, [examinees, selectedRooms, allocationType, arrangementDirection, isSessionActive, allocateExamineesToRooms]);

  useEffect(() => {
    if (currentSession) {
      // ตรวจสอบความแตกต่างเฉพาะถ้า currentSession.rooms ถูกตั้งค่าแล้ว
      if (currentSession.rooms && JSON.stringify(currentSession.rooms) !== JSON.stringify(roomAllocations)) {
        setCurrentSession(prev => prev ? { ...prev, rooms: roomAllocations, exam_count: examinees.length } : null);
      }
    }
  }, [roomAllocations, currentSession, examinees.length]);

  return (
    <div className="container mx-auto bg-gray-200 min-h-screen font-inter ">
      <div className="bg-gradient-to-tr from-blue-500 to-indigo-800 text-white p-4 rounded-lg shadow-lg mb-6">
        <h1 className="text-2xl font-bold text-center mb-2">ระบบจัดที่นั่งสอบ</h1>
      </div>

      {!isSessionActive ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-b from-indigo-700 to-sky-600 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">ข้อมูลรอบสอบ</h2>
                <button
                  onClick={() => {
                    setSessionName('');
                    setTotalExaminees(0);
                    setSessionDescription('');
                    setAllocationType('sequential'); // Reset to default allocation type
                    setArrangementDirection('horizontal'); // Reset to default arrangement direction
                  }}
                  className="px-2 py-2 bg-transparent text-orange-400 rounded-3xl hover:bg-gray-800  font-medium hover:shadow-md transition-shadow"
                >
                  <RotateCcw/>
                </button>
              </div>
              <div className="space-y-4">
                <div className='flex justify-around'>
                  <div>
                    <label htmlFor="sessionName" className="block text-sm font-medium text-white mb-2">
                      ชื่อรอบสอบ *
                    </label>
                    <input
                      type="text"
                      id="sessionName"
                      value={sessionName}
                      onChange={(e) => setSessionName(e.target.value)}
                      className="w-full p-3 border border-gray-200 text-white bg-transparent rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น สอบครุสภา ครั้งที่ 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="totalExaminees" className="block text-sm font-medium text-white mb-2">
                      จำนวนผู้เข้าสอบทั้งหมด
                    </label>
                    <input
                      type="number"
                      id="totalExaminees"
                      value={totalExaminees === 0 ? '' : totalExaminees}
                      onChange={(e) => { 
                        const value = e.target.value;
                        checkTotalExaminer(value ? Number(value) : 0);
                      }}
                      className="w-full p-3 border bg-transparent text-white border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น 20, 50"
                    />
                  </div>
                </div>
                <div className='items-center mx-4'>
                  <label htmlFor="sessionDescription" className="block text-sm font-medium text-white mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    id="sessionDescription"
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 text-white rounded-lg focus:ring-1 focus:ring-blue-500 h-20 focus:border-yellow-500"
                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับรอบสอบ"
                  />
                </div>
                <div className="flex justify-around">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      รูปแบบการจัดที่นั่ง
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-blue-600"
                          name="allocationType"
                          value="sequential"
                          checked={allocationType === 'sequential'}
                          onChange={() => setAllocationType('sequential')}
                        />
                        <span className="ml-2 text-white">ตามลำดับ</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-green-600"
                          name="allocationType"
                          value="random"
                          checked={allocationType === 'random'}
                          onChange={() => setAllocationType('random')}
                        />
                        <span className="ml-2 text-white">สุ่ม</span>
                      </label>
                      {/* เพิ่ม radio สำหรับ custom_layout ถ้าต้องการให้ผู้ใช้เลือกเอง */}
                      {allocationType === 'custom_layout' && (
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            className="form-radio text-purple-600"
                            name="allocationType"
                            value="custom_layout"
                            checked={allocationType === 'custom_layout'}
                            onChange={() => setAllocationType('custom_layout')}
                            disabled
                          />
                          <span className="ml-2 text-white">กำหนดเอง (จากแผนที่บันทึก)</span>
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      ทิศทางการจัดเรียง
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-green-600"
                          name="arrangementDirection"
                          value="horizontal"
                          checked={arrangementDirection === 'horizontal'}
                          onChange={() => setArrangementDirection('horizontal')}
                        />
                        <span className="ml-2 text-white">แนวนอน (แถว)</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-blue-600"
                          name="arrangementDirection"
                          value="vertical"
                          checked={arrangementDirection === 'vertical'}
                          onChange={() => setArrangementDirection('vertical')}
                        />
                        <span className="ml-2 text-white">แนวตั้ง (คอลัมน์)</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-around p-2">
                  <p className="text-sm text-yellow-500">
                    <strong>ความจุรวม:</strong> {totalCapacity} ที่นั่ง
                  </p>
                  <p className="text-sm text-yellow-500">
                    <strong>ที่นั่งที่เลือก:</strong> {selectedRooms.length} ห้อง
                  </p>
                  {totalCapacity < totalExaminees && (
                    <p className="text-sm text-red-700 ml-2">
                      ⚠️ ความจุไม่เพียงพอ ต้องการเพิ่มอีก {totalExaminees - totalCapacity} ที่นั่ง
                    </p>
                  )}
                </div>
                <div className="flex justify-center mt-2 items-center">
                  <button
                    onClick={createExamSessionDummy}
                    disabled={!sessionName || selectedRooms.length === 0 || totalExaminees === 0}
                    className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    จำลองสร้างที่นั่งสอบ
                  </button>
                  <button
                    onClick={createExamSession}
                    disabled={!sessionName || selectedRooms.length === 0 || totalExaminees === 0}
                    className="px-6 py-3 ml-6 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-shadow"
                  >
                    {loading ? 'กำลังโหลด...' : 'จัดที่นั่งสอบ'}
                  </button>
                </div>
              </div>
            </div>
            <RoomSelector
              //availableRooms={PREDEFINED_ROOMS}
              selectedRooms={selectedRooms}
              onRoomSelectionChange={setSelectedRooms}
            />
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {currentSession && <SessionSummary session={currentSession} />}
          <MultiRoomSeatMap allocations={roomAllocations} />
        </div>
      )}
      {isSessionActive && (
        <div className="flex justify-center space-x-4 mt-6 transition-opacity">
          <button
            onClick={saveExamSession}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            บันทึกรอบสอบ
          </button>
          <button
            onClick={resetSession}
            className="px-6 py-3 bg-rose-400 text-white rounded-lg hover:bg-rose-500 font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            สร้างรอบใหม่
          </button>
        </div>
      )}
    </div>
  );
}

function arrangeSeats(arg0: { examinees: any[]; rooms: ExamRoom[]; pattern: "sequential" | "random" | "custom_layout"; }): ExamRoomAllocation[] {
  throw new Error('Function not implemented.');
}
