// utils/seatArrangement.ts

import { ExaminerType, RoomDimensions, SeatingPattern } from '../types';

// ฟังก์ชันสำหรับสุ่มลำดับผู้เข้าสอบ (Fisher-Yates shuffle)
export const shuffleArray = (array: ExaminerType[]): ExaminerType[] => {
  const shuffled = [...array];
  let currentIndex = shuffled.length;
  let randomIndex: number;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [shuffled[currentIndex], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[currentIndex]];
  }
  return shuffled;
};

// ฟังก์ชันช่วยในการกำหนดผู้เข้าสอบลงที่นั่งในรูปแบบ 1D array
// (internal helper to assign examiners to a flat seat map)
const assignExaminersToFlatMap = (
  flatSeatMap: (ExaminerType | null)[],
  shuffledExaminers: ExaminerType[],
  positionsToFill: { r: number; c: number }[],
  roomCols: number
) => {
  let examinerIndex = 0;
  for (const pos of positionsToFill) {
    if (examinerIndex < shuffledExaminers.length) {
      const linearIndex = (pos.r * roomCols) + pos.c;
      if (linearIndex < flatSeatMap.length) { // ตรวจสอบว่าไม่ออกนอกขอบเขต
        flatSeatMap[linearIndex] = shuffledExaminers[examinerIndex];
        examinerIndex++;
      }
    } else {
      break; // ไม่เหลือผู้เข้าสอบให้จัดแล้ว
    }
  }
};


// --- ฟังก์ชันจัดที่นั่งแต่ละรูปแบบ ---

// ฟังก์ชันจัดที่นั่งแบบแถวเดี่ยว
const arrangeSingleRow = (
  shuffledExaminers: ExaminerType[],
  roomDimensions: RoomDimensions,
  totalSeats: number
): (ExaminerType | null)[] => {
  const flatSeatMap: (ExaminerType | null)[] = Array(totalSeats).fill(null);
  const positionsToFill: { r: number; c: number }[] = [];

  for (let r = 0; r < roomDimensions.rows; r++) {
    for (let c = 0; c < roomDimensions.cols; c++) {
      // จัดแถวเดี่ยว เว้นระยะห่าง (นั่งที่คอลัมน์คู่: 0, 2, 4...)
      if (c % 2 === 0) {
        positionsToFill.push({ r, c });
      }
    }
  }
  assignExaminersToFlatMap(flatSeatMap, shuffledExaminers, positionsToFill, roomDimensions.cols);
  return flatSeatMap;
};

// ฟังก์ชันจัดที่นั่งแบบสลับฟันปลา
const arrangeZigzag = (
  shuffledExaminers: ExaminerType[],
  roomDimensions: RoomDimensions,
  totalSeats: number
): (ExaminerType | null)[] => {
  const flatSeatMap: (ExaminerType | null)[] = Array(totalSeats).fill(null);
  const positionsToFill: { r: number; c: number }[] = [];

  for (let r = 0; r < roomDimensions.rows; r++) {
    for (let c = 0; c < roomDimensions.cols; c++) {
      const isEvenRow = r % 2 === 0;
      const isEvenCol = c % 2 === 0;

      // ในแถวคู่ (0, 2, ...): นั่งที่คอลัมน์คู่ (0, 2, ...)
      // ในแถวคี่ (1, 3, ...): นั่งที่คอลัมน์คี่ (1, 3, ...)
      if ((isEvenRow && isEvenCol) || (!isEvenRow && !isEvenCol)) {
        positionsToFill.push({ r, c });
      }
    }
  }
  assignExaminersToFlatMap(flatSeatMap, shuffledExaminers, positionsToFill, roomDimensions.cols);
  return flatSeatMap;
};

