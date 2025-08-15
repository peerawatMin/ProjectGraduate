/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { ExamRoom, SeatPosition } from '../../types/examTypes';
import { Eye } from 'lucide-react';
import Loading from './Loading';

interface RoomDetailsModalProps {
  room: ExamRoom | null;
  onClose: () => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, onClose }) => {
  if (!room) return null;

  const maxGridRow = room.seatPattern.rows;
  const maxGridCol = room.seatPattern.cols;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-t from-sky-600 to-indigo-700 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">{room.name}</h2>
        <p className="mb-1 text-white"><strong>ห้อง:</strong> {room.roomNumber}</p>
        <p className="mb-1 text-white"><strong>จำนวนที่นั่งทั้งหมด:</strong> {room.totalSeats}</p>
        {room.description && <p className="mb-4 text-white"><strong>รายละเอียด:</strong> {room.description}</p>}

        <h3 className="text-xl font-semibold mb-3 text-center text-white">รูปแบบแผนผังที่นั่ง</h3>
        <div
          className="grid gap-1 rounded-md p-4 bg-gray-100"
          style={{
            gridTemplateColumns: `repeat(${maxGridCol}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${maxGridRow}, minmax(0, 1fr))`,
          }}
        >
          {room.seatPattern.customLayout?.map((seat: SeatPosition) => (
            <div
              key={seat.seatNumber}
              className="flex items-center justify-center bg-emerald-500 text-white rounded-md text-xs font-medium aspect-square"
              style={{
                gridRowStart: seat.gridRow,
                gridColumnStart: seat.gridCol,
              }}
            >
              {seat.seatNumber}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-red-700 hover:text-red-500 text-3xl font-bold leading-none"
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default function RoomSelector({
  selectedRooms,
  onRoomSelectionChange,
}: {
  selectedRooms: ExamRoom[];
  onRoomSelectionChange: (rooms: ExamRoom[]) => void;
}) {
  const [availableRooms, setAvailableRooms] = useState<ExamRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<ExamRoom | null>(null);

  useEffect(() => {
    async function fetchRooms() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/rooms');
        if (!res.ok) throw new Error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
        const data = await res.json();

        const rooms: ExamRoom[] = data.map((room: any) => ({
          id: room.room_id || room.id || '',
          name: room.room_name,
          roomNumber: room.room_number,
          totalSeats: room.totalseats ?? room.totalSeats,
          seatPattern: typeof room.seatpattern === 'string' ? JSON.parse(room.seatpattern) : room.seatpattern,
          description: room.description,
        }));

        setAvailableRooms(rooms);
      } catch (err: any) {
        setError(err.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
      } finally {
        setLoading(false);
      }
    }

    fetchRooms();
  }, []);

  const handleRoomToggle = (room: ExamRoom) => {
    const isSelected = selectedRooms.some(r => r.id === room.id);

    if (isSelected) {
      onRoomSelectionChange(selectedRooms.filter(r => r.id !== room.id));
    } else {
      onRoomSelectionChange([...selectedRooms, room]);
    }
  };

  const handleSelectAllToggle = () => {
    if (selectedRooms.length === availableRooms.length) {
      onRoomSelectionChange([]);
    } else {
      onRoomSelectionChange([...availableRooms]);
    }
  };

  const handleViewDetails = (room: ExamRoom) => {
    setSelectedRoomForDetails(room);
    setShowModal(true);
  };

  const allRoomsSelected = selectedRooms.length === availableRooms.length && availableRooms.length > 0;

  return (
    <div className="bg-gradient-to-b from-indigo-700 to-sky-600 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">เลือกห้องสอบ</h2>

      {loading && <Loading/>}
      {error && <p className="text-red-400 mb-4">{error}</p>}

      {!loading && !error && availableRooms.length > 0 && (
        <>
          <div className="mb-4 pb-4 border-b border-gray-100">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={allRoomsSelected}
                onChange={handleSelectAllToggle}
                className="h-5 w-5 text-green-600 rounded cursor-pointer"
              />
              <span className="ml-3 text-lg font-medium text-white">เลือกทั้งหมด</span>
            </label>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {availableRooms.map(room => {
              const isSelected = selectedRooms.some(r => r.id === room.id);

              return (
                <div
                  key={room.id}
                  className={`p-4 m-2 border-2 rounded-lg transition-all ${
                    isSelected ? 'border-yellow-500 bg-gray-700' : 'border-green-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleRoomToggle(room)}
                        className="h-5 w-5 text-green-600 rounded cursor-pointer"
                      />
                      <div className="cursor-pointer" onClick={() => handleRoomToggle(room)}>
                        <h3 className="font-medium text-white">{room.name}</h3>
                        <p className="text-sm text-gray-200">ห้อง {room.roomNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button
                        onClick={() => handleViewDetails(room)}
                        className="px-4 py-2 text-white hover:text-yellow-500 text-sm "
                        aria-label={`ดูรายละเอียดห้อง ${room.name}`}
                      >
                        <Eye />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {availableRooms.length === 0 && !loading && !error && (
        <p className="text-gray-600 text-center py-4">ไม่พบห้องสอบที่ว่าง</p>
      )}

      {showModal && (
        <RoomDetailsModal
          room={selectedRoomForDetails}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
