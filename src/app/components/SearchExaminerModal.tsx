/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X } from "lucide-react";
import { createPortal } from 'react-dom';
import { supabase } from "@/lib/supabaseClient";

type SeatAssignment = {
  assignment_id: string;
  examiner_id: number;
  seat_number: number;
  room_id: string;
  examiner: {
    firstname: string;
    lastname: string;
    gender: string;
    examinee_number: string;
    idcardnumber?: string;
    phone?: string;
    email?: string;
  } | null;
};

type SearchExaminerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectExaminer: (seatNumber: string) => void;
};

export default function SearchExaminerModal({
  isOpen,
  onClose,
  onSelectExaminer,
}: SearchExaminerModalProps) {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [results, setResults] = useState<SeatAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);

const handleSearch = async () => {
  try {
    setLoading(true);
    setResults([]);

    const searchTerm = query.trim();
    let allResults: any[] = [];

    // ฟังก์ชันสร้าง query base พร้อม join examiner
    const makeQuery = () =>
      supabase
        .from("seat_assignment")
        .select(
          `
          assignment_id,
          examiner_id,
          seat_number,
          room_id,
          examiner!inner (
            firstname,
            lastname,
            gender,
            examinee_number,
            idcardnumber,
            phone,
            email
          )
        `
        );

    if (searchTerm) {
      const isNumeric = /^\d+$/.test(searchTerm);

      if (isNumeric) {
        // 🔢 ค้นหาเลขที่นั่ง (สมมติไม่เกิน 3 หลัก เช่น 1–999)
        if (searchTerm.length <= 3) {
          const { data: seatData } = await makeQuery().eq(
            "seat_number",
            parseInt(searchTerm)
          );
          if (seatData) allResults.push(...seatData);
        }

      // ✅ ค้นหาเลขประจำตัวสอบ (14 หลัก)
      if (searchTerm.length === 14) {
        const { data: examNumberData } = await makeQuery().eq(
          "examiner.examinee_number",
          searchTerm
        );
        if (examNumberData) allResults.push(...examNumberData);
      }

        // 🔢 ค้นหาเลขบัตรประชาชน (13 หลักเป๊ะ ๆ)
        if (searchTerm.length === 13) {
          const { data: idCardData } = await makeQuery().eq(
            "examiner.idcardnumber",
            searchTerm
          );
          if (idCardData) allResults.push(...idCardData);
        }
      } else {
        // 🔤 ค้นหาชื่อจริง
        const { data: firstNameData } = await makeQuery().ilike(
          "examiner.firstname",
          `%${searchTerm}%`
        );
        if (firstNameData) allResults.push(...firstNameData);

        // 🔤 ค้นหานามสกุล
        const { data: lastNameData } = await makeQuery().ilike(
          "examiner.lastname",
          `%${searchTerm}%`
        );
        if (lastNameData) allResults.push(...lastNameData);

        // 🔤 ค้นหาอีเมล
        const { data: emailData } = await makeQuery().ilike(
          "examiner.email",
          `%${searchTerm}%`
        );
        if (emailData) allResults.push(...emailData);
      }

      // 🧹 กำจัดข้อมูลซ้ำ
      const uniqueResults = allResults.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.assignment_id === item.assignment_id)
      );
      allResults = uniqueResults;
    } else {
      // ถ้าไม่มีการค้นหา → ดึงมา 50 แถวแรก
      const { data, error } = await makeQuery().limit(50);
      if (error) throw error;
      allResults = data || [];
    }

    // กรองตามเพศ
    if (gender && allResults.length > 0) {
      allResults = allResults.filter(
        (item: any) => item.examiner?.gender === gender
      );
    }

    // กรองตามห้อง
    if (roomFilter && allResults.length > 0) {
      allResults = allResults.filter(
        (item: any) => item.room_id === roomFilter
      );
    }

    // กรองข้อมูลที่มี examiner และจัดเรียง
    const filteredData = allResults
      .filter((item: any) => item.examiner)
      .map((item: any) => ({
        assignment_id: item.assignment_id,
        examiner_id: item.examiner_id,
        seat_number: item.seat_number,
        room_id: item.room_id,
        examiner: item.examiner,
      }))
      .sort((a, b) => a.seat_number - b.seat_number) as SeatAssignment[];

    setResults(filteredData);
  } catch (err: any) {
    console.error("Search error:", err);
    setResults([]);
    alert(
      `เกิดข้อผิดพลาดในการค้นหา: ${err.message || "กรุณาลองใหม่อีกครั้ง"}`
    );
  } finally {
    setLoading(false);
  }
};



  // ฟังก์ชันล้างการค้นหา
  const handleClearSearch = () => {
    setQuery("");
    setGender("");
    setRoomFilter("");
    setResults([]);
  };

  // โหลดรายชื่อห้องสอบ
  const loadAvailableRooms = async () => {
    try {
      const { data, error } = await supabase
        .from("seat_assignment")
        .select("room_id")
        .not("room_id", "is", null);
      
      if (!error && data) {
        const uniqueRooms = [...new Set(data.map(item => item.room_id))].sort();
        setAvailableRooms(uniqueRooms);
      }
    } catch (err) {
      console.error("Error loading rooms:", err);
    }
  };

  // โหลดห้องเมื่อ modal เปิด
  React.useEffect(() => {
    if (isOpen && availableRooms.length === 0) {
      loadAvailableRooms();
    }
  }, [isOpen]);

  const handleSelect = (seatNumber: number) => {
    onSelectExaminer(seatNumber.toString());
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
        >
          <motion.div
            className="bg-gradient-to-tr from-indigo-800 via-blue-700 to-sky-600 rounded-2xl shadow-2xl w-full relative"
            style={{
              maxWidth: '28rem',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ปุ่มปิด */}
            <button
              className="absolute top-4 right-4 p-1 text-gray-800 hover:text-red-500 hover:bg-gray-100 rounded-full transition-all duration-200"
              onClick={onClose}
            >
              <X size={20} />
            </button>

            {/* หัวข้อ */}
            <h2 className="text-xl font-bold mb-6 text-center text-white">
              ค้นหาผู้สอบ
            </h2>

            {/* ฟอร์มค้นหา */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  ค้นหาทั่วไป
                </label>
                <input
                  type="text"
                  placeholder="ชื่อ, นามสกุล, เลขที่นั่ง"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleSearch()}
                  className="w-full border text-white border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-200 mt-1">
                  💡 สามารถค้นหาด้วยชื่อ, นามสกุล, เลขประจำตัวสอบ, เลขที่นั่ง หรือเลขบัตรประชาชน
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    เพศ
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border text-white border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option className="bg-gray-800" value="">ทุกเพศ</option>
                    <option className="bg-gray-800" value="ชาย">ชาย</option>
                    <option className="bg-gray-800" value="หญิง">หญิง</option>
                    <option className="bg-gray-800" value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-100 mb-2">
                    ห้องสอบ
                  </label>
                  <select
                    value={roomFilter}
                    onChange={(e) => setRoomFilter(e.target.value)}
                    className="w-full text-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  >
                    <option value="">ทุกห้อง</option>
                    {availableRooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ค้นหา...
                    </div>
                  ) : (
                    "🔍 ค้นหา"
                  )}
                </button>
                
                <button
                  onClick={handleClearSearch}
                  className="px-4 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-600 hover:text-amber-500 transition-all duration-200"
                  title="ล้างการค้นหา"
                >
                  <RotateCcw/>
                </button>
              </div>
            </div>

            {/* ผลการค้นหา */}
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {/* Skeleton loading */}
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-4 animate-pulse"
                  >
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-1 w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                ))}

              {/* ไม่พบผลลัพธ์ */}
              {!loading && results.length === 0 && query && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>ไม่พบผลลัพธ์</p>
                  <p className="text-sm">ลองเปลี่ยนคำค้นหาใหม่</p>
                </div>
              )}

              {/* ยังไม่ได้ค้นหา */}
              {!loading && results.length === 0 && !query && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">📝</div>
                  <p>กรอกข้อมูลเพื่อค้นหาผู้สอบ</p>
                </div>
              )}

              {/* รายการผลลัพธ์ */}
              {!loading &&
                results.map((item) => (
                  <motion.div
                    key={item.assignment_id}
                    className="border border-gray-200 p-4 rounded-lg cursor-pointer hover:border-green-300 hover:bg-gray-800 transition-all duration-200 hover:shadow-md"
                    onClick={() => handleSelect(item.seat_number)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-white text-lg">
                        {item.examiner ? `${item.examiner.firstname} ${item.examiner.lastname}` : 'ไม่ระบุชื่อ'}
                      </h3>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        ที่นั่ง {item.seat_number}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center text-sm text-white">
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        เลขสอบ: {item.examiner?.examinee_number || 'ไม่ระบุ'}
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        เพศ: {item.examiner?.gender || 'ไม่ระบุ'}
                      </div>
                      <div className="flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        ห้อง: {item.room_id}
                      </div>
                      {item.examiner?.phone && (
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          โทร: {item.examiner.phone}
                        </div>
                      )}
                      {item.examiner?.email && (
                        <div className="flex items-center col-span-2">
                          <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                          อีเมล: {item.examiner.email}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* ข้อความช่วยเหลือ */}
            {results.length > 0 && !loading && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-600">
                  คลิกที่รายการเพื่อเลือกผู้สอบ ({results.length} รายการ)
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ใช้ Portal เพื่อ render modal นอก DOM tree
  if (typeof window === 'undefined') return null;
  
  return createPortal(modalContent, document.body);
}