// ฟังก์ชันจัดที่นั่งแบบหมากรุกดำ (Checkerboard)
const arrangeCheckerboard = (
  shuffledExaminers: ExaminerType[],
  roomDimensions: RoomDimensions,
  totalSeats: number
): (ExaminerType | null)[] => {
  const flatSeatMap: (ExaminerType | null)[] = Array(totalSeats).fill(null);
  const positionsToFill: { r: number; c: number }[] = [];

  for (let r = 0; r < roomDimensions.rows; r++) {
    for (let c = 0; c < roomDimensions.cols; c++) {
      // นั่งเฉพาะที่ช่อง (row + col) เป็นเลขคู่ (หรือเลขคี่ ขึ้นอยู่กับว่าอยากเริ่มจากไหน)
      // นี่คือรูปแบบที่ทำให้เกิดช่องว่างสลับฟันปลา
      if ((r + c) % 2 === 0) { // สามารถเปลี่ยนเป็น % 2 !== 0 เพื่อสลับตำแหน่งได้
        positionsToFill.push({ r, c });
      }
    }
  }
  assignExaminersToFlatMap(flatSeatMap, shuffledExaminers, positionsToFill, roomDimensions.cols);
  return flatSeatMap;
};

// ฟังก์ชันจัดที่นั่งแบบแนวทแยง (Diagonal)
const arrangeDiagonal = (
  shuffledExaminers: ExaminerType[],
  roomDimensions: RoomDimensions,
  totalSeats: number
): (ExaminerType | null)[] => {
  const flatSeatMap: (ExaminerType | null)[] = Array(totalSeats).fill(null);
  const positionsToFill: { r: number; c: number }[] = [];

  // วนลูปตามแนวทแยง โดยใช้ผลรวมของ r + c
  // sum จะเริ่มจาก 0 (สำหรับ (0,0)) ไปจนถึง (rows-1) + (cols-1)
  for (let sum = 0; sum < roomDimensions.rows + roomDimensions.cols - 1; sum++) {
    // วนลูปสำหรับแต่ละแถวในแนวทแยงปัจจุบัน
    for (let r = 0; r < roomDimensions.rows; r++) {
      const c = sum - r; // คำนวณคอลัมน์ที่ตรงกับแนวทแยงปัจจุบัน
      if (c >= 0 && c < roomDimensions.cols) { // ตรวจสอบว่าอยู่ในขอบเขตของห้อง
        positionsToFill.push({ r, c });
      }
    }
  }
  assignExaminersToFlatMap(flatSeatMap, shuffledExaminers, positionsToFill, roomDimensions.cols);
  return flatSeatMap;
};

// ฟังก์ชันจัดที่นั่งแบบเกลียวหอย (Spiral)
const arrangeSpiral = (
  shuffledExaminers: ExaminerType[],
  roomDimensions: RoomDimensions,
  totalSeats: number
): (ExaminerType | null)[] => {
  const flatSeatMap: (ExaminerType | null)[] = Array(totalSeats).fill(null);
  const positionsToFill: { r: number; c: number }[] = [];

  let top = 0, bottom = roomDimensions.rows - 1;
  let left = 0, right = roomDimensions.cols - 1;

  let dir = 0; // 0: right, 1: down, 2: left, 3: up

  while (top <= bottom && left <= right) {
    if (dir === 0) { // ไปทางขวา
      for (let c = left; c <= right; c++) positionsToFill.push({ r: top, c: c });
      top++;
    } else if (dir === 1) { // ลงล่าง
      for (let r = top; r <= bottom; r++) positionsToFill.push({ r: r, c: right });
      right--;
    } else if (dir === 2) { // ไปทางซ้าย
      for (let c = right; c >= left; c--) positionsToFill.push({ r: bottom, c: c });
      bottom--;
    } else if (dir === 3) { // ขึ้นบน
      for (let r = bottom; r >= top; r--) positionsToFill.push({ r: r, c: left });
      left++;
    }
    dir = (dir + 1) % 4; // เปลี่ยนทิศทาง
  }
  assignExaminersToFlatMap(flatSeatMap, shuffledExaminers, positionsToFill, roomDimensions.cols);
  return flatSeatMap;
};

