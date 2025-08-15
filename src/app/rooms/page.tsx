/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';


import { SquarePen } from 'lucide-react';
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import Loading from '../components/Loading';

type Seat = {
  gridRow: number;
  gridCol: number;
  seatNumber: number;
  occupied: boolean;
};

type SeatPattern = {
  type: string;
  rows: number;
  cols: number;
  customLayout: Seat[];
};

type ExamRoom = {
  room_id: string;
  room_name: string;
  room_number: string;
  totalseats: number;
  description?: string;
  created_at?: string;
  seatpattern: SeatPattern;
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ExamRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Confirm Delete
  const [roomToDelete, setRoomToDelete] = useState<ExamRoom | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Modal Edit
  const [roomToEdit, setRoomToEdit] = useState<ExamRoom | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ฟอร์มแก้ไขข้อมูล
  const [editForm, setEditForm] = useState({
    room_name: '',
    room_number: '',
    totalseats: 0,
    description: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000) 
  }, [])

  async function fetchRooms() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const data = await res.json();
      setRooms(data);
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  }

  // Handle Delete
  async function handleDeleteRoom() {
    if (!roomToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(null);

    try {
      const res = await fetch(`/api/rooms?room_id=${encodeURIComponent(roomToDelete.room_id)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'ลบห้องสอบไม่สำเร็จ');
      }

      setDeleteSuccess('ลบห้องสอบสำเร็จ');
      window.location.reload()
      setRooms(prev => prev.filter(r => r.room_id !== roomToDelete.room_id));
      setRoomToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'ลบห้องสอบไม่สำเร็จ');
    } finally {
      setDeleteLoading(false);
    }
  }

  // Handle Open Edit Modal
  function openEditModal(room: ExamRoom) {
    setRoomToEdit(room);
    setEditError(null);
    setEditForm({
      room_name: room.room_name,
      room_number: room.room_number,
      totalseats: room.totalseats,
      description: room.description || '',
    });
  }

  // Handle Form Change
  function handleEditChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: name === 'totalseats' ? Number(value) : value,
    }));
  }

  // Submit Edit Form
  async function handleEditSubmit(e: FormEvent) {
    e.preventDefault();
    if (!roomToEdit) return;

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: roomToEdit.room_id,
          room_name: editForm.room_name,
          room_number: editForm.room_number,
          totalseats: editForm.totalseats,
          seatpattern: roomToEdit.seatpattern, // ไม่แก้ไขแผนผังที่นั่ง
          description: editForm.description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'แก้ไขห้องสอบไม่สำเร็จ');
      }

      // อัพเดต state ห้องใหม่
      setRooms(prev =>
        prev.map(r =>
          r.room_id === roomToEdit.room_id
            ? {
                ...r,
                room_name: editForm.room_name,
                room_number: editForm.room_number,
                totalseats: editForm.totalseats,
                description: editForm.description,
              }
            : r
        )
      );

      setRoomToEdit(null);
    } catch (err: any) {
      setEditError(err.message || 'แก้ไขห้องสอบไม่สำเร็จ');
    } finally {
      setEditLoading(false);
    }
  }

  if (loading) return <Loading />;
  if (error) return <div className="p-6 text-center text-red-600">ผิดพลาด: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 relative bg-gradient-to-t from-sky-600 to-indigo-700 rounded-2xl">
      <h1 className="text-[25px] font-bold mb-6 text-white">รายชื่อห้องสอบ</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {rooms.length === 0 && (
          <p className="col-span-full text-center text-gray-600">ยังไม่มีข้อมูลห้องสอบ</p>
        )}
        {rooms.map(room => (
          <div
            key={room.room_id}
            className="bg-white rounded-xl shadow-md p-4 cursor-pointer hover:shadow-xl hover:scale-105 transition relative flex flex-col justify-between h-72"
            onClick={() => setSelectedRoom(room)}
          >
            {/* เนื้อหาห้อง */}
            <div>
              <h2 className="text-lg font-semibold mb-3 text-center text-blue-800">{room.room_name}</h2>
              <hr className="text-gray-500 mb-4" />
              <p className="text-gray-500 mb-2 text-sm">
                <span className='font-semibold text-gray-600 '>รหัสห้อง :</span> {room.room_number}
              </p>
              <p className="text-gray-500 mb-2 text-sm">
                <span className='font-semibold text-gray-600 '>จำนวนที่นั่ง :</span> {room.totalseats}
              </p>
              <p className="text-gray-500 whitespace-pre-line mb-2 text-sm">
                <span className='font-semibold text-gray-600 '>รายละเอียด : </span>{room.description || '-'}
              </p>
            </div>

            {/* วันที่สร้าง + ปุ่มแก้ไข/ลบ อยู่ด้านล่างในแถวเดียว */}
            <div
              className="flex justify-between items-center mt-4"
              onClick={e => e.stopPropagation()}
            >
              {/* วันที่สร้าง */}
              <p className="text-gray-500 text-xs">
                📅 {new Date(room.created_at || '-').toLocaleString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {/* ปุ่มแก้ไขและลบ */}
              <div className="flex space-x-2">
                <button
                  onClick={() => openEditModal(room)}
                  className="px-3 py-1 text-white bg-yellow-600 rounded hover:bg-yellow-700 focus:outline-none"
                  aria-label={`แก้ไขห้องสอบ ${room.room_name}`}
                >
                  <SquarePen />
                </button>
                <button
                  onClick={() => setRoomToDelete(room)}
                  className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 focus:outline-none"
                  aria-label={`ลบห้องสอบ ${room.room_name}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

        ))}
      </div>

      {/* Modal รายละเอียดห้อง */}
      {selectedRoom && (
        <>
          <div
            className="fixed inset-0 bg-transparent bg-opacity-70 backdrop-blur-md z-40"
            onClick={() => setSelectedRoom(null)}
          ></div>

          <div className="fixed inset-0 flex items-center justify-center z-50 p-6">
            <div className="bg-gradient-to-t from-sky-600 to-indigo-700 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-8 relative">
              <button
                onClick={() => setSelectedRoom(null)}
                className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-2xl font-bold"
                aria-label="Close modal"
              >
                &times;
              </button>

              <h2 className="text-2xl text-center font-bold mb-4 text-white">
                {selectedRoom.room_name}
              </h2>
              <p className="mb-4  text-gray-200">เลขที่ห้อง : {selectedRoom.room_number}</p>
              <p className="mb-4  text-gray-200">รายละเอียด : {selectedRoom.description || '-'}</p>
              <div className="w-full max-w-full max-h-[60vh] ">
                <div
                  className="grid gap-1 w-full h-full "
                  style={{
                    gridTemplateColumns: `repeat(${selectedRoom.seatpattern.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${selectedRoom.seatpattern.rows}, 1fr)`,
                    aspectRatio: `${selectedRoom.seatpattern.cols} / ${selectedRoom.seatpattern.rows}`,
                  }}
                >
                  {Array.from({ length: selectedRoom.seatpattern.rows }).map((_, r) =>
                    Array.from({ length: selectedRoom.seatpattern.cols }).map((_, c) => {
                      const seat = selectedRoom.seatpattern.customLayout.find(
                        s => s.gridRow === r + 1 && s.gridCol === c + 1
                      );
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={` rounded flex items-center justify-center text-xs font-medium ${
                            seat ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                          }`}
                          title={seat ? `ที่นั่ง: ${seat.seatNumber}` : ''}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            {seat ? seat.seatNumber : ''}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal Confirm Delete */}
      {roomToDelete && (
        <>
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 z-40"
            onClick={() => setRoomToDelete(null)}
          ></div>

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-t from-sky-600 to-indigo-700 rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <h3 className="text-lg font-semibold mb-4 text-white">
                คุณต้องการลบห้องสอบ : {' '}
                <span className="text-yellow-500">{roomToDelete.room_name}</span> ?
                <hr className='text-white mt-2 mb-4' />
                <p className='text-sm'>ถ้าคุณต้องการลบห้องสอบนี้ กดเลือกปุ่ม <span className='text-red-600'>&quot; ลบ &quot;</span></p>
              </h3>

              {deleteError && <p className="text-red-600 mb-3">{deleteError}</p>}
              {deleteSuccess && <p className="text-green-600 mb-3">{deleteSuccess}</p>}

              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => setRoomToDelete(null)}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-lg text-gray-400 bg-gray-100 border border-gray-300 hover:text-yellow-500 hover:bg-gray-500 focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleDeleteRoom}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none"
                >
                  {deleteLoading ? 'กำลังลบ...' : 'ลบ'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal แก้ไข */}
      {roomToEdit && (
        <>
          <div
            className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 z-40"
            onClick={() => setRoomToEdit(null)}
          ></div>

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <form
              onSubmit={handleEditSubmit}
              className="bg-gradient-to-t from-sky-600 to-indigo-700 rounded-2xl shadow-xl w-full max-w-md p-6 relative"
              onClick={e => e.stopPropagation()} // กันปิด modal เวลากดใน form
            >
              <button
                type="button"
                onClick={() => setRoomToEdit(null)}
                className="absolute top-3 right-3 text-red-600 hover:text-red-900 text-2xl font-bold"
                aria-label="Close edit modal"
              >
                &times;
              </button>

              <h3 className="text-lg font-semibold mb-4 text-center text-white">แก้ไขข้อมูลห้องสอบ</h3>

              <label className="block mb-2 text-white">
                ชื่อห้องสอบ:
                <input
                  type="text"
                  name="room_name"
                  value={editForm.room_name}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-white"
                />
              </label>

              <label className="block mb-2 text-white">
                รหัสห้อง:
                <input
                  type="text"
                  name="room_number"
                  value={editForm.room_number}
                  onChange={handleEditChange}
                  required
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-white"
                />
              </label>

              <label className="block mb-2 text-white">
                จำนวนที่นั่ง:
                <input
                  type="number"
                  name="totalseats"
                  value={editForm.totalseats}
                  onChange={handleEditChange}
                  required
                  min={1}
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-white"
                />
              </label>

              <label className="block mb-4 text-white">
                รายละเอียด:
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2 mt-1 text-white"
                />
              </label>

              {editError && <p className="text-red-600 mb-3">{editError}</p>}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRoomToEdit(null)}
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-200 text-gray-400 hover:text-yellow-500 hover:bg-gray-500 focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 focus:outline-none"
                >
                  {editLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
