// src/components/MultiRoomSeatMap.tsx

'use client';

import React, { useState } from 'react';
import { ExamRoomAllocation, SeatPosition, ExamRoom } from '../../types/examTypes'; // นำเข้า types ที่จำเป็น
import { ExaminerDetailsModal } from '../components/ExaminerDetailModal'; // นำเข้า Modal component
import { SeatItem } from './SeatItem'; // นำเข้า SeatItem component

interface MultiRoomSeatMapProps {
  allocations: ExamRoomAllocation[];
}

export default function MultiRoomSeatMap({ allocations }: MultiRoomSeatMapProps) {
  // Sort allocations by room ID
  const sortedAllocations = [...allocations].sort((a, b) => a.room.id.localeCompare(b.room.id));

  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    sortedAllocations.length > 0 ? sortedAllocations[0].room.id : ''
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSeat, setSelectedSeat] = useState<SeatPosition | null>(null);

  const selectedAllocation = sortedAllocations.find(a => a.room.id === selectedRoomId);

  const handleSeatClick = (seat: SeatPosition) => {
    if (seat.occupied && seat.examiner) {
      setSelectedSeat(seat);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeat(null);
  };

  if (sortedAllocations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">ยังไม่มีการจัดห้องสอบ</p>
      </div>
    );
  }

  // Calculate max rows and columns for the grid based on the selected room
  const getMaxGridDimensions = (room: ExamRoom) => {
    let maxRow = room.seatPattern.rows || 0;
    let maxCol = room.seatPattern.cols || 0;

    if (room.seatPattern.type === 'custom' && room.seatPattern.customLayout) {
      room.seatPattern.customLayout.forEach(seat => {
        if (seat.gridRow > maxRow) maxRow = seat.gridRow;
        if (seat.gridCol > maxCol) maxCol = seat.gridCol;
      });
    }

    // Account for projector and door positions in grid dimension

    // Add some padding to grid dimensions for better spacing if needed
    // For example, if grid items are at row 10, maybe the grid needs to extend to row 11 or 12
    return { maxRow: maxRow + 1, maxCol: maxCol + 1 }; // Add 1 for 0-indexed considerations and padding
  };

  const { maxRow: gridMaxRow, maxCol: gridMaxCol } = selectedAllocation
    ? getMaxGridDimensions(selectedAllocation.room)
    : { maxRow: 0, maxCol: 0 };

  return (
    <div className="bg-gradient-to-t from-sky-600 to-indigo-700 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-white text-center">แผนผังที่นั่งแต่ละห้องสอบ</h2>

      {/* Room Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {sortedAllocations.map((allocation) => (
          <button
            key={allocation.room.id}
            onClick={() => setSelectedRoomId(allocation.room.id)}
            className={`px-5 py-2 rounded-full font-medium transition-colors duration-300 shadow-md
              ${selectedRoomId === allocation.room.id
                ? 'bg-blue-600 text-white transform scale-105'
                : 'bg-blue-100 text-blue-800 hover:bg-green-600 hover:text-white'
              }`}
          >
            {allocation.room.name}
            <span className="ml-2 text-sm opacity-90">({allocation.allocatedSeats}/{allocation.room.totalSeats})</span>
          </button>
        ))}
      </div>

      {/* Selected Room Details and Seat Grid */}
      {selectedAllocation && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-5 rounded-lg shadow-sm">
            <h3 className="font-semibold text-xl text-blue-800 mb-1">{selectedAllocation.room.name}</h3>
            <p className="text-blue-700 text-sm mb-3">{selectedAllocation.room.description}</p>
            <div className="text-base text-blue-600 font-medium">
              <span>ความจุ: <span className="font-bold">{selectedAllocation.room.totalSeats}</span> ที่นั่ง</span>
              <span className="ml-6">ใช้งาน: <span className="font-bold">{selectedAllocation.allocatedSeats}</span> ที่นั่ง</span>
            </div>
          </div>

          {/* Seat Grid Container */}
          <div className="bg-gray-50 p-3 rounded-lg shadow-inner items-center my-auto overflow-auto overflow-x-scroll max-h-[550px] relative">
            <div
              className="grid gap-2 justify-center mx-auto p-2"
              style={{
                gridTemplateColumns: `repeat(${gridMaxCol}, minmax(60px, 1fr))`,
                gridTemplateRows: `repeat(${gridMaxRow}, minmax(60px, 1fr))` // Define rows explicitly
              }}
            >

              {/* Render Seats */}
              {selectedAllocation.seatArrangement.map((seat) => (
                <SeatItem
                  key={`${selectedAllocation.room.id}-${seat.seatNumber}`}
                  seat={seat}
                  onClick={handleSeatClick}
                  gridRow={seat.gridRow}
                  gridCol={seat.gridCol}
                />
              ))}
            </div>
          </div>

          {/* Room Legend */}
          <div className="flex items-center justify-center space-x-4 text-white text-base mt-4 font-medium">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-100 border-2 border-green-300 rounded-md"></div>
              <span>ที่นั่งที่มีผู้เข้าสอบ</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gray-100 border-2 border-gray-300 rounded-md"></div>
              <span>ที่นั่งว่าง</span>
            </div>
          </div>
        </div>
      )}

      {/* Examiner Details Modal */}
      <ExaminerDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        seat={selectedSeat}
      />
    </div>
  );
}