/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import type { ExamRoom, Seat } from '../../types/examRoom';
import { toast } from 'react-toastify';
import { PREDEFINED_ROOMS } from '../../data/predefinedRooms';
import Loading from '../components/Loading';

export default function CreateRoomPage() {
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

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000) 
  }, [])


  const posKey = (r: number, c: number) => `${r}-${c}`;

  const toggleSeat = (r: number, c: number) => {
    const key = `${r}-${c}`;
    const index = seats.findIndex((s) => s.gridRow === r && s.gridCol === c);

    if (index >= 0) {
      // ถ้ามีแล้ว -> ยกเลิกที่นั่ง
      const newSeats = seats.filter((_, i) => i !== index);
      // จัดเรียงเลขใหม่ตามลำดับการเลือก
      setSeats(newSeats.map((seat, idx) => ({
        ...seat,
        seatNumber: idx + 1
      })));
    } else {
      // ถ้ายังไม่มี -> เพิ่มที่นั่งใหม่
      const newSeats = [
        ...seats,
        { gridRow: r, gridCol: c, occupied: false }
      ];
      // จัดเรียงเลขใหม่
      setSeats(newSeats.map((seat, idx) => ({
        ...seat,
        seatNumber: idx + 1
      })));
    }
  };


  const getSeatNumber = (r: number, c: number) => {
    const seat = seats.find((s) => s.gridRow === r && s.gridCol === c);
    return seat ? seat.seatNumber : null;
  };

  const handleSave = async () => {
    setErrorMessage('');

    if (!room_name.trim()) {
      setErrorMessage('กรุณากรอกชื่อห้องสอบ');
      return;
    }
    if (!room_number.trim()) {
      setErrorMessage('กรุณากรอกรหัสห้องสอบ');
      return;
    }
    if (seats.length === 0) {
      setErrorMessage('กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง');
      return;
    }

    const finalSeats = seats;

    const roomData: ExamRoom = {
      room_id: room_number,
      room_name,
      room_number,
      totalSeats: finalSeats.length,
      seatPattern: {
        type: 'custom',
        rows,
        cols,
        customLayout: finalSeats,
      },
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
        setSeats([]);
        setRoomName('');
        setRoomNumber('');
        setDescription('');
        setNextSeatNumber(1);
        setSeatNumberMap({});
        window.location.reload()
      } else {
        const data = await res.json();
        if (res.status === 409) {
          setErrorMessage('รหัสห้องนี้ถูกใช้ไปแล้ว กรุณาใช้รหัสอื่น');
        } else {
          setErrorMessage(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
        }
      }
    } catch (error) {
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setLoading(false);
    }

    //console.log('Sending data:', roomData);
  };
  
  if (loading) return <Loading />;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 bg-gradient-to-t from-indigo-700 to-sky-600 rounded-lg shadow">
      <h1 className="text-3xl font-bold text-white">สร้างห้องสอบ</h1>

      {/* ฟอร์ม */}
      <div className="grid grid-cols-4 gap-4">
        
          <div>
            <label htmlFor="totalExaminees" className="block text-sm font-medium text-white mb-2">
              กรอกชื่อห้องสอบ
            </label>
            <input
            type="text"
            placeholder="ชื่อห้อง"
            value={room_name}
            onChange={(e) => setRoomName(e.target.value)}
            className=" border-2 border-gray-200 text-white p-3 rounded-[7px] w-full focus:ring-2 focus:ring-white outline-none"
            disabled={loading}
          />
          </div>
          <div>
            <label htmlFor="totalExaminees" className="block text-sm font-medium text-white mb-2">
              กรอกเลขที่ห้อง
            </label>
            <input
            type="text"
            placeholder="รหัสห้อง"
            value={room_number}
            onChange={(e) => setRoomNumber(e.target.value)}
            className="border-2 border-gray-200 p-3 text-white rounded-[7px] w-full focus:ring-2 focus:ring-white outline-none"
            disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="totalExaminees" className="block text-sm font-medium text-white mb-2">
              จำนวนแถวที่ต้องการในแผนผัง  
            </label>
            <input
            type="number"
            placeholder="จำนวนแถว"
            value={rows}
            onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
            className="border-2 border-gray-200 p-3 text-white rounded-[7px] w-full  focus:ring-2 focus:ring-white outline-none"
            disabled={loading}
            min={1}
          />
          </div>
          <div>
            <label htmlFor="totalExaminees" className="block text-sm font-medium text-white mb-2">
              จำนวนคอลัมน์ที่ต้องการในแผนผัง
            </label>
            <input
            type="number"
            placeholder="จำนวนคอลัมน์"
            value={cols}
            onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
            className="border-2 border-gray-200 p-3 text-white rounded-[7px] w-full focus:ring-2 focus:ring-white outline-none"
            disabled={loading}
            min={1}
          />
          </div>
          <div className='col-span-2'>
          <label htmlFor="totalExaminees" className="block text-sm font-medium text-white mb-2">
            คำอธิบายเกี่ยวกับห้อง
          </label>
          <textarea
          placeholder="คำอธิบาย"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border-2 border-gray-200 p-3 text-white rounded-[7px] w-full h-auto focus:ring-2 focus:ring-white outline-none "
          disabled={loading}
          rows={3}
        />
        </div>
        {/* ส่วนปุ่มเลือก layout */}
        <div className="col-span-2 mb-4">
          <h2 className="text-sm  text-white mb-2">เลือกรูปแบบสำเร็จรูป</h2>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_ROOMS.map((room) => (
                <button
                  key={room.name}
                  onClick={() => {
                    setRows(room.seatPattern.rows);
                    setCols(room.seatPattern.cols);
                    setRoomName(room.name);
                    setRoomNumber(room.roomNumber);
                    // ใช้ array ว่างถ้าไม่มี customLayout
                    const layout: Seat[] = room.seatPattern.customLayout ?? [];
                    setSeats(layout);
                    setNextSeatNumber(layout.length + 1);

                    // อัปเดต seatNumberMap
                    const newMap: Record<string, number> = {};
                    layout.forEach((s: Seat) => {
                      newMap[`${s.gridRow}-${s.gridCol}`] = s.seatNumber;
                    });
                    setSeatNumberMap(newMap);
                  }}
                  className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow"
                >
                  {room.name}
                </button>
              ))}
            </div>
        </div>
        </div>
    
        
      {/* ตารางที่นั่ง */}
      <div className=" rounded p-3 max-w-full w-full">
        <div
          className="grid gap-1 select-none w-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            aspectRatio: `${cols} / ${rows}`,
            minHeight: '200px',
          }}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((_, c) => {
              const number = getSeatNumber(r + 1, c + 1);
              const active = number !== null;
              return (
                <div
                  key={`${r}-${c}`}
                  className={`rounded-lg cursor-pointer flex items-center justify-center text-xs font-medium transition
                    ${active ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-gray-200 hover:bg-gray-300 hover:border-2 border-yellow-300'}
                  `}
                  onClick={() => !loading && toggleSeat(r + 1, c + 1)}
                  title={active ? `ที่นั่งหมายเลข ${number}` : 'คลิกเพื่อเลือกที่นั่ง'}
                  style={{ width: '100%', height: '100%' }}
                >
                  {number ?? ''}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ข้อความแสดง error */}
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
