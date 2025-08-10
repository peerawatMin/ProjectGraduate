// src/components/SeatItem.tsx

import React from 'react';
import { SeatPosition as Seat } from '../../types/examTypes'; // ใช้ SeatPosition ตาม type ใหม่

interface SeatItemProps {
  seat: Seat;
  onClick: (seat: Seat) => void;
  gridRow: number;
  gridCol: number;
}

export const SeatItem: React.FC<SeatItemProps> = ({ seat, onClick, gridRow, gridCol }) => {
  const isOccupied = seat.occupied;

  return (
    <div
      onClick={() => onClick(seat)}
      className={`
        border-2 rounded-lg p-2 text-center text-xs font-medium
        aspect-square flex flex-col items-center justify-center cursor-pointer transition-all duration-200
        ${isOccupied
          ? 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
          : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
        }
      `}
      style={{
        gridRow: gridRow,
        gridColumn: gridCol
      }}
      title={isOccupied && seat.examiner ?
        `ที่นั่ง: ${seat.seatNumber}\nรหัส: ${seat.examiner.examinerid}\nชื่อ: ${seat.examiner.title} ${seat.examiner.firstname} ${seat.examiner.lastname}`
        : `ที่นั่งว่าง: ${seat.seatNumber}`
      }
    >
      <span className="font-bold text-base">{seat.seatNumber}</span>
      {isOccupied ? (
        <span className="text-xs text-green-700">มีผู้สอบ</span>
      ) : (
        <span className="text-xs text-gray-400">ว่าง</span>
      )}
    </div>
  );
};