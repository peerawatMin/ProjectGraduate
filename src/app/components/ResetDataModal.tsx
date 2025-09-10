/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface ResetDataModalProps {
  onResetSuccess: () => void; // callback อัปเดตข้อมูลในหน้าแม่
}

const ResetDataModal: React.FC<ResetDataModalProps> = ({ onResetSuccess }) => {
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showProgressCard, setShowProgressCard] = useState(false);
  const [progressValue, setProgressValue] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const handleResetData = async () => {
    setShowConfirmCard(false);
    setLoading(true);
    setErrorMessage('');
    setShowProgressCard(true);
    setProgressValue(0);
    setProgressMessage('กำลังรีเซ็ตข้อมูล...');

    try {
      const { error } = await supabase.rpc('reset_examiner_data');
      if (error) throw error;

      setProgressValue(100);
      setProgressMessage('รีเซ็ตสำเร็จ!');

      // เรียก callback ให้หน้าแม่อัปเดต state
      onResetSuccess();

      alert('รีเซ็ตข้อมูลและ ID เริ่มที่ 1 สำเร็จแล้ว');
    } catch (err: any) {
      const msg =
        typeof err === 'object' && err !== null
          ? err.message || JSON.stringify(err)
          : String(err);

      console.error('รีเซ็ตล้มเหลว:', err);
      setErrorMessage(`เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล: ${msg}`);
    } finally {
      setTimeout(() => setShowProgressCard(false), 1500);
      setLoading(false);
    }
  };

  return (
    <div className="relative mb-4">
      <motion.button
        onClick={() => setShowConfirmCard(true)}
        whileHover={{ y: 5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)" }}
        className="px-4 py-2 bg-red-500 text-white rounded-lg transition-transform"
      >
        รีเซ็ตข้อมูล
      </motion.button>

      <AnimatePresence>
        {showConfirmCard && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 w-80 sm:w-96 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-lg font-semibold mb-4">ยืนยันการรีเซ็ตข้อมูล</h2>
              <p className="mb-6">
                คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมด? <br />
                ข้อมูลทั้งหมดจะถูกลบ และรหัสผู้เข้าสอบจะเริ่มนับใหม่จาก 1
              </p>

              <div className="flex justify-center gap-4">
                <motion.button
                  onClick={handleResetData}
                  whileHover={{ y: -3, boxShadow: "0 8px 15px rgba(0,0,0,0.3)" }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg transition-transform"
                >
                  รีเซ็ต
                </motion.button>
                <motion.button
                  onClick={() => setShowConfirmCard(false)}
                  whileHover={{ y: -3, boxShadow: "0 8px 15px rgba(0,0,0,0.2)" }}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg transition-transform"
                >
                  ยกเลิก
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResetDataModal;
