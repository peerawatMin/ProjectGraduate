/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Loading from '../components/Loading'
import { motion } from 'framer-motion'
import * as XLSX from 'xlsx'

// Import components
import ExaminerTable from '../components/ExaminerTable'
import EditExaminerModal from '../components/EditExaminer'
import ActionButtons from '../components/ActionButtonsExam'
import ProgressCard from '../components/ProgressCard'

export type Examiner = {
    examinerid?: number // เปลี่ยนเป็น optional: Supabase มักจะสร้างค่านี้ให้เองเมื่อ insert ใหม่ (ถ้าเป็น IDENTITY)
    sessionid: number | null
    roomid: number | null
    idcardnumber: string
    title: string
    firstname: string
    lastname: string
    gender: string
    titleeng: string
    firstnameeng: string
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

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [examinerToEdit, setExaminerToEdit] = useState<Examiner | null>(null)

    const [showProgressCard, setShowProgressCard] = useState(false);
    const [progressValue, setProgressValue] = useState(0);
    const [progressMessage, setProgressMessage] = useState('');

    useEffect(() => {
        const fetchExaminers = async () => {
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

    const handleModalInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setExaminerToEdit(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleEditClick = (examiner: Examiner) => {
        setExaminerToEdit({ ...examiner })
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setExaminerToEdit(null)
        setErrorMessage('')
    }

    const handleSaveEdit = async () => {
        if (!examinerToEdit) return

        setLoading(true)
        setErrorMessage('')

        if (!examinerToEdit.firstname || !examinerToEdit.lastname || !examinerToEdit.idcardnumber) {
            setErrorMessage('กรุณากรอกข้อมูล ชื่อ, นามสกุล และเลขบัตรประชาชนให้ครบถ้วน')
            setLoading(false)
            return
        }

        const updatedExaminer = {
            ...examinerToEdit,
            sessionid: examinerToEdit.sessionid ? Number(examinerToEdit.sessionid) : null,
            roomid: examinerToEdit.roomid ? Number(examinerToEdit.roomid) : null,
        }

        // ตรวจสอบว่า examinerid มีค่าอยู่หรือไม่ ก่อนทำการ update
        // สำหรับการ update, examinerid จำเป็นต้องมีเพื่อระบุแถวที่จะแก้ไข
        if (updatedExaminer.examinerid === undefined || updatedExaminer.examinerid === null) {
            setErrorMessage('ไม่พบรหัสผู้เข้าสอบสำหรับอัปเดตข้อมูล');
            setLoading(false);
            return;
        }

        const { error } = await supabase
            .from('examiner')
            .update(updatedExaminer)
            .eq('examinerid', updatedExaminer.examinerid)

        if (error) {
            console.error('Error updating examiner:', error)
            setErrorMessage(`เกิดข้อผิดพลาดในการอัปเดต: ${error.message}`)
        } else {
            setExaminers(prev => prev.map(ex => ex.examinerid === updatedExaminer.examinerid ? updatedExaminer : ex))
            handleCloseModal()
            alert('อัปเดตข้อมูลผู้เข้าสอบสำเร็จ!')
        }
        setLoading(false)
    }

    const handleDeleteClick = async (examinerId: number) => {
        if (!confirm('คุณแน่ใจหรือไม่ที่ต้องการลบผู้เข้าสอบคนนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้')) {
            return
        }

        setLoading(true)
        setErrorMessage('')

        const { error } = await supabase
            .from('examiner')
            .delete()
            .eq('examinerid', examinerId)

        if (error) {
            console.error('Error deleting examiner:', error)
            setErrorMessage(`ไม่สามารถลบข้อมูลได้: ${error.message}`);
            alert(`ไม่สามารถลบข้อมูลได้: ${error.message}`);
        } else {
            setExaminers(prev => prev.filter(ex => ex.examinerid !== examinerId));
            alert('ลบผู้เข้าสอบสำเร็จ!');
        }
        setLoading(false);
    }

    const columnMap: { [key: string]: string } = {
        'รหัสรอบสอบ': 'sessionid',
        'รหัสห้องสอบ': 'roomid',
        'เลขบัตรประชาชน': 'idcardnumber',
        'คำนำหน้า (ไทย)': 'title',
        'ชื่อ (ไทย)': 'firstname',
        'นามสกุล (ไทย)': 'lastname',
        'เพศ': 'gender',
        'คำนำหน้า (อังกฤษ)': 'titleeng',
        'ชื่อ (อังกฤษ)': 'firstnameeng',
        'นามสกุล (อังกฤษ)': 'lastnameeng',
        'เบอร์โทรศัพท์': 'phone',
        'อีเมล': 'email',
        'ความต้องการพิเศษ': 'specialneeds',
        'สัญชาติ': 'nationality',
        // ไม่รวม 'รหัสผู้เข้าสอบ' (examinerid) ใน columnMap สำหรับการ Import
        // เนื่องจาก Supabase จะสร้างให้เองเมื่อตั้งค่า auto-increment แล้ว
        // แต่จะยังคงมีใน Type และใช้สำหรับการ Export และการ Update
    };

    const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setErrorMessage('');
        setShowProgressCard(true);
        setProgressValue(0);
        setProgressMessage('กำลังเตรียมการนำเข้า...');

        const reader = new FileReader();

        reader.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                setProgressValue(percent);
                setProgressMessage(`กำลังอ่านไฟล์: ${percent}%`);
            }
        };

        reader.onload = async (e) => {
            try {
                setProgressMessage('กำลังประมวลผลข้อมูล...');
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                console.log("ข้อมูล JSON ดิบจาก Excel:", json);

                const newExaminers: Omit<Examiner, 'examinerid'>[] = json.map((row: any) => {
                    const mappedRow: any = {};
                    for (const thaiHeader in columnMap) {
                        if (Object.prototype.hasOwnProperty.call(row, thaiHeader)) {
                            const englishProp = columnMap[thaiHeader];
                            mappedRow[englishProp] = row[thaiHeader];
                        }
                    }

                    let idcardnumber: string = '';
                    const idCardRaw = mappedRow.idcardnumber;

                    if (typeof idCardRaw === 'number') {
                        // ใช้ String() เพื่อแปลงเป็น string
                        // ถ้า Excel format เป็น General หรือ Number และค่าเป็นเลขจำนวนมาก
                        // มันอาจถูกอ่านเป็น Scientific Notation ใน JS (e.g., 1.23457E+12)
                        idcardnumber = String(idCardRaw); 
                        if (idcardnumber.includes('e') || idcardnumber.includes('E')) {
                            console.warn(`[WARN] 'เลขบัตรประชาชน' (ID: ${idCardRaw}) is in scientific notation. Please format the column as 'Text' in Excel before importing.`);
                            // **สำคัญ**: ถ้าต้องการจัดการ Scientific Notation ที่มีค่าจริงๆ ควรใช้ไลบรารีที่จัดการ BigInt หรือ Decimal ได้
                            // หรือแนะนำให้ผู้ใช้เปลี่ยน format ใน Excel เป็น "Text" ก่อนส่งออก
                            // ณ จุดนี้ เราจะใช้ค่าที่ได้จากการแปลงเป็น String ตรงๆ ซึ่งอาจจะไม่ถูกต้องถ้า Excel ตัดทอนเลข
                        }
                    } else if (typeof idCardRaw === 'string') {
                        idcardnumber = idCardRaw;
                    } else if (idCardRaw !== undefined && idCardRaw !== null) {
                        idcardnumber = String(idCardRaw);
                    }
                    
                    // สร้างอ็อบเจกต์ Examiner สำหรับการ insert
                    // ใช้ Omit<Examiner, 'examinerid'> เพื่อบอกว่า object นี้จะไม่มี examinerid
                    // เพราะ Supabase จะสร้างค่านี้ให้เองเมื่อตั้งค่า auto-increment แล้ว
                    const examinerData: Omit<Examiner, 'examinerid'> = {
                        sessionid: mappedRow.sessionid !== undefined && mappedRow.sessionid !== null ? Number(mappedRow.sessionid) : null,
                        roomid: mappedRow.roomid !== undefined && mappedRow.roomid !== null ? Number(mappedRow.roomid) : null,
                        idcardnumber: idcardnumber,
                        title: mappedRow.title || '',
                        firstname: mappedRow.firstname || '',
                        lastname: mappedRow.lastname || '',
                        gender: mappedRow.gender || '',
                        titleeng: mappedRow.titleeng || '',
                        firstnameeng: mappedRow.firstnameeng || '',
                        lastnameeng: mappedRow.lastnameeng || '',
                        phone: String(mappedRow.phone || ''), // แปลงเป็น String เสมอ
                        email: mappedRow.email || '',
                        specialneeds: mappedRow.specialneeds || '',
                        nationality: mappedRow.nationality || '',
                    };

                    return examinerData;
                }).filter(ex => ex.idcardnumber && ex.idcardnumber.trim() !== ''); // กรองแถวที่ไม่มีเลขบัตรประชาชน

                console.log("ข้อมูลผู้เข้าสอบที่ถูกแมปและกรองแล้ว (พร้อมส่งเข้า Supabase):", newExaminers);

                if (newExaminers.length === 0) {
                    setErrorMessage("ไม่พบข้อมูลผู้เข้าสอบที่ถูกต้องในไฟล์ Excel. โปรดตรวจสอบว่าหัวข้อคอลัมน์และข้อมูลถูกต้อง, และคอลัมน์ 'เลขบัตรประชาชน' ไม่ว่างเปล่า");
                    setShowProgressCard(false);
                    setLoading(false);
                    return;
                }

                setProgressMessage('กำลังบันทึกข้อมูลลงฐานข้อมูล...');
                // จำลองความคืบหน้า (ในชีวิตจริง Supabase insert เป็น batch ไม่ได้แสดง progress เป็น % ง่ายๆ)
                for (let i = 0; i < 100; i += 10) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    setProgressValue(Math.min(i, 99));
                }

                const { error } = await supabase
                    .from('examiner')
                    .insert(newExaminers); // ส่งข้อมูลที่แมปแล้วไปบันทึก

                if (error) {
                    console.error('Error importing examiners to Supabase:', error);
                    // เพิ่มการ log ละเอียดของ error object จาก Supabase
                    console.error('Supabase error details (JSON):', JSON.stringify(error, null, 2));
                    setErrorMessage(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message || 'ไม่ทราบข้อผิดพลาด'}`);
                    setShowProgressCard(false);
                } else {
                    // หากบันทึกสำเร็จ ดึงข้อมูลล่าสุดมาแสดง
                    const { data: updatedData, error: fetchError } = await supabase
                        .from('examiner')
                        .select('*')
                        .order('examinerid', { ascending: true });
                    if (updatedData) setExaminers(updatedData);
                    if (fetchError) setErrorMessage(`เกิดข้อผิดพลาดในการดึงข้อมูลอัปเดต: ${fetchError.message}`);

                    setProgressValue(100);
                    setProgressMessage('นำเข้าข้อมูลสำเร็จ!');
                    alert('นำเข้าข้อมูลผู้เข้าสอบสำเร็จ!');
                    setTimeout(() => setShowProgressCard(false), 1500);
                    window.location.reload()
                }
            } catch (err: any) {
                console.error('Error processing Excel file or during Supabase operation:', err);
                setErrorMessage(`เกิดข้อผิดพลาดในการประมวลผลไฟล์: ${err.message}`);
                setShowProgressCard(false);
            } finally {
                setLoading(false);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleExportExcel = () => {
        if (examiners.length === 0) {
            alert('ไม่มีข้อมูลให้ส่งออก!');
            return;
        }

        setShowProgressCard(true);
        setProgressValue(0);
        setProgressMessage('กำลังส่งออกข้อมูล...');

        setLoading(true);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                setProgressValue(progress);
            } else {
                clearInterval(interval);

                const dataToExport = examiners.map(examiner => ({
                    'รหัสผู้เข้าสอบ': examiner.examinerid,
                    'รหัสรอบสอบ': examiner.sessionid,
                    'รหัสห้องสอบ': examiner.roomid,
                    'เลขบัตรประชาชน': examiner.idcardnumber,
                    'คำนำหน้า (ไทย)': examiner.title,
                    'ชื่อ (ไทย)': examiner.firstname,
                    'นามสกุล (ไทย)': examiner.lastname,
                    'เพศ': examiner.gender,
                    'คำนำหน้า (อังกฤษ)': examiner.titleeng,
                    'ชื่อ (อังกฤษ)': examiner.firstnameeng,
                    'นามสกุล (อังกฤษ)': examiner.lastnameeng,
                    'เบอร์โทรศัพท์': examiner.phone,
                    'อีเมล': examiner.email,
                    'ความต้องการพิเศษ': examiner.specialneeds,
                    'สัญชาติ': examiner.nationality,
                }));

                const worksheet = XLSX.utils.json_to_sheet(dataToExport);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Examiners');

                XLSX.writeFile(workbook, 'ExaminerList.xlsx');

                setProgressValue(100);
                setProgressMessage('ส่งออกข้อมูลสำเร็จ!');
                alert('ส่งออกข้อมูลผู้เข้าสอบสำเร็จ!');
                setTimeout(() => setShowProgressCard(false), 1500);
                setLoading(false);
            }
        }, 150);
    }
        const router = useRouter();

        const handleResetData = async () => {
            const confirmReset = confirm(
                'คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตข้อมูลทั้งหมด? ข้อมูลทั้งหมดจะถูกลบ และรหัสผู้เข้าสอบจะเริ่มนับใหม่จาก 1!'
            );

            if (!confirmReset) return;

            setLoading(true);
            setErrorMessage('');
            setShowProgressCard(true);
            setProgressValue(0);
            setProgressMessage('กำลังรีเซ็ตข้อมูล...');

            try {
                // เรียก Supabase RPC function
                const { error } = await supabase.rpc('reset_examiner_data');

                if (error) throw error;

                setProgressValue(100);
                setProgressMessage('รีเซ็ตสำเร็จ!');
                setExaminers([]); // ล้าง state ที่แสดงใน UI

                alert('รีเซ็ตข้อมูลและ ID เริ่มที่ 1 สำเร็จแล้ว');

                // ✅ รีเฟรชหน้าเว็บหลัง reset (ทั้งแบบ Next.js และ fallback)
                router.refresh?.();  // ใช้ใน Next.js 13+
                window.location.reload(); // fallback เผื่อ router.refresh ไม่ทำงาน
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
        <div className="p-4 h-screen w-full">
            <motion.div
                whileHover={{ y: 5, boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.3)" }}
                className="flex bg-gradient-to-tr from-indigo-800 to-sky-600 backdrop-blur-md shadow-lg
                rounded-xl overflow-hidden justify-between mb-4 p-2 items-center">
                    <p className='text-2xl ml-8 text-white tracking-[.25rem] font-bold'>ข้อมูลผู้เข้าสอบ</p>
                    <div className="flex items-center mt-3 mr-8">
                        <ActionButtons
                            onImport={handleImportExcel}
                            onExport={handleExportExcel}
                        />
                        <motion.div whileHover={{ y: 5, boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0)" }}>
                        <button
                            onClick={handleResetData}
                            className="mb-4 px-4 py-2 ml-4 bg-red-500 text-white font-semibold rounded-[10px] hover:bg-red-700 transition-shadow"
                            >
                            รีเซ็ตข้อมูล
                        </button>
                        </motion.div>
                    </div>  
            </motion.div>

            {loading && !showProgressCard ? (
                <Loading />
            ) : errorMessage && !isModalOpen && !showProgressCard ? (
                <p className="text-red-500">เกิดข้อผิดพลาด: {errorMessage}</p>
            ) : (
                <>
                    {examiners.length === 0 && (
                        <p className="flex justify-center items-center  text-red-700 my-[300px]">ไม่มีข้อมูลผู้เข้าสอบ</p>
                    )}

                    {examiners.length > 0 && (
                        <ExaminerTable
                            examiners={examiners}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    )}
                </>
            )}

            {showProgressCard && (
                <ProgressCard
                    progress={progressValue}
                    message={progressMessage}
                />
            )}

            {isModalOpen && examinerToEdit && (
                <EditExaminerModal
                    examiner={examinerToEdit}
                    onSave={handleSaveEdit}
                    onClose={handleCloseModal}
                    onInputChange={handleModalInputChange}
                    loading={loading}
                    errorMessage={errorMessage}
                />
            )}
        </div>
    )
}