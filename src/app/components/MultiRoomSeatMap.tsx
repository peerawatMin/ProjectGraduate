'use client';

import React, { useState, useMemo } from 'react';
import { ExamRoomAllocation, ExamSeat } from '../../types/examTypes';
import { ExaminerDetailsModal } from '../components/ExaminerDetailModal';
import { SeatItem } from './SeatItem';

interface MultiRoomSeatMapProps {
  allocations?: ExamRoomAllocation[]; // ป้องกัน undefined
}

export const MultiRoomSeatMap: React.FC<MultiRoomSeatMapProps> = ({ allocations = [] }) => {
  // กรองเฉพาะ allocation ที่มี room
  const validAllocations = allocations.filter(a => a.room);

  // จัดเรียง allocations ตาม room.id
  const sortedAllocations = [...validAllocations].sort((a, b) =>
    a.room.id.localeCompare(b.room.id)
  );

  // เลือกห้องแรกเป็น default
  const [selectedRoomId, setSelectedRoomId] = useState<string>(
    sortedAllocations[0]?.room?.id || ''
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<ExamSeat | null>(null);

  // assign seat_number ต่อเนื่องทุกห้อง (บังคับเลขใหม่)
  const allocationsWithSeatNumber = useMemo(() => {
    let cumulativeSeats = 0;
    return sortedAllocations.map((allocation) => {
      const seatArrangement = allocation.seatArrangement.map((seat, index) => ({
        ...seat,
        seat_number: cumulativeSeats + index + 1, // ต่อเนื่องข้ามห้อง
      }));
      cumulativeSeats += allocation.seatArrangement.length;
      return {
        ...allocation,
        seatArrangement,
      };
    });
  }, [sortedAllocations]);

  const selectedAllocation = allocationsWithSeatNumber.find(
    (a) => a.room.id === selectedRoomId
  );

  const handleSeatClick = (seat: ExamSeat) => {
    if (seat.examiner) {
      setSelectedSeat(seat);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSeat(null);
  };

  const getMaxGridDimensions = (allocation: ExamRoomAllocation) => {
    let maxRow = 0, maxCol = 0;
    allocation.seatArrangement.forEach((seat) => {
      if (seat.gridRow > maxRow) maxRow = seat.gridRow;
      if (seat.gridCol > maxCol) maxCol = seat.gridCol;
    });
    return { maxRow: maxRow + 1, maxCol: maxCol + 1 };
  };

  const { maxRow: gridMaxRow, maxCol: gridMaxCol } = selectedAllocation
    ? getMaxGridDimensions(selectedAllocation)
    : { maxRow: 0, maxCol: 0 };

  if (sortedAllocations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <p className="text-gray-500">ยังไม่มีการจัดห้องสอบ</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-600 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-6 text-white text-center">
        แผนผังที่นั่งแต่ละห้องสอบ
      </h2>

      {/* Room Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {allocationsWithSeatNumber.map((allocation) => (
          <button
            key={allocation.room.id}
            onClick={() => setSelectedRoomId(allocation.room.id)}
            className={`px-5 py-2 rounded-full font-medium transition-colors duration-300 shadow-md ${
              selectedRoomId === allocation.room.id
                ? 'bg-blue-600 text-white transform scale-105'
                : 'bg-blue-100 text-blue-800 hover:bg-green-600 hover:text-white'
            }`}
          >
            {allocation.room.name}
            <span className="ml-2 text-sm opacity-90">
              ({allocation.allocatedSeats}/{allocation.room.totalSeats})
            </span>
          </button>
        ))}
      </div>

      {/* Seat Grid */}
      {selectedAllocation && (
        <div className="space-y-6">

          <div className="bg-gray-50 p-3 rounded-lg shadow-inner overflow-auto max-h-[550px] w-full flex">
            <div
              className="grid gap-2 w-full h-full flex-1"
              style={{
                gridTemplateColumns: `repeat(${gridMaxCol}, minmax(60px, 1fr))`,
                gridTemplateRows: `repeat(${gridMaxRow}, minmax(60px, 1fr))`,
              }}
            >
              {selectedAllocation.seatArrangement.map((seat) => (
                <SeatItem
                  key={`${selectedAllocation.room.id}-${seat.seat_number}`}
                  seat={seat}
                  onClick={handleSeatClick}
                  gridRow={seat.gridRow}
                  gridCol={seat.gridCol}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
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

      <ExaminerDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        seat={selectedSeat}
      />
    </div>
  );
};
