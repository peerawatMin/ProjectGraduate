'use client'

import React, { useState } from 'react';
import { ExamRoom, SeatPosition } from '../../types/examTypes'; // Import SeatPosition
import { Eye } from 'lucide-react';


interface RoomSelectorProps {
  availableRooms: ExamRoom[];
  selectedRooms: ExamRoom[];
  onRoomSelectionChange: (rooms: ExamRoom[]) => void;
}

// New Modal Component for Room Details
interface RoomDetailsModalProps {
  room: ExamRoom | null;
  onClose: () => void;
}

const RoomDetailsModal: React.FC<RoomDetailsModalProps> = ({ room, onClose }) => {
  if (!room) return null;

  // Determine max rows and cols for custom layout to set grid dimensions
  const maxGridRow = room.seatPattern.rows;
  const maxGridCol = room.seatPattern.cols;

  return (
    <div className="fixed inset-0 bg-transparentx backdrop-blur-sm bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-linear-to-t from-sky-600 to-indigo-700 rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <h2 className="text-2xl font-bold mb-4 text-center text-white">รายละเอียดห้องสอบ: {room.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 items-center mx-6">
          <p className="text-gray-200 mb-2">ห้อง: {room.roomNumber}</p>
          <p className="text-gray-200 mb-2">จำนวนที่นั่งทั้งหมด: {room.totalSeats} ที่นั่ง</p>
          
          {room.description && (
            <p className=" text-gray-200 mb-4">รายละเอียด: {room.description}</p>
          )}
        </div>
        


        <h3 className="text-xl font-semibold mb-3 text-white text-center">รูปแบบแผนผังที่นั่ง</h3>
        <div className="p-4 rounded-md bg-sky-100">
          {/* Render seats based on customLayout for both rectangular and custom types */}
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `repeat(${maxGridCol}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${maxGridRow}, minmax(0, 1fr))`,
            }}
          >
            {room.seatPattern.customLayout?.map((seat: SeatPosition) => (
              <div
                key={seat.seatNumber}
                className="flex items-center justify-center bg-green-300 text-green-800 rounded-md p-1 text-xs font-medium aspect-square"
                style={{
                  gridRowStart: seat.gridRow,
                  gridColumnStart: seat.gridCol,
                }}
              >
                {seat.seatNumber}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-red-800 hover:text-red-500 text-3xl font-bold leading-none"
          >
          &times;
        </button>
        </div>
      </div>
    </div>
  );
};


export default function RoomSelector({
  availableRooms,
  selectedRooms,
  onRoomSelectionChange
}: RoomSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<ExamRoom | null>(null);

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
      // All rooms are currently selected, deselect all
      onRoomSelectionChange([]);
    } else {
      // Not all rooms are selected, select all
      onRoomSelectionChange([...availableRooms]);
    }
  };

  const handleViewDetails = (room: ExamRoom) => {
    setSelectedRoomForDetails(room);
    setShowModal(true);
  };

  // Determine if all rooms are selected
  const allRoomsSelected = selectedRooms.length === availableRooms.length && availableRooms.length > 0;

  return (
    <div className="bg-linear-to-b from-indigo-700 to-sky-600 p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-white">เลือกห้องสอบ</h2>

      {/* Select All Checkbox */}
      {availableRooms.length > 0 && (
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
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {availableRooms.length === 0 ? (
          <p className="text-gray-600 text-center py-4">ไม่พบห้องสอบที่ว่าง</p>
        ) : (
          availableRooms.map((room) => {
            const isSelected = selectedRooms.some(r => r.id === room.id);

            return (
              <div
                key={room.id}
                className={`p-4 m-2 border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-yellow-500 bg-gray-700'
                    : 'border-green-200 hover:border-gray-300'
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
                    <div className="cursor-pointer" onClick={() => handleRoomToggle(room)}> {/* Make name clickable for toggle */}
                      <h3 className="font-medium text-white">{room.name}</h3>
                      <p className="text-sm text-gray-200">ห้อง {room.roomNumber}</p>
                    </div>
                  </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleViewDetails(room)}
                            className="px-4 py-2 text-white hover:text-yellow-500 text-smshadow-sm"
                          >
                            <Eye/>
                          </button>
                        
                      </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Room Details Modal */}
      {showModal && (
        <RoomDetailsModal
          room={selectedRoomForDetails}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}