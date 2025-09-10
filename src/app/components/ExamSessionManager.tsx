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
  SavedPlan, ExamSeat, CurrentExamSessionState
} from '../../types/examTypes'; // ตรวจสอบ path
import RoomSelector from '../components/RoomSelector'; // ตรวจสอบ path
import SessionSummary from '../components/SessionSummary'; // ตรวจสอบ path
import {MultiRoomSeatMap} from '../components/MultiRoomSeatMap'; // ตรวจสอบ path
import { RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import { Combobox } from './Combobox';
import { DatePicker } from './DatePicker';
import { PerfectSlider } from './PerfectSlider';


export default function ExamSessionManager() {
  const router = useRouter();

  // --- States ---
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<CurrentExamSessionState | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [totalExaminees, setTotalExaminees] = useState(50);
  const [selectedRooms, setSelectedRooms] = useState<ExamRoom[]>([]);
  const [examinees, setExaminees] = useState<ExaminerType[]>([]);
  const [roomAllocations, setRoomAllocations] = useState<ExamRoomAllocation[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);
  // แก้ไข Type ของ allocationType State ให้รองรับ 'custom_layout'
  const [allocationType, setAllocationType] = useState<CurrentExamSessionState['seatingPattern']>('sequential');
  const [arrangementDirection, setArrangementDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [userId, setUserId] = useState<string>(''); // ในแอปจริงควรได้มาจากระบบ Auth
  const [examShift, setExamShift] = useState<'morning' | 'afternoon' | ''>('');
  const [examDate, setExamDate] = useState("")
  const [examSessions, setExamSessions] = useState<{ session_id: string; session_name: string; exam_date: string; exam_shift: string }[]>([]);
  const [shift, setShift] = useState("")

  const sessionOptions = [
    "สอบครุสภา ครั้งที่ 1",
    "สอบกลางภาค ครั้งที่ 1",
    "สอบปลายภาค ครั้งที่ 1",
    "สอบพิเศษ",
  ]

  const shiftOptions = ["เช้า 09:00-12:00", "บ่าย 13:00-16:00"]
 
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from('exam_session')
        .select('session_id, session_name, exam_date, exam_shift')
        .order('exam_date', { ascending: true });

      if (error) return console.error(error);
      if (data) setExamSessions(data);
    };

    fetchSessions();
  }, []);


