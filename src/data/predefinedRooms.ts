// src/data/predefinedRooms.ts (หรือในไฟล์ที่คุณเก็บ PREDEFINED_ROOMS)
// import { ExamRoom, SeatPosition } from '../types/examTypes'; // อาจต้องนำเข้า type

import { ExamRoom } from '../types/examTypes';

export const PREDEFINED_ROOMS: ExamRoom[] = [
  {
    id: '17109',
    name: 'ห้องสอบที่ 1',
    roomNumber: '17109',
    totalSeats: 50,
    seatPattern: {
      type: 'custom', // เปลี่ยนเป็น custom เพราะมีการกำหนด gridRow/gridCol ชัดเจน
      rows: 10, // Max gridRow ที่ใช้ใน customLayout + 1 (เพื่อรวม projector/door)
      cols: 7,  // Max gridCol ที่ใช้ใน customLayout
      customLayout: [
        { gridRow: 1, gridCol: 1, seatNumber: 1, occupied: false }, { gridRow: 2, gridCol: 1, seatNumber: 2, occupied: false }, { gridRow: 3, gridCol: 1, seatNumber: 3, occupied: false },
        { gridRow: 4, gridCol: 1, seatNumber: 4, occupied: false }, { gridRow: 5, gridCol: 1, seatNumber: 5, occupied: false }, { gridRow: 6, gridCol: 1, seatNumber: 6, occupied: false },
        { gridRow: 7, gridCol: 1, seatNumber: 7, occupied: false }, { gridRow: 8, gridCol: 1, seatNumber: 8, occupied: false }, { gridRow: 9, gridCol: 1, seatNumber: 9, occupied: false }, { gridRow: 10, gridCol: 1, seatNumber: 10, occupied: false },
        
        { gridRow: 1, gridCol: 2, seatNumber: 11, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 12, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 13, occupied: false },
        { gridRow: 4, gridCol: 2, seatNumber: 14, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 15, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 16, occupied: false },
        { gridRow: 7, gridCol: 2, seatNumber: 17, occupied: false }, { gridRow: 8, gridCol: 2, seatNumber: 18, occupied: false }, { gridRow: 9, gridCol: 2, seatNumber: 19, occupied: false },{ gridRow: 10, gridCol: 2, seatNumber: 20, occupied: false },
        
        { gridRow: 1, gridCol: 4, seatNumber: 21, occupied: false }, { gridRow: 2, gridCol: 4, seatNumber: 22, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 23, occupied: false },
        { gridRow: 4, gridCol: 4, seatNumber: 24, occupied: false }, { gridRow: 5, gridCol: 4, seatNumber: 25, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 26, occupied: false },
        { gridRow: 7, gridCol: 4, seatNumber: 27, occupied: false }, { gridRow: 8, gridCol: 4, seatNumber: 28, occupied: false },{ gridRow: 9, gridCol: 4, seatNumber: 29, occupied: false },{ gridRow: 10, gridCol: 4, seatNumber: 30, occupied: false },
        
        { gridRow: 1, gridCol: 5, seatNumber: 31, occupied: false }, { gridRow: 2, gridCol: 5, seatNumber: 32, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 33, occupied: false },
        { gridRow: 4, gridCol: 5, seatNumber: 34, occupied: false }, { gridRow: 5, gridCol: 5, seatNumber: 35, occupied: false }, { gridRow: 6, gridCol: 5, seatNumber: 36, occupied: false },
        { gridRow: 7, gridCol: 5, seatNumber: 37, occupied: false }, { gridRow: 8, gridCol: 5, seatNumber: 38, occupied: false },{ gridRow: 9, gridCol: 5, seatNumber: 39, occupied: false },{ gridRow: 10, gridCol: 5, seatNumber: 40, occupied: false },

        { gridRow: 1, gridCol: 7, seatNumber: 41, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 42, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 43, occupied: false },
        { gridRow: 4, gridCol: 7, seatNumber: 44, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 45, occupied: false }, { gridRow: 6, gridCol: 7, seatNumber: 46, occupied: false },
        { gridRow: 7, gridCol: 7, seatNumber: 47, occupied: false }, { gridRow: 8, gridCol: 7, seatNumber: 48, occupied: false }, { gridRow: 9, gridCol: 7, seatNumber: 49, occupied: false },{ gridRow: 10, gridCol: 7, seatNumber: 50, occupied: false }
      ]
    },
    description: 'ห้องสอบหลัก มีโปรเจคเตอร์',

  },
  {
    id: '17110',
    name: 'ห้องสอบที่ 2',
    roomNumber: '17110',
    totalSeats: 50,
    seatPattern: {
      type: 'custom',
      rows: 10, // Max gridRow ที่ใช้ใน customLayout + 1
      cols: 7,  // Max gridCol ที่ใช้ใน customLayout
      customLayout: [
        { gridRow: 1, gridCol: 1, seatNumber: 51, occupied: false }, { gridRow: 2, gridCol: 1, seatNumber: 52, occupied: false }, { gridRow: 3, gridCol: 1, seatNumber: 53, occupied: false },
        { gridRow: 4, gridCol: 1, seatNumber: 54, occupied: false }, { gridRow: 5, gridCol: 1, seatNumber: 55, occupied: false }, { gridRow: 6, gridCol: 1, seatNumber: 56, occupied: false },
        { gridRow: 7, gridCol: 1, seatNumber: 57, occupied: false }, { gridRow: 8, gridCol: 1, seatNumber: 58, occupied: false }, { gridRow: 9, gridCol: 1, seatNumber: 59, occupied: false }, { gridRow: 10, gridCol: 1, seatNumber: 60, occupied: false },
      
        { gridRow: 1, gridCol: 2, seatNumber: 61, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 62, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 63, occupied: false },
        { gridRow: 4, gridCol: 2, seatNumber: 64, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 65, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 66, occupied: false },
        { gridRow: 7, gridCol: 2, seatNumber: 67, occupied: false }, { gridRow: 8, gridCol: 2, seatNumber: 68, occupied: false }, { gridRow: 9, gridCol: 2, seatNumber: 69, occupied: false },{ gridRow: 10, gridCol: 2, seatNumber: 70, occupied: false },
        
        { gridRow: 1, gridCol: 4, seatNumber: 71, occupied: false }, { gridRow: 2, gridCol: 4, seatNumber: 72, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 73, occupied: false },
        { gridRow: 4, gridCol: 4, seatNumber: 74, occupied: false }, { gridRow: 5, gridCol: 4, seatNumber: 75, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 76, occupied: false },
        { gridRow: 7, gridCol: 4, seatNumber: 77, occupied: false }, { gridRow: 8, gridCol: 4, seatNumber: 78, occupied: false },{ gridRow: 9, gridCol: 4, seatNumber: 79, occupied: false },{ gridRow: 10, gridCol: 4, seatNumber: 80, occupied: false },
        
        { gridRow: 1, gridCol: 5, seatNumber: 81, occupied: false }, { gridRow: 2, gridCol: 5, seatNumber: 82, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 83, occupied: false },
        { gridRow: 4, gridCol: 5, seatNumber: 84, occupied: false }, { gridRow: 5, gridCol: 5, seatNumber: 85, occupied: false }, { gridRow: 6, gridCol: 5, seatNumber: 86, occupied: false },
        { gridRow: 7, gridCol: 5, seatNumber: 87, occupied: false }, { gridRow: 8, gridCol: 5, seatNumber: 88, occupied: false },{ gridRow: 9, gridCol: 5, seatNumber: 89, occupied: false },{ gridRow: 10, gridCol: 5, seatNumber: 90, occupied: false },

        { gridRow: 1, gridCol: 7, seatNumber: 91, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 92, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 93, occupied: false },
        { gridRow: 4, gridCol: 7, seatNumber: 94, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 95, occupied: false }, { gridRow: 6, gridCol: 7, seatNumber: 96, occupied: false },
        { gridRow: 7, gridCol: 7, seatNumber: 97, occupied: false }, { gridRow: 8, gridCol: 7, seatNumber: 98, occupied: false }, { gridRow: 9, gridCol: 7, seatNumber: 99, occupied: false },{ gridRow: 10, gridCol: 7, seatNumber: 100, occupied: false }
      ]
    },
    description: 'ห้องสอบรอง มีโปรเจคเตอร์',
 
  },
  {
    id: '17111',
    name: 'ห้องสอบที่ 3',
    roomNumber: '17111',
    totalSeats: 60,
    seatPattern: {
      type: 'custom',
      rows: 10, // Max gridRow ที่ใช้ใน customLayout + 1
      cols: 7,  // Max gridCol ที่ใช้ใน customLayout
      customLayout: [
        { gridRow: 1, gridCol: 1, seatNumber: 101, occupied: false }, { gridRow: 2, gridCol: 1, seatNumber: 102, occupied: false }, { gridRow: 3, gridCol: 1, seatNumber: 103, occupied: false },
        { gridRow: 4, gridCol: 1, seatNumber: 104, occupied: false }, { gridRow: 5, gridCol: 1, seatNumber: 105, occupied: false }, { gridRow: 6, gridCol: 1, seatNumber: 106, occupied: false },
        { gridRow: 7, gridCol: 1, seatNumber: 107, occupied: false }, { gridRow: 8, gridCol: 1, seatNumber: 108, occupied: false }, { gridRow: 9, gridCol: 1, seatNumber: 109, occupied: false }, { gridRow: 10, gridCol: 1, seatNumber: 110, occupied: false },
        
        { gridRow: 1, gridCol: 2, seatNumber: 111, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 112, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 113, occupied: false },
        { gridRow: 4, gridCol: 2, seatNumber: 114, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 115, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 116, occupied: false },
        { gridRow: 7, gridCol: 2, seatNumber: 117, occupied: false }, { gridRow: 8, gridCol: 2, seatNumber: 118, occupied: false }, { gridRow: 9, gridCol: 2, seatNumber: 119, occupied: false },{ gridRow: 10, gridCol: 2, seatNumber: 120, occupied: false },
        
        { gridRow: 1, gridCol: 4, seatNumber: 121, occupied: false }, { gridRow: 2, gridCol: 4, seatNumber: 122, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 123, occupied: false },
        { gridRow: 4, gridCol: 4, seatNumber: 124, occupied: false }, { gridRow: 5, gridCol: 4, seatNumber: 125, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 126, occupied: false },
        { gridRow: 7, gridCol: 4, seatNumber: 127, occupied: false }, { gridRow: 8, gridCol: 4, seatNumber: 128, occupied: false },{ gridRow: 9, gridCol: 4, seatNumber: 129, occupied: false },{ gridRow: 10, gridCol: 4, seatNumber: 130, occupied: false },
        
        { gridRow: 1, gridCol: 5, seatNumber: 131, occupied: false }, { gridRow: 2, gridCol: 5, seatNumber: 132, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 133, occupied: false },
        { gridRow: 4, gridCol: 5, seatNumber: 134, occupied: false }, { gridRow: 5, gridCol: 5, seatNumber: 135, occupied: false }, { gridRow: 6, gridCol: 5, seatNumber: 136, occupied: false },
        { gridRow: 7, gridCol: 5, seatNumber: 137, occupied: false }, { gridRow: 8, gridCol: 5, seatNumber: 138, occupied: false },{ gridRow: 9, gridCol: 5, seatNumber: 139, occupied: false },{ gridRow: 10, gridCol: 5, seatNumber: 140, occupied: false },

        { gridRow: 1, gridCol: 7, seatNumber: 141, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 142, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 143, occupied: false },
        { gridRow: 4, gridCol: 7, seatNumber: 144, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 145, occupied: false }, { gridRow: 6, gridCol: 7, seatNumber: 146, occupied: false },
        { gridRow: 7, gridCol: 7, seatNumber: 147, occupied: false }, { gridRow: 8, gridCol: 7, seatNumber: 148, occupied: false }, { gridRow: 9, gridCol: 7, seatNumber: 149, occupied: false },{ gridRow: 10, gridCol: 7, seatNumber: 150, occupied: false },
        
        // This block seems to be a copy of the previous one, check if it's intentional for 60 seats.
        // If it's a new set of 10 seats, their seat numbers should be 151-160 and grid positions unique.
        // Assuming it's meant to be distinct, I'll update the seat numbers and gridRow.
        { gridRow: 11, gridCol: 1, seatNumber: 151, occupied: false }, { gridRow: 11, gridCol: 2, seatNumber: 152, occupied: false }, { gridRow: 11, gridCol: 3, seatNumber: 153, occupied: false },
        { gridRow: 11, gridCol: 4, seatNumber: 154, occupied: false }, { gridRow: 11, gridCol: 5, seatNumber: 155, occupied: false }, { gridRow: 11, gridCol: 6, seatNumber: 156, occupied: false },
        { gridRow: 11, gridCol: 7, seatNumber: 157, occupied: false }, { gridRow: 12, gridCol: 1, seatNumber: 158, occupied: false }, { gridRow: 12, gridCol: 2, seatNumber: 159, occupied: false },{ gridRow: 12, gridCol: 3, seatNumber: 160, occupied: false }
      ]
    },
    description: 'ห้องสอบขยาย มีโปรเจคเตอร์',

  },
  {
    id: '17201',
    name: 'ห้องสอบที่ 4',
    roomNumber: '17201',
    totalSeats: 70,
    seatPattern: {
      type: 'custom',
      rows: 6, // Max grid row based on customLayout
      cols: 18, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 5, seatNumber: 161, occupied: false }, { gridRow: 1, gridCol: 6, seatNumber: 162, occupied: false }, { gridRow: 1, gridCol: 7, seatNumber: 163, occupied: false }, { gridRow: 1, gridCol: 8, seatNumber: 164, occupied: false },
        { gridRow: 1, gridCol: 10, seatNumber: 165, occupied: false }, { gridRow: 1, gridCol: 11, seatNumber: 166, occupied: false }, { gridRow: 1, gridCol: 12, seatNumber: 167, occupied: false }, { gridRow: 1, gridCol: 13, seatNumber: 168, occupied: false },
        
        { gridRow: 2, gridCol: 4, seatNumber: 169, occupied: false }, { gridRow: 2, gridCol: 5, seatNumber: 170, occupied: false }, { gridRow: 2, gridCol: 6, seatNumber: 171, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 172, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 173, occupied: false },
        { gridRow: 2, gridCol: 10, seatNumber: 174, occupied: false }, { gridRow: 2, gridCol: 11, seatNumber: 175, occupied: false }, { gridRow: 2, gridCol: 12, seatNumber: 176, occupied: false }, { gridRow: 2, gridCol: 13, seatNumber: 177, occupied: false }, { gridRow: 2, gridCol: 14, seatNumber: 178, occupied: false },
        
        { gridRow: 3, gridCol: 3, seatNumber: 179, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 180, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 181, occupied: false }, { gridRow: 3, gridCol: 6, seatNumber: 182, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 183, occupied: false }, { gridRow: 3, gridCol: 8, seatNumber: 184, occupied: false },
        { gridRow: 3, gridCol: 10, seatNumber: 185, occupied: false }, { gridRow: 3, gridCol: 11, seatNumber: 186, occupied: false }, { gridRow: 3, gridCol: 12, seatNumber: 187, occupied: false }, { gridRow: 3, gridCol: 13, seatNumber: 188, occupied: false }, { gridRow: 3, gridCol: 14, seatNumber: 189, occupied: false }, { gridRow: 3, gridCol: 15, seatNumber: 190, occupied: false },
        
        { gridRow: 4, gridCol: 2, seatNumber: 191, occupied: false }, { gridRow: 4, gridCol: 3, seatNumber: 192, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 193, occupied: false }, { gridRow: 4, gridCol: 5, seatNumber: 194, occupied: false }, { gridRow: 4, gridCol: 6, seatNumber: 195, occupied: false }, { gridRow: 4, gridCol: 7, seatNumber: 196, occupied: false }, { gridRow: 4, gridCol: 8, seatNumber: 197, occupied: false },
        { gridRow: 4, gridCol: 10, seatNumber: 198, occupied: false }, { gridRow: 4, gridCol: 11, seatNumber: 199, occupied: false }, { gridRow: 4, gridCol: 12, seatNumber: 200, occupied: false }, { gridRow: 4, gridCol: 13, seatNumber: 201, occupied: false }, { gridRow: 4, gridCol: 14, seatNumber: 202, occupied: false }, { gridRow: 4, gridCol: 15, seatNumber: 203, occupied: false }, { gridRow: 4, gridCol: 16, seatNumber: 204, occupied: false },
        
        { gridRow: 5, gridCol: 1, seatNumber: 205, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 206, occupied: false }, { gridRow: 5, gridCol: 3, seatNumber: 207, occupied: false }, { gridRow: 5, gridCol: 4, seatNumber: 208, occupied: false }, { gridRow: 5, gridCol: 5, seatNumber: 209, occupied: false }, { gridRow: 5, gridCol: 6, seatNumber: 210, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 211, occupied: false }, { gridRow: 5, gridCol: 8, seatNumber: 212, occupied: false },
        { gridRow: 5, gridCol: 10, seatNumber: 213, occupied: false }, { gridRow: 5, gridCol: 11, seatNumber: 214, occupied: false }, { gridRow: 5, gridCol: 12, seatNumber: 215, occupied: false }, { gridRow: 5, gridCol: 13, seatNumber: 216, occupied: false }, { gridRow: 5, gridCol: 14, seatNumber: 217, occupied: false }, { gridRow: 5, gridCol: 15, seatNumber: 218, occupied: false }, { gridRow: 5, gridCol: 16, seatNumber: 219, occupied: false }, { gridRow: 5, gridCol: 17, seatNumber: 220, occupied: false },
        
        { gridRow: 6, gridCol: 8, seatNumber: 221, occupied: false }, { gridRow: 6, gridCol: 10, seatNumber: 222, occupied: false }, { gridRow: 6, gridCol: 11, seatNumber: 223, occupied: false }, { gridRow: 6, gridCol: 12, seatNumber: 224, occupied: false }, { gridRow: 6, gridCol: 13, seatNumber: 225, occupied: false },
        { gridRow: 6, gridCol: 14, seatNumber: 226, occupied: false }, { gridRow: 6, gridCol: 15, seatNumber: 227, occupied: false }, { gridRow: 6, gridCol: 16, seatNumber: 228, occupied: false }, { gridRow: 6, gridCol: 17, seatNumber: 229, occupied: false }, { gridRow: 6, gridCol: 18, seatNumber: 230, occupied: false }
      ]
    },
    description: 'ห้องสอบใหญ่ ชั้น 2 มีโปรเจคเตอร์',

  },
  {
    id: '17205',
    name: 'ห้องสอบที่ 5',
    roomNumber: '17205',
    totalSeats: 40,
    seatPattern: {
      type: 'custom',
      rows: 6, // Max grid row based on customLayout
      cols: 9, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 6, seatNumber: 231, occupied: false }, { gridRow: 1, gridCol: 7, seatNumber: 232, occupied: false }, { gridRow: 1, gridCol: 8, seatNumber: 233, occupied: false }, { gridRow: 1, gridCol: 9, seatNumber: 234, occupied: false },
        { gridRow: 2, gridCol: 1, seatNumber: 235, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 236, occupied: false }, { gridRow: 2, gridCol: 3, seatNumber: 237, occupied: false }, { gridRow: 2, gridCol: 4, seatNumber: 238, occupied: false },
        { gridRow: 2, gridCol: 6, seatNumber: 239, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 240, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 241, occupied: false }, { gridRow: 2, gridCol: 9, seatNumber: 242, occupied: false },
        { gridRow: 3, gridCol: 1, seatNumber: 243, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 244, occupied: false }, { gridRow: 3, gridCol: 3, seatNumber: 245, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 246, occupied: false },
        { gridRow: 3, gridCol: 6, seatNumber: 247, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 248, occupied: false }, { gridRow: 3, gridCol: 8, seatNumber: 249, occupied: false }, { gridRow: 3, gridCol: 9, seatNumber: 250, occupied: false },
        { gridRow: 4, gridCol: 1, seatNumber: 251, occupied: false }, { gridRow: 4, gridCol: 2, seatNumber: 252, occupied: false }, { gridRow: 4, gridCol: 3, seatNumber: 253, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 254, occupied: false },
        { gridRow: 4, gridCol: 6, seatNumber: 255, occupied: false }, { gridRow: 4, gridCol: 7, seatNumber: 256, occupied: false }, { gridRow: 4, gridCol: 8, seatNumber: 257, occupied: false }, { gridRow: 4, gridCol: 9, seatNumber: 258, occupied: false },
        { gridRow: 5, gridCol: 1, seatNumber: 259, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 260, occupied: false }, { gridRow: 5, gridCol: 3, seatNumber: 261, occupied: false }, { gridRow: 5, gridCol: 4, seatNumber: 262, occupied: false },
        { gridRow: 5, gridCol: 6, seatNumber: 263, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 264, occupied: false }, { gridRow: 5, gridCol: 8, seatNumber: 265, occupied: false }, { gridRow: 5, gridCol: 9, seatNumber: 266, occupied: false },
        { gridRow: 6, gridCol: 1, seatNumber: 267, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 268, occupied: false }, { gridRow: 6, gridCol: 3, seatNumber: 269, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 270, occupied: false }
      ]
    },
    description: 'ห้องสอบเสริม ชั้น 2 มีโปรเจคเตอร์',

  },
  {
    id: '17212',
    name: 'ห้องสอบที่ 6',
    roomNumber: '17212',
    totalSeats: 52,
    seatPattern: {
      type: 'custom',
      rows: 9, // Max grid row based on customLayout
      cols: 8, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 1, seatNumber: 271, occupied: false }, { gridRow: 2, gridCol: 1, seatNumber: 272, occupied: false }, { gridRow: 3, gridCol: 1, seatNumber: 273, occupied: false },
        { gridRow: 4, gridCol: 1, seatNumber: 274, occupied: false }, { gridRow: 5, gridCol: 1, seatNumber: 275, occupied: false }, { gridRow: 6, gridCol: 1, seatNumber: 276, occupied: false },
        { gridRow: 7, gridCol: 1, seatNumber: 277, occupied: false }, { gridRow: 8, gridCol: 1, seatNumber: 278, occupied: false }, { gridRow: 9, gridCol: 1, seatNumber: 279, occupied: false },
        
        { gridRow: 1, gridCol: 2, seatNumber: 280, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 281, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 282, occupied: false },
        { gridRow: 4, gridCol: 2, seatNumber: 283, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 284, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 285, occupied: false },
        { gridRow: 7, gridCol: 2, seatNumber: 286, occupied: false }, { gridRow: 8, gridCol: 2, seatNumber: 287, occupied: false }, { gridRow: 9, gridCol: 2, seatNumber: 288, occupied: false },
        
        { gridRow: 2, gridCol: 4, seatNumber: 289, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 290, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 291, occupied: false },
        { gridRow: 5, gridCol: 4, seatNumber: 292, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 293, occupied: false }, { gridRow: 7, gridCol: 4, seatNumber: 294, occupied: false },
        { gridRow: 8, gridCol: 4, seatNumber: 295, occupied: false }, { gridRow: 9, gridCol: 4, seatNumber: 296, occupied: false },
        
        { gridRow: 2, gridCol: 5, seatNumber: 297, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 298, occupied: false }, { gridRow: 4, gridCol: 5, seatNumber: 299, occupied: false },
        { gridRow: 5, gridCol: 5, seatNumber: 300, occupied: false }, { gridRow: 6, gridCol: 5, seatNumber: 301, occupied: false }, { gridRow: 7, gridCol: 5, seatNumber: 302, occupied: false },
        { gridRow: 8, gridCol: 5, seatNumber: 303, occupied: false }, { gridRow: 9, gridCol: 5, seatNumber: 304, occupied: false },

        { gridRow: 1, gridCol: 7, seatNumber: 305, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 306, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 307, occupied: false },
        { gridRow: 4, gridCol: 7, seatNumber: 308, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 309, occupied: false }, { gridRow: 6, gridCol: 7, seatNumber: 310, occupied: false },
        { gridRow: 7, gridCol: 7, seatNumber: 311, occupied: false }, { gridRow: 8, gridCol: 7, seatNumber: 312, occupied: false }, { gridRow: 9, gridCol: 7, seatNumber: 313, occupied: false },
        { gridRow: 1, gridCol: 8, seatNumber: 314, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 315, occupied: false }, { gridRow: 3, gridCol: 8, seatNumber: 316, occupied: false },
        { gridRow: 4, gridCol: 8, seatNumber: 317, occupied: false }, { gridRow: 5, gridCol: 8, seatNumber: 318, occupied: false }, { gridRow: 6, gridCol: 8, seatNumber: 319, occupied: false },
        { gridRow: 7, gridCol: 8, seatNumber: 320, occupied: false }, { gridRow: 8, gridCol: 8, seatNumber: 321, occupied: false }, { gridRow: 9, gridCol: 8, seatNumber: 322, occupied: false }
      ]
    },
    description: 'ห้องสอบขยาย ชั้น 2 มีโปรเจคเตอร์',

  },
  {
    id: '17213',
    name: 'ห้องสอบที่ 7',
    roomNumber: '17213',
    totalSeats: 48,
    seatPattern: {
      type: 'custom',
      rows: 8, // Max grid row based on customLayout
      cols: 8, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 1, seatNumber: 323, occupied: false }, { gridRow: 2, gridCol: 1, seatNumber: 324, occupied: false }, { gridRow: 3, gridCol: 1, seatNumber: 325, occupied: false }, { gridRow: 4, gridCol: 1, seatNumber: 326, occupied: false },
        { gridRow: 5, gridCol: 1, seatNumber: 327, occupied: false }, { gridRow: 6, gridCol: 1, seatNumber: 328, occupied: false }, { gridRow: 7, gridCol: 1, seatNumber: 329, occupied: false }, { gridRow: 8, gridCol: 1, seatNumber: 330, occupied: false },
        { gridRow: 1, gridCol: 2, seatNumber: 331, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 332, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 333, occupied: false }, { gridRow: 4, gridCol: 2, seatNumber: 334, occupied: false },
        { gridRow: 5, gridCol: 2, seatNumber: 335, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 336, occupied: false }, { gridRow: 7, gridCol: 2, seatNumber: 337, occupied: false }, { gridRow: 8, gridCol: 2, seatNumber: 338, occupied: false },
        { gridRow: 1, gridCol: 4, seatNumber: 339, occupied: false }, { gridRow: 2, gridCol: 4, seatNumber: 340, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 341, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 342, occupied: false },
        { gridRow: 5, gridCol: 4, seatNumber: 343, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 344, occupied: false }, { gridRow: 7, gridCol: 4, seatNumber: 345, occupied: false }, { gridRow: 8, gridCol: 4, seatNumber: 346, occupied: false },
        { gridRow: 1, gridCol: 5, seatNumber: 347, occupied: false }, { gridRow: 2, gridCol: 5, seatNumber: 348, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 349, occupied: false }, { gridRow: 4, gridCol: 5, seatNumber: 350, occupied: false },
        { gridRow: 5, gridCol: 5, seatNumber: 351, occupied: false }, { gridRow: 6, gridCol: 5, seatNumber: 352, occupied: false }, { gridRow: 7, gridCol: 5, seatNumber: 353, occupied: false }, { gridRow: 8, gridCol: 5, seatNumber: 354, occupied: false },

        { gridRow: 1, gridCol: 7, seatNumber: 355, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 356, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 357, occupied: false }, { gridRow: 4, gridCol: 7, seatNumber: 358, occupied: false },
        { gridRow: 5, gridCol: 7, seatNumber: 359, occupied: false }, { gridRow: 6, gridCol: 7, seatNumber: 360, occupied: false }, { gridRow: 7, gridCol: 7, seatNumber: 361, occupied: false }, { gridRow: 8, gridCol: 7, seatNumber: 362, occupied: false },
        { gridRow: 1, gridCol: 8, seatNumber: 363, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 364, occupied: false }, { gridRow: 3, gridCol: 8, seatNumber: 365, occupied: false }, { gridRow: 4, gridCol: 8, seatNumber: 366, occupied: false },
        { gridRow: 5, gridCol: 8, seatNumber: 367, occupied: false }, { gridRow: 6, gridCol: 8, seatNumber: 368, occupied: false }, { gridRow: 7, gridCol: 8, seatNumber: 369, occupied: false }, { gridRow: 8, gridCol: 8, seatNumber: 370, occupied: false }
      ]
    },
    description: 'ห้องสอบเสริม ชั้น 2 มีโปรเจคเตอร์',

  }
];