/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import * as XLSX from 'xlsx'

import SearchExaminerModal from './SearchExaminerModal';
import ExaminerTable from '../components/ExaminerTable'
import ActionButtons from '../components/ActionButtonsExam'
import ProgressCard from '../components/ProgressCard'
import ConfirmDialog from './ConfirmDialog';
import { toast } from 'react-toastify';

export type Examiner = {
    examinerid?: number
    examinee_number: string
    idcardnumber: string
    title: string
    firstname: string
    lastname: string
    gender: string
    titleeng: string
    firstnameeng: string
    middlenameeng?: string
    lastnameeng: string
    phone: string
    email: string
    specialneeds: string
    nationality: string
}

export default function ExaminerList() {
    const [examiners, setExaminers] = useState<Examiner[]>([])
    const [loading, setLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const [showProgressCard, setShowProgressCard] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');
    const [showDialog, setShowDialog] = useState(false);
    const [highlightSeat, setHighlightSeat] = useState<string | undefined>();
    const [showSearchModal, setShowSearchModal] = useState(false);

    const router = useRouter();

    // ดึงข้อมูลจาก DB
    useEffect(() => {
        const fetchExaminers = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('examiner')
                .select('*')
                .order('examinerid', { ascending: true })

            if (error) {
                console.error('Error loading examiners:', error)
                setErrorMessage(error.message)
            } else {
                setExaminers(data)
            }
            setLoading(false)
        }

        fetchExaminers()
    }, [])

    // ลบผู้เข้าสอบ
    const handleDeleteClick = async (examinerId: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่ต้องการลบผู้เข้าสอบคนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) return

        setLoading(true)
        setErrorMessage('')

        const { error } = await supabase
            .from('examiner')
            .delete()
            .eq('examinerid', examinerId)

        if (error) {
            console.error('Error deleting examiner:', error)
            setErrorMessage(`ไม่สามารถลบข้อมูลได้: ${error.message}`);
            toast.info(`ไม่สามารถลบข้อมูลได้: ${error.message}`);
        } else {
            setExaminers(prev => prev.filter(ex => ex.examinerid !== examinerId));
            toast.error('ลบผู้เข้าสอบสำเร็จ!');
        }
        setLoading(false);
    }

    // นำเข้า Excel
    const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setErrorMessage('');
        setShowProgressCard(true);
        setProgressValue(0);
        setProgressMessage('กำลังเตรียมการนำเข้า...');

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                if (jsonData.length === 0) throw new Error("ไม่พบข้อมูลในไฟล์ Excel หรือไฟล์เสียหาย");

                const newExaminers: Omit<Examiner, 'examinerid'>[] = jsonData.map((row, index) => ({
                    examinee_number: String(row['เลขประจำตัวสอบ']).trim(),
                    idcardnumber: String(row['เลขประจำตัวประชาชน'] || row['ID Card'] || '').trim(),
                    title: String(row['คำนำหน้า'] || '').trim(),
                    firstname: String(row['ชื่อ'] || '').trim(),
                    lastname: String(row['นามสกุล'] || '').trim(),
                    gender: String(row['เพศ'] || '').trim(),
                    titleeng: String(row['Name1EN'] || '').trim(),
                    firstnameeng: String(row['Name2EN'] || '').trim(),
                    middlenameeng: String(row['NameMidEN'] || '').trim(),
                    lastnameeng: String(row['Name3EN'] || '').trim(),
                    phone: String(row['โทรศัพท์มือถือ'] || row['Phone'] || '').trim(),
                    email: String(row['อีเมล'] || row['Email'] || '').trim(),
                    specialneeds: String(row['ความต้องการพิเศษ'] || row['Special Needs'] || '').trim(),
                    nationality: String(row['สัญชาติ'] || row['Nationality'] || 'ไทย').trim(),
                }))
                .filter((ex, index, self) => {
                    if (!ex.idcardnumber || !ex.firstname || !ex.lastname || !ex.examinee_number) return false;
                    const duplicateInExcel = self.findIndex(e => e.examinee_number === ex.examinee_number) !== index;
                    return !duplicateInExcel;
                });

                if (newExaminers.length === 0) throw new Error("ไม่พบข้อมูลผู้เข้าสอบที่ถูกต้องในไฟล์");

                setProgressMessage(`กำลังตรวจสอบข้อมูลกับฐานข้อมูล...`);
                const { data: existingExaminers } = await supabase
                    .from('examiner')
                    .select('examinee_number');
                const existingNumbers = new Set(existingExaminers?.map(e => e.examinee_number));
                const filteredExaminers = newExaminers.filter(ex => !existingNumbers.has(ex.examinee_number));

                if (filteredExaminers.length === 0) throw new Error("ไม่มีข้อมูลใหม่ที่จะนำเข้า (ซ้ำกับฐานข้อมูล)");

                setProgressMessage(`กำลังบันทึก ${filteredExaminers.length} รายการ...`);
                const { error } = await supabase.from('examiner').insert(filteredExaminers);
                if (error) throw error;

                const { data: updatedData } = await supabase
                    .from('examiner')
                    .select('*')
                    .order('examinerid', { ascending: true });
                if (updatedData) setExaminers(updatedData);

                setProgressValue(100);
                setProgressMessage(`นำเข้าข้อมูลสำเร็จ ${filteredExaminers.length} รายการ!`);
                toast.success(`นำเข้าข้อมูลผู้เข้าสอบสำเร็จ ${filteredExaminers.length} รายการ!`);
            } catch (err: any) {
                console.error(err);
                setErrorMessage(`เกิดข้อผิดพลาด: ${err.message}`);
                toast.error(`เกิดข้อผิดพลาด: ${err.message}`);
            } finally {
                setTimeout(() => setShowProgressCard(false), 1500);
                setLoading(false);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    // ส่งออก Excel
    const handleExportExcel = () => {
        if (examiners.length === 0) return toast.error('ไม่มีข้อมูลให้ส่งออก!');
        setShowProgressCard(true);
        setProgressValue(0);
        setProgressMessage('กำลังสร้างไฟล์ Excel...');
        setLoading(true);

        try {
            const dataToExport = examiners.map(examiner => ({
                'ลำดับ': examiner.examinerid ?? '',
                'เลขประจำตัวสอบ': examiner.examinee_number,
                'เลขประจำตัวประชาชน': examiner.idcardnumber || '',
                'คำนำหน้า': examiner.title || '',
                'ชื่อ': examiner.firstname || '',
                'นามสกุล': examiner.lastname || '',
                'เพศ': examiner.gender || '',
                'Name1EN': examiner.titleeng || '',
                'Name2EN': examiner.firstnameeng || '',
                'NameMidEN': examiner.middlenameeng || '',
                'Name3EN': examiner.lastnameeng || '',
                'เบอร์โทร': examiner.phone || '',
                'อีเมล': examiner.email || '',
                'ความต้องการพิเศษ': examiner.specialneeds || '',
                'สัญชาติ': examiner.nationality || 'ไทย',
            }));

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'ข้อมูลผู้เข้าสอบ');

            const now = new Date();
            const dateStr = now.toLocaleDateString('th-TH').replace(/\//g, '-');
            const timeStr = now.toLocaleTimeString('th-TH').replace(/:/g, '');
            XLSX.writeFile(workbook, `รายชื่อผู้เข้าสอบ_${dateStr}_${timeStr}.xlsx`);

            setProgressValue(100);
                        setProgressMessage(`ส่งออกข้อมูลสำเร็จ ${examiners.length} รายการ!`);
            toast.success(`ส่งออกข้อมูลผู้เข้าสอบสำเร็จ ${examiners.length} รายการ!`);
        } catch (err: any) {
            console.error(err);
            setErrorMessage(`เกิดข้อผิดพลาดในการส่งออกไฟล์: ${err.message}`);
        } finally {
            setTimeout(() => setShowProgressCard(false), 1500);
            setLoading(false);
        }
    };

    // รีเซ็ตข้อมูล
    const handleResetData = async () => {
        setShowDialog(false);
        setLoading(true);
        setShowProgressCard(true);
        setProgressValue(0);
        setProgressMessage('กำลังรีเซ็ตข้อมูล...');
        setErrorMessage('');

        try {
            const { error } = await supabase.rpc('reset_examiner_data');
            if (error) throw error;

            setExaminers([]);
            setProgressValue(100);
            setProgressMessage('รีเซ็ตสำเร็จ!');
            toast.success('รีเซ็ตข้อมูลและ ID เริ่มที่ 1 สำเร็จแล้ว');
        } catch (err: any) {
            console.error(err);
            setErrorMessage(`เกิดข้อผิดพลาดในการรีเซ็ตข้อมูล: ${err.message}`);
        } finally {
            setTimeout(() => setShowProgressCard(false), 1500);
            setLoading(false);
        }
    };

    return (
    <div className="relative min-h-screen w-full p-4">
      {/* Header */}
      <div
        className="relative flex justify-between items-center mb-4 p-4 
                    rounded-2xl overflow-visible
                    bg-gradient-to-tr from-indigo-900 via-sky-700 to-indigo-800
                    shadow-[0_0_25px_rgba(56,189,248,0.35)]
                    backdrop-blur-md border border-white/10"
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-20 
                     bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 blur-3xl"
        />
        <p className="relative text-2xl ml-8 text-white tracking-[.25rem] font-bold drop-shadow-lg">
          ข้อมูลผู้เข้าสอบ
        </p>

        <div className="relative flex items-center mt-3 mr-8 mb-3">
          <ActionButtons
            onImport={handleImportExcel}
            onExport={handleExportExcel}
            onReset={() => setShowDialog(true)}
            onSelectExaminer={() => setShowSearchModal(true)}
          />
        </div>
      </div>

      {/* Loading / Error / Empty */}
      {loading && !showProgressCard && <Loading />}
      {!loading && errorMessage && !showProgressCard && (
        <p className="text-red-500">เกิดข้อผิดพลาด: {errorMessage}</p>
      )}
      {examiners.length === 0 && !loading && !showProgressCard ? (
        <p className="flex justify-center items-center text-red-700 my-[300px]">
          ไม่มีข้อมูลผู้เข้าสอบ
        </p>
      ) : (
        <ExaminerTable examiners={examiners} onDelete={handleDeleteClick} />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        show={showDialog}
        title="ยืนยันรีเซ็ตข้อมูล"
        message="คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมด? ข้อมูลทั้งหมดจะถูกลบ และรหัสผู้เข้าสอบจะเริ่มนับใหม่จาก 1!"
        confirmLabel="รีเซ็ต"
        cancelLabel="ยกเลิก"
        onConfirm={handleResetData}
        onCancel={() => setShowDialog(false)}
      />

      {showProgressCard && (
        <ProgressCard progress={progressValue} message={progressMessage} />
      )}

      {/* ✅ Search Modal วางท้ายสุดของ component */}
      <SearchExaminerModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSelectExaminer={(seatNumber) => {
          setHighlightSeat(seatNumber);
          setShowSearchModal(false);
        }}
      />
    </div>
  );
}

