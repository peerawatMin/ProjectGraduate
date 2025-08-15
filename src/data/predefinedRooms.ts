// src/data/predefinedRooms.ts (หรือในไฟล์ที่คุณเก็บ PREDEFINED_ROOMS)
// import { ExamRoom, SeatPosition } from '../types/examTypes'; // อาจต้องนำเข้า type

import { ExamRoom } from '../types/examTypes';

export const PREDEFINED_ROOMS: ExamRoom[] = [
  {
    id: '001',
    name: 'รูปแบบที่ 1',
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
    id: '002',
    name: 'รูปแบบที่ 2',
    roomNumber: '17201',
    totalSeats: 78,
    seatPattern: {
      type: 'custom',
      rows: 6, // Max grid row based on customLayout
      cols: 19, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 6, seatNumber: 1, occupied: false }, { gridRow: 1, gridCol: 7, seatNumber: 2, occupied: false }, { gridRow: 1, gridCol: 8, seatNumber: 3, occupied: false }, { gridRow: 1, gridCol: 9, seatNumber: 4, occupied: false },
        { gridRow: 1, gridCol: 11, seatNumber: 5, occupied: false }, { gridRow: 1, gridCol: 12, seatNumber: 6, occupied: false }, { gridRow: 1, gridCol: 13, seatNumber: 7, occupied: false }, { gridRow: 1, gridCol: 14, seatNumber: 8, occupied: false },
        
        { gridRow: 2, gridCol: 5, seatNumber: 9, occupied: false }, { gridRow: 2, gridCol: 6, seatNumber: 10, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 11, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 12, occupied: false }, 
        { gridRow: 2, gridCol: 9, seatNumber: 13, occupied: false },{ gridRow: 2, gridCol: 11, seatNumber: 14, occupied: false }, { gridRow: 2, gridCol: 12, seatNumber: 15, occupied: false }, { gridRow: 2, gridCol: 13, seatNumber: 16, occupied: false }, 
        { gridRow: 2, gridCol: 14, seatNumber: 177, occupied: false }, { gridRow: 2, gridCol: 15, seatNumber: 18, occupied: false },
        
        { gridRow: 3, gridCol: 4, seatNumber: 19, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 20, occupied: false }, { gridRow: 3, gridCol: 6, seatNumber: 21, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 22, occupied: false }, 
        { gridRow: 3, gridCol: 8, seatNumber: 23, occupied: false }, { gridRow: 3, gridCol: 9, seatNumber: 24, occupied: false }, { gridRow: 3, gridCol: 11, seatNumber: 25, occupied: false }, { gridRow: 3, gridCol: 12, seatNumber: 26, occupied: false }, 
        { gridRow: 3, gridCol: 13, seatNumber: 27, occupied: false }, { gridRow: 3, gridCol: 14, seatNumber: 28, occupied: false }, { gridRow: 3, gridCol: 15, seatNumber: 29, occupied: false }, { gridRow: 3, gridCol: 16, seatNumber: 30, occupied: false },
        
        { gridRow: 4, gridCol: 3, seatNumber: 31, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 32, occupied: false }, { gridRow: 4, gridCol: 5, seatNumber: 33, occupied: false }, { gridRow: 4, gridCol: 6, seatNumber: 34, occupied: false }, 
        { gridRow: 4, gridCol: 7, seatNumber: 35, occupied: false }, { gridRow: 4, gridCol: 8, seatNumber: 36, occupied: false }, { gridRow: 4, gridCol: 9, seatNumber: 37, occupied: false },{ gridRow: 4, gridCol: 11, seatNumber: 38, occupied: false }, 
        { gridRow: 4, gridCol: 12, seatNumber: 39, occupied: false }, { gridRow: 4, gridCol: 13, seatNumber: 40, occupied: false }, { gridRow: 4, gridCol: 14, seatNumber: 41, occupied: false }, { gridRow: 4, gridCol: 15, seatNumber: 42, occupied: false }, 
        { gridRow: 4, gridCol: 16, seatNumber: 43, occupied: false }, { gridRow: 4, gridCol: 17, seatNumber: 44, occupied: false },
        
        { gridRow: 5, gridCol: 2, seatNumber: 45, occupied: false }, { gridRow: 5, gridCol: 3, seatNumber: 46, occupied: false }, { gridRow: 5, gridCol: 4, seatNumber: 47, occupied: false }, { gridRow: 5, gridCol: 5, seatNumber: 48, occupied: false }, 
        { gridRow: 5, gridCol: 6, seatNumber: 49, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 50, occupied: false }, { gridRow: 5, gridCol: 8, seatNumber: 51, occupied: false }, { gridRow: 5, gridCol: 9, seatNumber: 52, occupied: false },
        { gridRow: 5, gridCol: 11, seatNumber: 53, occupied: false }, { gridRow: 5, gridCol: 12, seatNumber: 54, occupied: false }, { gridRow: 5, gridCol: 13, seatNumber: 55, occupied: false }, { gridRow: 5, gridCol: 14, seatNumber: 56, occupied: false }, 
        { gridRow: 5, gridCol: 15, seatNumber: 57, occupied: false }, { gridRow: 5, gridCol: 16, seatNumber: 58, occupied: false }, { gridRow: 5, gridCol: 17, seatNumber: 59, occupied: false }, { gridRow: 5, gridCol: 18, seatNumber: 60, occupied: false },
        
        { gridRow: 6, gridCol: 1, seatNumber: 61, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 62, occupied: false }, { gridRow: 6, gridCol: 3, seatNumber: 63, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 64, occupied: false }, 
        { gridRow: 6, gridCol: 5, seatNumber: 65, occupied: false }, { gridRow: 6, gridCol: 6, seatNumber: 66, occupied: false },{ gridRow: 6, gridCol: 7, seatNumber: 67, occupied: false }, { gridRow: 6, gridCol: 8, seatNumber: 68, occupied: false }, 
        { gridRow: 6, gridCol: 9, seatNumber: 69, occupied: false }, { gridRow: 6, gridCol: 11, seatNumber: 70, occupied: false }, { gridRow: 6, gridCol: 12, seatNumber: 71, occupied: false },
        { gridRow: 6, gridCol: 13, seatNumber: 72, occupied: false }, { gridRow: 6, gridCol: 14, seatNumber: 73, occupied: false },{ gridRow: 6, gridCol: 15, seatNumber: 74, occupied: false }, { gridRow: 6, gridCol: 16, seatNumber: 75, occupied: false }, 
        { gridRow: 6, gridCol: 17, seatNumber: 76, occupied: false }, { gridRow: 6, gridCol: 18, seatNumber: 77, occupied: false }, { gridRow: 6, gridCol: 19, seatNumber: 78, occupied: false }
      ]
    },
    description: 'ห้องสอบใหญ่ ชั้น 2 มีโปรเจคเตอร์',

  },
  {
    id: '003',
    name: 'รูปแบบที่ 3',
    roomNumber: '17205',
    totalSeats: 40,
    seatPattern: {
      type: 'custom',
      rows: 6, // Max grid row based on customLayout
      cols: 9, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 6, seatNumber: 1, occupied: false }, { gridRow: 1, gridCol: 7, seatNumber: 2, occupied: false }, { gridRow: 1, gridCol: 8, seatNumber: 3, occupied: false }, { gridRow: 1, gridCol: 9, seatNumber: 4, occupied: false },
        { gridRow: 2, gridCol: 1, seatNumber: 5, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 6, occupied: false }, { gridRow: 2, gridCol: 3, seatNumber: 7, occupied: false }, { gridRow: 2, gridCol: 4, seatNumber: 8, occupied: false },
        { gridRow: 2, gridCol: 6, seatNumber: 9, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 10, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 11, occupied: false }, { gridRow: 2, gridCol: 9, seatNumber: 12, occupied: false },
        { gridRow: 3, gridCol: 1, seatNumber: 13, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 14, occupied: false }, { gridRow: 3, gridCol: 3, seatNumber: 15, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 16, occupied: false },
        { gridRow: 3, gridCol: 6, seatNumber: 17, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 18, occupied: false }, { gridRow: 3, gridCol: 8, seatNumber: 19, occupied: false }, { gridRow: 3, gridCol: 9, seatNumber: 20, occupied: false },
        { gridRow: 4, gridCol: 1, seatNumber: 21, occupied: false }, { gridRow: 4, gridCol: 2, seatNumber: 22, occupied: false }, { gridRow: 4, gridCol: 3, seatNumber: 23, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 24, occupied: false },
        { gridRow: 4, gridCol: 6, seatNumber: 25, occupied: false }, { gridRow: 4, gridCol: 7, seatNumber: 26, occupied: false }, { gridRow: 4, gridCol: 8, seatNumber: 27, occupied: false }, { gridRow: 4, gridCol: 9, seatNumber: 28, occupied: false },
        { gridRow: 5, gridCol: 1, seatNumber: 29, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 30, occupied: false }, { gridRow: 5, gridCol: 3, seatNumber: 31, occupied: false }, { gridRow: 5, gridCol: 4, seatNumber: 32, occupied: false },
        { gridRow: 5, gridCol: 6, seatNumber: 33, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 34, occupied: false }, { gridRow: 5, gridCol: 8, seatNumber: 35, occupied: false }, { gridRow: 5, gridCol: 9, seatNumber: 36, occupied: false },
        { gridRow: 6, gridCol: 1, seatNumber: 37, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 38, occupied: false }, { gridRow: 6, gridCol: 3, seatNumber: 39, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 40, occupied: false }
      ]
    },
    description: 'ห้องสอบเสริม ชั้น 2 มีโปรเจคเตอร์',

  },
  {
    id: '004',
    name: 'รูปแบบที่ 4',
    roomNumber: '17212',
    totalSeats: 52,
    seatPattern: {
      type: 'custom',
      rows: 9, // Max grid row based on customLayout
      cols: 8, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 1, seatNumber: 1, occupied: false }, { gridRow: 2, gridCol: 1, seatNumber: 2, occupied: false }, { gridRow: 3, gridCol: 1, seatNumber: 3, occupied: false },
        { gridRow: 4, gridCol: 1, seatNumber: 4, occupied: false }, { gridRow: 5, gridCol: 1, seatNumber: 5, occupied: false }, { gridRow: 6, gridCol: 1, seatNumber: 6, occupied: false },
        { gridRow: 7, gridCol: 1, seatNumber: 7, occupied: false }, { gridRow: 8, gridCol: 1, seatNumber: 8, occupied: false }, { gridRow: 9, gridCol: 1, seatNumber: 9, occupied: false },
        
        { gridRow: 1, gridCol: 2, seatNumber: 10, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 11, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 12, occupied: false },
        { gridRow: 4, gridCol: 2, seatNumber: 13, occupied: false }, { gridRow: 5, gridCol: 2, seatNumber: 14, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 15, occupied: false },
        { gridRow: 7, gridCol: 2, seatNumber: 16, occupied: false }, { gridRow: 8, gridCol: 2, seatNumber: 17, occupied: false }, { gridRow: 9, gridCol: 2, seatNumber: 18, occupied: false },
        
        { gridRow: 2, gridCol: 4, seatNumber: 19, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 20, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 21, occupied: false },
        { gridRow: 5, gridCol: 4, seatNumber: 22, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 23, occupied: false }, { gridRow: 7, gridCol: 4, seatNumber: 24, occupied: false },
        { gridRow: 8, gridCol: 4, seatNumber: 25, occupied: false }, { gridRow: 9, gridCol: 4, seatNumber: 26, occupied: false },
        
        { gridRow: 2, gridCol: 5, seatNumber: 27, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 28, occupied: false }, { gridRow: 4, gridCol: 5, seatNumber: 29, occupied: false },
        { gridRow: 5, gridCol: 5, seatNumber: 30, occupied: false }, { gridRow: 6, gridCol: 5, seatNumber: 31, occupied: false }, { gridRow: 7, gridCol: 5, seatNumber: 32, occupied: false },
        { gridRow: 8, gridCol: 5, seatNumber: 33, occupied: false }, { gridRow: 9, gridCol: 5, seatNumber: 34, occupied: false },

        { gridRow: 1, gridCol: 7, seatNumber: 35, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 36, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 37, occupied: false },
        { gridRow: 4, gridCol: 7, seatNumber: 38, occupied: false }, { gridRow: 5, gridCol: 7, seatNumber: 39, occupied: false }, { gridRow: 6, gridCol: 7, seatNumber: 310, occupied: false },
        { gridRow: 7, gridCol: 7, seatNumber: 41, occupied: false }, { gridRow: 8, gridCol: 7, seatNumber: 42, occupied: false }, { gridRow: 9, gridCol: 7, seatNumber: 43, occupied: false },
        { gridRow: 1, gridCol: 8, seatNumber: 44, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 45, occupied: false }, { gridRow: 3, gridCol: 8, seatNumber: 46, occupied: false },
        { gridRow: 4, gridCol: 8, seatNumber: 47, occupied: false }, { gridRow: 5, gridCol: 8, seatNumber: 48, occupied: false }, { gridRow: 6, gridCol: 8, seatNumber: 49, occupied: false },
        { gridRow: 7, gridCol: 8, seatNumber: 50, occupied: false }, { gridRow: 8, gridCol: 8, seatNumber: 51, occupied: false }, { gridRow: 9, gridCol: 8, seatNumber: 52, occupied: false }
      ]
    },
    description: 'ห้องสอบขยาย ชั้น 2 มีโปรเจคเตอร์',

  },
  {
    id: '005',
    name: 'รูปแบบที่ 5',
    roomNumber: '17213',
    totalSeats: 48,
    seatPattern: {
      type: 'custom',
      rows: 8, // Max grid row based on customLayout
      cols: 8, // Max grid col based on customLayout
      customLayout: [
        { gridRow: 1, gridCol: 1, seatNumber: 1, occupied: false }, { gridRow: 2, gridCol: 1, seatNumber: 2, occupied: false }, { gridRow: 3, gridCol: 1, seatNumber: 3, occupied: false }, { gridRow: 4, gridCol: 1, seatNumber: 4, occupied: false },
        { gridRow: 5, gridCol: 1, seatNumber: 5, occupied: false }, { gridRow: 6, gridCol: 1, seatNumber: 6, occupied: false }, { gridRow: 7, gridCol: 1, seatNumber: 7, occupied: false }, { gridRow: 8, gridCol: 1, seatNumber: 8, occupied: false },
        { gridRow: 1, gridCol: 2, seatNumber: 9, occupied: false }, { gridRow: 2, gridCol: 2, seatNumber: 10, occupied: false }, { gridRow: 3, gridCol: 2, seatNumber: 11, occupied: false }, { gridRow: 4, gridCol: 2, seatNumber: 12, occupied: false },
        { gridRow: 5, gridCol: 2, seatNumber: 13, occupied: false }, { gridRow: 6, gridCol: 2, seatNumber: 14, occupied: false }, { gridRow: 7, gridCol: 2, seatNumber: 15, occupied: false }, { gridRow: 8, gridCol: 2, seatNumber: 16, occupied: false },
        { gridRow: 1, gridCol: 4, seatNumber: 17, occupied: false }, { gridRow: 2, gridCol: 4, seatNumber: 18, occupied: false }, { gridRow: 3, gridCol: 4, seatNumber: 19, occupied: false }, { gridRow: 4, gridCol: 4, seatNumber: 20, occupied: false },
        { gridRow: 5, gridCol: 4, seatNumber: 21, occupied: false }, { gridRow: 6, gridCol: 4, seatNumber: 22, occupied: false }, { gridRow: 7, gridCol: 4, seatNumber: 23, occupied: false }, { gridRow: 8, gridCol: 4, seatNumber: 24, occupied: false },
        { gridRow: 1, gridCol: 5, seatNumber: 25, occupied: false }, { gridRow: 2, gridCol: 5, seatNumber: 26, occupied: false }, { gridRow: 3, gridCol: 5, seatNumber: 27, occupied: false }, { gridRow: 4, gridCol: 5, seatNumber: 28, occupied: false },
        { gridRow: 5, gridCol: 5, seatNumber: 29, occupied: false }, { gridRow: 6, gridCol: 5, seatNumber: 30, occupied: false }, { gridRow: 7, gridCol: 5, seatNumber: 31, occupied: false }, { gridRow: 8, gridCol: 5, seatNumber: 32, occupied: false },

        { gridRow: 1, gridCol: 7, seatNumber: 33, occupied: false }, { gridRow: 2, gridCol: 7, seatNumber: 34, occupied: false }, { gridRow: 3, gridCol: 7, seatNumber: 35, occupied: false }, { gridRow: 4, gridCol: 7, seatNumber: 36, occupied: false },
        { gridRow: 5, gridCol: 7, seatNumber: 37, occupied: false }, { gridRow: 6, gridCol: 7, seatNumber: 38, occupied: false }, { gridRow: 7, gridCol: 7, seatNumber: 39, occupied: false }, { gridRow: 8, gridCol: 7, seatNumber: 40, occupied: false },
        { gridRow: 1, gridCol: 8, seatNumber: 41, occupied: false }, { gridRow: 2, gridCol: 8, seatNumber: 42, occupied: false }, { gridRow: 3, gridCol: 8, seatNumber: 43, occupied: false }, { gridRow: 4, gridCol: 8, seatNumber: 44, occupied: false },
        { gridRow: 5, gridCol: 8, seatNumber: 45, occupied: false }, { gridRow: 6, gridCol: 8, seatNumber: 46, occupied: false }, { gridRow: 7, gridCol: 8, seatNumber: 47, occupied: false }, { gridRow: 8, gridCol: 8, seatNumber: 48, occupied: false }
      ]
    },
    description: 'ห้องสอบเสริม ชั้น 2 มีโปรเจคเตอร์',

  }
];