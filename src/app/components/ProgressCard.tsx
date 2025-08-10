// components/ProgressCard.tsx
import React from 'react';
import { motion } from 'framer-motion';

type ProgressCardProps = {
    progress: number; // 0-100%
    message: string; // ข้อความบอกสถานะ เช่น "กำลังนำเข้า...", "กำลังส่งออก..."
    // ลบ characterSrc ออก
    // onClose?: () => void; // ฟังก์ชันเรียกเมื่อต้องการปิดการ์ด (เช่นเมื่อเสร็จสมบูรณ์)
};

export default function ProgressCard({ progress, message }: ProgressCardProps) {
    // กำหนดสีของแถบตามความคืบหน้า (ตัวอย่าง: ฟ้าสำหรับ import, เขียวสำหรับ export)
    const progressBarColor = message.includes('นำเข้า') ? 'bg-blue-500' : 'bg-green-500';
    // const progressBgColor = message.includes('นำเข้า') ? 'bg-blue-200' : 'bg-green-200'; // ไม่ได้ใช้แล้ว
    const textColor = message.includes('นำเข้า') ? 'text-blue-700' : 'text-green-700';

    return (
        <div className="fixed inset-0 bg-transparent backdrop-blur-2xl bg-opacity-75 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm text-center"
            >
                {/* ลบส่วนของตัวการ์ตูนออก */}
                
                <h3 className={`text-xl font-semibold mb-4 ${textColor}`}>{message}</h3>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2 relative">
                    <div
                        className={`${progressBarColor} h-2.5 rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <p className={`text-sm font-medium ${textColor}`}>{Math.round(progress)}%</p>
            </motion.div>
        </div>
    );
}