const createExamSession = async () => {
  if (
    !sessionName?.trim() ||
    !examDate ||
    !examShift ||
    !selectedRooms || selectedRooms.length === 0 ||
    Number(totalExaminees) <= 0
  ) {
    toast.info('กรุณากรอกข้อมูลครบถ้วน');
    return;
  }

  // --- คำนวณความจุรวม ---
  const totalCapacity = selectedRooms.reduce(
    (sum, room) => sum + room.seatPattern.rows * room.seatPattern.cols,
    0
  );

  if (totalExaminees > totalCapacity) {
    toast.info(`จำนวนผู้เข้าสอบ (${totalExaminees}) เกินความจุของห้องสอบที่เลือก (${totalCapacity})`);
    return;
  }

  try {
    const newSessionId = crypto.randomUUID();
    const startTime = examShift === 'morning' ? '09:00:00' : '13:00:00';
    const endTime = examShift === 'morning' ? '12:00:00' : '16:00:00';

    // --- สร้าง Exam Session ---
    const { data: sessionData, error: sessionError } = await supabase
      .from('exam_session')
      .insert([{
        session_id: newSessionId,
        session_name: sessionName,
        exam_date: examDate,
        exam_shift: examShift,
        exam_start_time: startTime,
        exam_end_time: endTime,
        description: sessionDescription?.trim() || null,
      }])
      .select()
      .single();
    if (sessionError) throw new Error(sessionError.message);

    // --- ดึงผู้เข้าสอบ ---
    const { data: examineeDataRaw, error: examineeError } = await supabase
      .from('examiner')
      .select('*')
      .order('examinerid', { ascending: true });
    if (examineeError) throw new Error(examineeError.message);

    if (!examineeDataRaw || examineeDataRaw.length < totalExaminees) {
      toast.info(`พบผู้เข้าสอบในระบบเพียง ${examineeDataRaw?.length || 0} คน`);
      return;
    }

    // --- จัดเรียงผู้เข้าสอบตามการเลือก ---
    let arrangedExaminees = [...examineeDataRaw].slice(0, totalExaminees);

    // ฟังก์ชัน shuffle (Fisher-Yates)
    function shuffleArray(array: any[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    if (allocationType === 'sequential') {
      // ✅ เรียงตามลำดับตัวเลขจริง
      arrangedExaminees.sort((a, b) => Number(a.examinerid) - Number(b.examinerid));
    } else if (allocationType === 'random') {
      // ✅ สุ่มจริง ๆ
      arrangedExaminees = shuffleArray(arrangedExaminees);
    }

    // --- สร้าง Seating Plan ---
    const newPlanId = crypto.randomUUID();
    const maxRows = selectedRooms.reduce((max, room) => Math.max(max, room.seatPattern.rows), 0);
    const maxCols = selectedRooms.reduce((max, room) => Math.max(max, room.seatPattern.cols), 0);

    const { data: planData, error: planError } = await supabase
      .from('seating_plans')
      .insert([{
        seatpid: newPlanId,
        session_id: newSessionId,
        plan_name: sessionName,
        seating_pattern: allocationType,
        room_rows: maxRows,
        room_cols: maxCols,
        arrangement_data: [],
        exam_count: 0,
        exam_room_name: selectedRooms.map(r => r.name).join(', '),
        exam_room_description: sessionDescription,
        total_examinees: totalExaminees,
      }])
      .select()
      .single();
    if (planError) throw new Error(planError.message);

    // --- แจก Seat Assignment + Layout ---
    const seatAssignments: any[] = [];
    const arrangementData: any[] = [];
    let examineeIndex = 0;
    let seatNumber = 1; // ✅ นับเลขที่นั่งรวมต่อเนื่องข้ามห้อง

    for (const room of selectedRooms) {
      const roomSeats: (string | null)[][] = Array.from(
        { length: room.seatPattern.rows },
        () => Array.from({ length: room.seatPattern.cols }, () => null)
      );

      if (arrangementDirection === 'horizontal') {
        for (let r = 0; r < room.seatPattern.rows; r++) {
          for (let c = 0; c < room.seatPattern.cols; c++) {
            if (examineeIndex >= arrangedExaminees.length) break;
            const examinee = arrangedExaminees[examineeIndex];

            roomSeats[r][c] = examinee.examinerid;
            seatAssignments.push({
              session_id: newSessionId,
              seatplan_id: planData.seatpid,
              room_id: room.id,
              examiner_id: examinee.examinerid,
              seat_row: r + 1,
              seat_col: c + 1,
              seat_number: seatNumber,
            });

            examineeIndex++;
            seatNumber++;
          }
        }
      } else {
        for (let c = 0; c < room.seatPattern.cols; c++) {
          for (let r = 0; r < room.seatPattern.rows; r++) {
            if (examineeIndex >= arrangedExaminees.length) break;
            const examinee = arrangedExaminees[examineeIndex];

            roomSeats[r][c] = examinee.examinerid;
            seatAssignments.push({
              session_id: newSessionId,
              seatplan_id: planData.seatpid,
              room_id: room.id,
              examiner_id: examinee.examinerid,
              seat_row: r + 1,
              seat_col: c + 1,
              seat_number: seatNumber,
            });

            examineeIndex++;
            seatNumber++;
          }
        }
      }

      arrangementData.push({
        roomId: room.id,
        roomName: room.name,
        rows: room.seatPattern.rows,
        cols: room.seatPattern.cols,
        seats: roomSeats,
      });
    }

    // --- บันทึก Seat Assignment ---
    if (seatAssignments.length > 0) {
      const { error: seatError } = await supabase
        .from('seat_assignment')
        .insert(seatAssignments);
      if (seatError) throw new Error(seatError.message);
    }

    // --- อัปเดต Seating Plan ---
    const { data: updatedPlan, error: updatePlanError } = await supabase
      .from('seating_plans')
      .update({
        arrangement_data: arrangementData,
        exam_count: examineeIndex,
      })
      .eq('seatpid', planData.seatpid)
      .select()
      .single();
    if (updatePlanError) throw new Error(updatePlanError.message);

    // --- อัปเดต UI ---
    setExaminees(arrangedExaminees);
    setCurrentSession({
      id: newPlanId,
      sessionId: newSessionId,
      name: sessionName,
      description: sessionDescription || undefined,
      totalExaminees,
      rooms: roomAllocations,
      seatingPattern: allocationType,
      roomDimensions: { rows: maxRows, cols: maxCols },
      exam_count: examineeIndex,
      examRoomName: selectedRooms.map(r => r.name).join(', '),
      examRoomDescription: sessionDescription,
      createdAt: new Date(),
      updatedAt: new Date(),
      examDate,
      examShift,
      examStartTime: startTime,
      examEndTime: endTime,
    });

    setIsSessionActive(true);
    toast.success('สร้างรอบสอบและบันทึกที่นั่งสำเร็จ!');
  } catch (error: any) {
    console.error('Error creating session:', error);
    toast.error('เกิดข้อผิดพลาด: ' + error.message);
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

      // สร้างสำเนาผู้เข้าสอบ
      let examineesToAllocate = [...examinees];

      // สุ่มถ้า allocationType เป็น 'random'
      if (allocationType === 'random') {
        for (let i = examineesToAllocate.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [examineesToAllocate[i], examineesToAllocate[j]] = [examineesToAllocate[j], examineesToAllocate[i]];
        }
      }

      const allocations: ExamRoomAllocation[] = [];
      let currentExamineeIndex = 0;

      // จัดเรียงห้องตาม ID เพื่อให้ allocation สม่ำเสมอ
      const sortedSelectedRooms = [...selectedRooms].sort((a, b) => a.id.localeCompare(b.id));

      sortedSelectedRooms.forEach(room => {
        const roomExaminees: ExaminerType[] = [];
        const availableSeatsInRoom = room.totalSeats;
        const examineesForThisRoom = Math.min(availableSeatsInRoom, examineesToAllocate.length - currentExamineeIndex);

        for (let i = 0; i < examineesForThisRoom; i++) {
          roomExaminees.push(examineesToAllocate[currentExamineeIndex + i]);
        }
        currentExamineeIndex += examineesForThisRoom;

        // แปลง seatArrangement เป็น ExamSeat[] และแก้ undefined → null
        const seatArrangement: ExamSeat[] = generateSeatArrangement(room, roomExaminees, arrangementDirection).map(
          (seat, index) => ({
            ...seat,
            seat_number: index + 1,
            examiner: seat.examiner ?? null  // แปลง undefined → null
          })
        );

        allocations.push({
          room,
          allocatedSeats: roomExaminees.length,
          examinees: roomExaminees,
          seatArrangement
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

    const saveExamSession = async () => {
    if (!currentSession || !currentSession.id || roomAllocations.length === 0 || !userId) {
      toast.info('ไม่มีรอบสอบที่ใช้งานอยู่ หรือยังไม่ได้จัดที่นั่ง');
      return;
    }

    const sessionToUpdate: SavedPlan = {
      seatpid: currentSession.id,
      session_id: currentSession.sessionId,
      plan_name: currentSession.name,
      seating_pattern: currentSession.seatingPattern === 'custom_layout' ? 'custom_layout' : currentSession.seatingPattern,
      room_rows: currentSession.roomDimensions?.rows || 0,
      room_cols: currentSession.roomDimensions?.cols || 0,
      arrangement_data: roomAllocations,
      created_at: currentSession.createdAt.toISOString(),
      updated_at: new Date().toISOString(),
      exam_count: examinees.length,
      exam_room_name: currentSession.examRoomName || selectedRooms.map(room => room.name).join(', '),
      exam_room_description: currentSession.description || sessionDescription,
      total_examinees: currentSession.totalExaminees,
      user_id: null
    };

    try {
      const response = await fetch(`/api/seating-plans/${currentSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionToUpdate),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'ไม่สามารถบันทึกได้');
      }

      // แสดง toast ตาม message จาก API
      toast.success(result.message || 'บันทึกรอบสอบสำเร็จ!');

      console.log('Save result:', result.data);
      fetchSavedPlans();
      router.push(`/exam-dashboard`);
    } catch (error: any) {
      console.error('Error saving session:', error);
      toast.error('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
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
              <div className="space-y-6 p-4">
                {/* ชื่อรอบสอบ, จำนวนผู้เข้าสอบ, รอบสอบ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Combobox
                    label="ชื่อรอบสอบ *"
                    placeholder="เลือกหรือกรอกชื่อรอบสอบ"
                    options={sessionOptions}
                    value={sessionName}
                    onChange={setSessionName}
                  />

                    <PerfectSlider
                      label="จำนวนผู้เข้าสอบทั้งหมด"
                      min={0}
                      max={300}
                      step={1}
                      value={totalExaminees}
                      onChange={(val) => setTotalExaminees(val)}
                    />
                  <Combobox
                    label="รอบสอบ *"
                    placeholder="เลือกหรือกรอกเวลา"
                    options={shiftOptions}
                    value={examShift}
                    onChange={(val) => {
                      // map string label → value
                      if (val.includes("เช้า")) setExamShift("morning");
                      else if (val.includes("บ่าย")) setExamShift("afternoon");
                      else setExamShift("");
                    }}
                  />


                  <DatePicker
                    label="เลือกวันที่สอบ"
                    value={examDate}
                    onChange={setExamDate}
                  />
                </div>

                {/* คำอธิบาย */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">คำอธิบาย</label>
                  <textarea
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับรอบสอบ"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-transparent outline-none focus:border-blue-500 text-white focus:ring-2 focus:ring-blue-500 h-20"
                  />
                </div>

                {/* รูปแบบการจัดที่นั่ง + ทิศทางการจัดเรียง */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-around">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      รูปแบบการจัดที่นั่ง
                    </label>
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
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
                    <div className="flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio text-green-600"
                          name="arrangementDirection"
                          value="horizontal"
                          checked={arrangementDirection === 'horizontal'}
                          onChange={() => setArrangementDirection('horizontal')}
                        />
                        <span className="ml-2 text-white">แนวนอน</span>
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
                        <span className="ml-2 text-white">แนวตั้ง</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* ความจุและห้อง */}
                <div className="flex flex-col md:flex-row justify-around text-yellow-400 text-sm gap-2">
                  <p><strong>ที่นั่งทั้งหมด :</strong> {totalCapacity} ที่นั่ง</p>
                  <p><strong>จำนวนห้อง :</strong> {selectedRooms.length} ห้อง</p>
                  {totalCapacity < totalExaminees && (
                    <p className="text-red-600">
                      ⚠️ ที่นั่งไม่เพียงพอ ต้องการเพิ่ม : {totalExaminees - totalCapacity} ที่นั่ง
                    </p>
                  )}
                </div>

                {/* ปุ่มสร้างรอบสอบ */}
                <div className="flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4 mt-4">
                  <button
                    onClick={createExamSession}
                    disabled={!sessionName || selectedRooms.length === 0 || totalExaminees === 0}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transition-shadow"
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