// ฟังก์ชันจัดที่นั่งแบบสุ่ม (Random)
const arrangeRandom = (
  shuffledExaminers: ExaminerType[],
  roomDimensions: RoomDimensions,
  totalSeats: number
): (ExaminerType | null)[] => {
  const flatSeatMap: (ExaminerType | null)[] = Array(totalSeats).fill(null);
  const allPositions: { r: number; c: number }[] = [];

  // สร้างลิสต์ของตำแหน่งที่นั่งทั้งหมด
  for (let r = 0; r < roomDimensions.rows; r++) {
    for (let c = 0; c < roomDimensions.cols; c++) {
      allPositions.push({ r, c });
    }
  }

  // สุ่มสลับตำแหน่งทั้งหมด (ใช้ shuffleArray ที่มีอยู่แล้ว)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shuffledPositions = shuffleArray(allPositions as any) as unknown as { r: number; c: number }[]; // Type assertion เนื่องจาก shuffleArray ถูกออกแบบมาสำหรับ ExaminerType

  assignExaminersToFlatMap(flatSeatMap, shuffledExaminers, shuffledPositions, roomDimensions.cols);
  return flatSeatMap;
};


// ฟังก์ชันแปลง seatMap (1D array) เป็น 2D array สำหรับการแสดงผล
const convertTo2DArray = (
  flatSeatMap: (ExaminerType | null)[],
  roomDimensions: RoomDimensions
): (ExaminerType | null)[][] => {
  const finalArrangement: (ExaminerType | null)[][] = [];

  for (let r = 0; r < roomDimensions.rows; r++) {
    const rowSeats: (ExaminerType | null)[] = [];
    for (let c = 0; c < roomDimensions.cols; c++) {
      const index = (r * roomDimensions.cols) + c;
      rowSeats.push(index < flatSeatMap.length ? flatSeatMap[index] : null); // ป้องกัน index เกิน
    }
    finalArrangement.push(rowSeats);
  }
  return finalArrangement;
};

// --- ฟังก์ชันหลักสำหรับจัดที่นั่ง (เรียกใช้จากภายนอก) ---
export const arrangeSeats = (
  examiners: ExaminerType[],
  seatingPattern: SeatingPattern,
  roomDimensions: RoomDimensions
): (ExaminerType | null)[][] => {
  // ตรวจสอบเงื่อนไขเบื้องต้น
  if (!examiners || examiners.length === 0) {
    // ไม่มีผู้เข้าสอบ ให้คืนผังที่นั่งว่างเปล่า
    return Array(roomDimensions.rows).fill(null).map(() => Array(roomDimensions.cols).fill(null));
  }
  if (roomDimensions.rows <= 0 || roomDimensions.cols <= 0) {
    // ขนาดห้องไม่ถูกต้อง ให้คืนผังที่นั่งว่างเปล่า
    return [];
  }

  const shuffledExaminers = shuffleArray(examiners);
  const totalSeats = roomDimensions.rows * roomDimensions.cols;

  let flatSeatMap: (ExaminerType | null)[];

  switch (seatingPattern) {
    case 'single_row':
      flatSeatMap = arrangeSingleRow(shuffledExaminers, roomDimensions, totalSeats);
      break;
    case 'zigzag':
      flatSeatMap = arrangeZigzag(shuffledExaminers, roomDimensions, totalSeats);
      break;
    case 'checkerboard':
      flatSeatMap = arrangeCheckerboard(shuffledExaminers, roomDimensions, totalSeats);
      break;
    case 'diagonal':
      flatSeatMap = arrangeDiagonal(shuffledExaminers, roomDimensions, totalSeats);
      break;
    case 'spiral':
      flatSeatMap = arrangeSpiral(shuffledExaminers, roomDimensions, totalSeats);
      break;
    case 'random':
      flatSeatMap = arrangeRandom(shuffledExaminers, roomDimensions, totalSeats);
      break;
    default:
      console.warn('Unknown seating pattern:', seatingPattern);
      // หากไม่รู้จักรูปแบบ ให้ใช้ Single Row เป็นค่าเริ่มต้น
      flatSeatMap = arrangeSingleRow(shuffledExaminers, roomDimensions, totalSeats);
      break;
  }

  return convertTo2DArray(flatSeatMap, roomDimensions);
};