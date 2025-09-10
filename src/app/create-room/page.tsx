/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import type { ExamRoom, Seat } from '../../types/examRoom';
import { toast } from 'react-toastify';
import { PREDEFINED_ROOMS } from '../../data/predefinedRooms';
import Loading from '../components/Loading';
import { useRouter } from 'next/navigation';

export default function CreateRoomPage() {
  const router = useRouter();

  const [room_name, setRoomName] = useState('');
  const [room_number, setRoomNumber] = useState('');
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
  const [description, setDescription] = useState('');
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatNumberMap, setSeatNumberMap] = useState<Record<string, number>>({});
  const [nextSeatNumber, setNextSeatNumber] = useState(1);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Drag-select state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectMode, setSelectMode] = useState<'add' | 'remove'>('add');

  // Hover highlight
  const [hoverRow, setHoverRow] = useState<number | null>(null);
  const [hoverCol, setHoverCol] = useState<number | null>(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const toggleSeat = (r: number, c: number) => {
    const index = seats.findIndex((s) => s.gridRow === r && s.gridCol === c);
    if (index >= 0) {
      const newSeats = seats.filter((_, i) => i !== index);
      setSeats(newSeats.map((seat, idx) => ({ ...seat, seatNumber: idx + 1 })));
    } else {
      const newSeats = [...seats, { gridRow: r, gridCol: c, occupied: false }];
      setSeats(newSeats.map((seat, idx) => ({ ...seat, seatNumber: idx + 1 })));
    }
  };

  const getSeatNumber = (r: number, c: number) => {
    const seat = seats.find((s) => s.gridRow === r && s.gridCol === c);
    return seat ? seat.seatNumber : null;
  };

  // Drag-select handlers
  const handleMouseDown = (r: number, c: number) => {
    const active = getSeatNumber(r, c) !== null;
    setSelectMode(active ? 'remove' : 'add');
    setIsSelecting(true);
    toggleSeat(r, c);
    setHoverRow(r);
    setHoverCol(c);
  };

  const handleMouseEnter = (r: number, c: number) => {
    if (!isSelecting) return;
    const active = getSeatNumber(r, c) !== null;
    if ((selectMode === 'add' && !active) || (selectMode === 'remove' && active)) {
      toggleSeat(r, c);
    }
    setHoverRow(r);
    setHoverCol(c);
  };

  const handleMouseUp = () => setIsSelecting(false);

  const handleSave = async () => {
    setErrorMessage('');
    if (!room_name.trim()) { setErrorMessage('กรุณากรอกชื่อห้องสอบ'); return; }
    if (!room_number.trim()) { setErrorMessage('กรุณากรอกรหัสห้องสอบ'); return; }
    if (seats.length === 0) { setErrorMessage('กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง'); return; }

    const roomData: ExamRoom = {
      room_id: room_number,
      room_name,
      room_number,
      totalSeats: seats.length,
      seatPattern: { type: 'custom', rows, cols, customLayout: seats },
      description,
    };

    setLoading(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      if (res.ok) {
        toast.success('บันทึกสำเร็จ');
        setSeats([]); setRoomName(''); setRoomNumber(''); setDescription('');
        setNextSeatNumber(1); setSeatNumberMap({});
        setTimeout(() => router.push('/rooms'), 1500);
      } else {
        const data = await res.json();
        if (res.status === 409) setErrorMessage('รหัสห้องนี้ถูกใช้ไปแล้ว กรุณาใช้รหัสอื่น');
        else setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch {
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึก');
    } finally { setLoading(false); }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-gradient-to-tr from-indigo-600  via-blue-500 to-sky-500 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-white mb-4">สร้างห้องสอบ</h1>

      {/* ฟอร์ม */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">ชื่อห้องสอบ</label>
          <input type="text" placeholder="ชื่อห้อง" value={room_name} onChange={(e)=>setRoomName(e.target.value)}
            className="border-2 border-gray-200 text-white p-3 rounded-[7px] w-full focus:ring-2 focus:ring-white outline-none"
            disabled={loading} />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">รหัสห้อง</label>
          <input type="text" placeholder="รหัสห้อง" value={room_number} onChange={(e)=>setRoomNumber(e.target.value)}
            className="border-2 border-gray-200 text-white p-3 rounded-[7px] w-full focus:ring-2 focus:ring-white outline-none"
            disabled={loading} />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">จำนวนแถว</label>
          <input type="number" value={rows} onChange={(e)=>setRows(Math.max(1,Number(e.target.value)))}
            className="border-2 border-gray-200 text-white p-3 rounded-[7px] w-full focus:ring-2 focus:ring-white outline-none"
            disabled={loading} min={1} />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">จำนวนคอลัมน์</label>
          <input type="number" value={cols} onChange={(e)=>setCols(Math.max(1,Number(e.target.value)))}
            className="border-2 border-gray-200 text-white p-3 rounded-[7px] w-full focus:ring-2 focus:ring-white outline-none"
            disabled={loading} min={1} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      {/* คำอธิบาย */}
      <div className="flex flex-col h-full">
        <label className="block text-sm font-medium text-white mb-1">คำอธิบาย</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-2 border-gray-200 text-white p-3 rounded-[7px] w-full flex-1 focus:ring-2 focus:ring-white outline-none"
          disabled={loading}
        />
      </div>

      {/* Predefined layouts */}
      <div className="flex flex-col h-full">
        <h2 className="text-sm text-white mb-2">เลือกรูปแบบสำเร็จรูป</h2>
        <div className="flex flex-wrap gap-2 flex-1 overflow-auto">
          {PREDEFINED_ROOMS.map((room) => (
            <button
              key={room.name}
              onClick={() => {
                setRows(room.seatPattern.rows);
                setCols(room.seatPattern.cols);
                setRoomName(room.name);
                setRoomNumber(room.roomNumber);
                const layout: Seat[] = room.seatPattern.customLayout ?? [];
                setSeats(layout);
                setNextSeatNumber(layout.length + 1);
                const newMap: Record<string, number> = {};
                layout.forEach((s) => { newMap[`${s.gridRow}-${s.gridCol}`] = s.seatNumber; });
                setSeatNumberMap(newMap);
              }}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-500 text-white rounded-lg shadow"
            >
              {room.name}
            </button>
          ))}
        </div>
      </div>
    </div>


      {/* ตารางที่นั่ง */}
      <div className="rounded p-3 w-full overflow-auto bg-gray-50 shadow-inner"
        onMouseLeave={()=>{handleMouseUp(); setHoverRow(null); setHoverCol(null);}}
        onMouseUp={handleMouseUp}>
        <div className="grid gap-1 select-none w-full"
          style={{gridTemplateColumns:`repeat(${cols},1fr)`,gridTemplateRows:`repeat(${rows},1fr)`,aspectRatio:`${cols}/${rows}`,minHeight:'200px'}}>
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const number = getSeatNumber(r+1, c+1);
              const active = number !== null;
              const isHoveredRowOrCol = hoverRow === r+1 || hoverCol === c+1;
              return (
                <div key={`${r}-${c}`}
                  className={`rounded-lg cursor-pointer flex items-center justify-center text-xs font-medium transition
                    ${active
                      ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                      : isHoveredRowOrCol
                        ? 'bg-gray-500 hover:bg-yellow-200'
                        : 'bg-gray-400 hover:bg-gray-600 hover:border-2 border-yellow-300'
                    }`}
                  onMouseDown={()=>handleMouseDown(r+1,c+1)}
                  onMouseEnter={()=>handleMouseEnter(r+1,c+1)}
                  title={active ? `ที่นั่งหมายเลข ${number}` : 'คลิกหรือลากเลือกที่นั่ง'}
                  style={{ width: '100%', height: '100%' }}
                >
                  {number ?? ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ข้อความ error */}
      {errorMessage && (
        <p className="text-red-600 font-semibold text-center">{errorMessage}</p>
      )}

      {/* ปุ่มบันทึก */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-6 py-3 text-white font-semibold rounded-xl shadow transition
            ${loading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
          `}
        >
          {loading ? 'กำลังบันทึก...' : 'บันทึกห้องสอบ'}
        </button>
      </div>
    </div>
  );
}
