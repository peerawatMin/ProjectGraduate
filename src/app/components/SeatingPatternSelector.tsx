// components/SeatingPatternSelector.tsx
'use client'

import React from 'react';

type SeatingPattern = 
  | 'single_row'      // แถวเดี่ยว
  | 'zigzag'          // สลับฟันปลา
  | 'checkerboard'    // หมากรุกดำ
  | 'diagonal'        // แนวทแยง
  | 'spiral'          // เกลียวหอย
  | 'random';         // สุ่ม

interface SeatingPatternSelectorProps {
  seatingPattern: SeatingPattern;
  onSeatingPatternChange: (pattern: SeatingPattern) => void;
}

const patternOptions: Array<{
  value: SeatingPattern;
  label: string;
  description: string;
  image:string
}> = [
  { value: 'single_row', label: 'แถวเดี่ยว', description: 'จัดแถวเดี่ยว เว้นระยะห่าง', image:'/single-row.png' },
  { value: 'zigzag', label: 'สลับฟันปลา', description: 'แถวคู่-คี่ เยื้องซ้าย-ขวา', image:'/zigzag.png' },
  { value: 'checkerboard', label: 'หมากรุกดำ', description: 'เว้นเป็นช่องสี่เหลี่ยม', image:'/game.png' },
  { value: 'diagonal', label: 'แนวทแยง', description: 'จัดเรียงแนวทแยงมุม', image:'/stripes.png' },
  { value: 'spiral', label: 'เกลียวหอย', description: 'จัดเป็นรูปเกลียว', image:'/spring.png' },
  { value: 'random', label: 'สุ่ม', description: 'สุ่มตำแหน่งที่นั่ง', image:'/dice.png' }
];

export default function SeatingPatternSelector({
  seatingPattern,
  onSeatingPatternChange
}: SeatingPatternSelectorProps) {
  return (
    <div className="bg-linear-to-r from-sky-600 to-indigo-800 w-[550px] h-fit rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-semibold text-center text-white mb-4">รูปแบบการจัดที่นั่งสอบ</h2>
      <div className=" grid grid-cols-1 md:grid-cols-2 gap-4">
        {patternOptions.map((option) => (
          <label 
            key={option.value}
            className="flex flex-col p-2 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 hover:border-yellow-300"
            style={{
              borderColor: seatingPattern === option.value ? '#eb1010' : '#E5E7EB',
              backgroundColor: seatingPattern === option.value ? '#dba118' : '#3aa15e'
            }}
          >
            <div className="flex p-1 items-center mb-2">
              <input
                type="radio"
                value={option.value}
                checked={seatingPattern === option.value}
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onChange={(e) => onSeatingPatternChange(option.value)}
                className="mr-3 h-4 w-4 text-blue-600"
              />
              <img src={option.image} alt="" className='mx-2' />
              <h3 className='text-center text-white' >{option.label}</h3>
            </div>
            <span className='text-center text-gray-200'>{option.description}</span>
          </label>
        ))}
      </div>
    </div>
  );
}