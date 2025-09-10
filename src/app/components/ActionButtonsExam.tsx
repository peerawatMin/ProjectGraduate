// components/ActionButtonsExam.tsx
import { FileDown, FileUp, RotateCcw, Search } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import SearchExaminerModal from "./SearchExaminerModal";

type ActionButtonsProps = {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onReset?: () => void;
  onSelectExaminer: (seatNumber: string) => void; // ✅ เพิ่ม callback
};

export default function ActionButtonsExam({
  onExport,
  onImport,
  onReset,
  onSelectExaminer,
}: ActionButtonsProps) {
  const [showSearchModal, setShowSearchModal] = useState(false);

  const buttonHover = {
    y: -3,
    boxShadow: "0 8px 15px rgba(0,0,0,0.3)",
  };

  return (
    <>
      <div className="flex items-center gap-4 flex-wrap">
        {/* ปุ่มนำเข้า */}
        <motion.label
          whileHover={buttonHover}
          htmlFor="excel-upload"
          className="flex items-center cursor-pointer bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white font-bold py-2 px-4 rounded-lg"
        >
          <FileUp className="mr-2" />
          นำเข้า
          <input
            type="file"
            id="excel-upload"
            accept=".xlsx, .xls"
            onChange={onImport}
            className="hidden"
          />
        </motion.label>

        {/* ปุ่มส่งออก */}
        <motion.button
          whileHover={buttonHover}
          onClick={onExport}
          className="flex items-center bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 text-white font-bold py-2 px-4 rounded-lg"
        >
          <FileDown className="mr-2" />
          ส่งออก
        </motion.button>

        {/* ปุ่มรีเซ็ต */}
        {onReset && (
          <motion.button
            whileHover={buttonHover}
            onClick={onReset}
            className="flex items-center bg-gradient-to-tr from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            <RotateCcw className="mr-2" />
            รีเซ็ตข้อมูล
          </motion.button>
        )}

        {/* ปุ่มค้นหาผู้สอบ */}
        <motion.button
          whileHover={buttonHover}
          onClick={() => setShowSearchModal(true)}
          className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          <Search className="mr-2" />
          ค้นหาผู้สอบ
        </motion.button>
      </div>

      {/* SearchExaminerModal */}
      <SearchExaminerModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectExaminer={(seatNumber) => {
          onSelectExaminer(seatNumber); // ส่ง callback ไป parent
          setShowSearchModal(false); // ปิด modal
        }}
      />
    </>
  );
}
