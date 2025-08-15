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
            setErrorMessage('กรุณากรอกข้อมูล ชื่อ, นามสกุล และเลขประจำตัวประชาชนให้ครบถ้วน')
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

    // ปรับ columnMap ให้ตรงกับรูปภาพที่ให้มา
    const columnMap: { [key: string]: string } = {
        // คอลัมน์พื้นฐาน (ทั้งแบบตรงและใกล้เคียง)
        'เลขประจำตัวประชาชน': 'idcardnumber',
        'เลขประจำตัวประชาชนอย่างเป็นทางการ': 'idcardnumber',
        'เลขประจำตัวประชาชน อย่างเป็นทางการ': 'idcardnumber',
        'ID Card': 'idcardnumber',
        'เลขประจำตัว': 'idcardnumber',
        'รหัสประจำตัว': 'idcardnumber',
        'บัตรประชาชน': 'idcardnumber',
        
        'รอบสอบ': 'sessionid',
        'รอบ': 'sessionid',
        'Session': 'sessionid',
        
        'ศูนย์สอบ': 'roomid',
        'ห้องสอบ': 'roomid',
        'Room': 'roomid',
        
        'คำนำหน้า': 'title',
        'คำนำหน้าชื่อ': 'title',
        'Title': 'title',
        
        'ชื่อ': 'firstname',
        'ชื่อจริง': 'firstname',
        'FirstName': 'firstname',
        'First Name': 'firstname',
        
        'นามสกุล': 'lastname',
        'ชื่อสกุล': 'lastname',
        'LastName': 'lastname',
        'Last Name': 'lastname',
        
        'เพศ': 'gender',
        'Gender': 'gender',
        
        // คอลัมน์ภาษาอังกฤษ (ตามรูปภาพ)
        'Name1EN': 'titleeng',
        'Name2EN': 'firstnameeng',
        'NameMidEN': 'middlenameeng',
        'Name3EN': 'lastnameeng',
        
        // คอลัมน์อื่นๆ
        'เบอร์โทร': 'phone',
        'โทรศัพท์': 'phone',
        'โทรศัพท์มือถือ': 'phone',
        'โทรศัพท์เคลื่อนที่': 'phone',
        'Phone': 'phone',
        'Mobile': 'phone',
        
        'อีเมล': 'email',
        'อีเมล์': 'email',
        'Email': 'email',
        'E-mail': 'email',
        
        'ความต้องการพิเศษ': 'specialneeds',
        'Special Needs': 'specialneeds',
        'ข้อกำหนดพิเศษ': 'specialneeds',
        
        'สัญชาติ': 'nationality',
        'Nationality': 'nationality',
        'ชาติ': 'nationality'
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

            // อ่านข้อมูลแบบ raw ก่อน
            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
            console.log("ขอบเขตข้อมูลในไฟล์:", range);

            // หาแถวที่เป็นหัวข้อคอลัมน์จริง
            let headerRow = 0;
            let maxNonEmptyColumns = 0;
            
            for (let rowIndex = 0; rowIndex <= Math.min(10, range.e.r); rowIndex++) {
                let nonEmptyCount = 0;
                let hasIdCardLikeColumn = false;
                
                for (let colIndex = range.s.c; colIndex <= range.e.c; colIndex++) {
                    const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
                    const cell = worksheet[cellAddress];
                    
                    if (cell && cell.v && String(cell.v).trim() !== '') {
                        nonEmptyCount++;
                        const cellValue = String(cell.v).trim();
                        
                        // ตรวจสอบว่ามีคำที่เกี่ยวข้องกับเลขประจำตัวประชาชนหรือไม่
                        if (cellValue.includes('เลข') || cellValue.includes('บัตร') || 
                            cellValue.includes('ประชาชน') || cellValue.includes('ID') ||
                            cellValue.includes('Card') || cellValue.includes('รหัส')) {
                            hasIdCardLikeColumn = true;
                        }
                    }
                }
                
                console.log(`แถวที่ ${rowIndex}: มีข้อมูล ${nonEmptyCount} คอลัมน์, มีคอลัมน์ที่เกี่ยวข้องกับ ID: ${hasIdCardLikeColumn}`);
                
                if (nonEmptyCount > maxNonEmptyColumns && hasIdCardLikeColumn) {
                    maxNonEmptyColumns = nonEmptyCount;
                    headerRow = rowIndex;
                }
            }
            
            console.log(`ใช้แถวที่ ${headerRow} เป็นหัวข้อคอลัมน์`);

            // อ่านข้อมูลโดยข้าม header rows ที่ไม่จำเป็น
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { 
                range: headerRow,
                defval: "" // ใช้ค่าว่างแทน undefined
            });

            console.log("ข้อมูล JSON หลังกรองแล้ว:", jsonData);

            if (jsonData.length === 0) {
                setErrorMessage("ไม่พบข้อมูลในไฟล์ Excel หรือไฟล์เสียหาย");
                setShowProgressCard(false);
                setLoading(false);
                return;
            }

            const fileHeaders = Object.keys(jsonData[0])
                .filter(header => !header.startsWith('__EMPTY'))
                .map(header => header.trim())
                .filter(header => header !== '');

            console.log("หัวข้อคอลัมน์ที่พบหลังกรอง:", fileHeaders);
            
            // ตรวจสอบคอลัมน์ที่จำเป็น
            const requiredColumns = ['เลขประจำตัวประชาชน', 'ชื่อ', 'นามสกุล'];
            const idCardColumns = ['เลขประจำตัวประชาชน', 'เลขบัตรประชาชน', 'ID Card', 'เลขประจำตัว', 'รหัสประจำตัว'];
            
            const hasIdColumn = idCardColumns.some(col => 
                fileHeaders.some(header => 
                    header.includes(col) || col.includes(header) || 
                    (header.includes('เลข') && header.includes('ประชาชน')) ||
                    (header.includes('บัตร') && header.includes('ประชาชน'))
                )
            );
            
            if (!hasIdColumn && fileHeaders.length > 0) {
                const userSelectedColumn = prompt(
                    `ไม่พบคอลัมน์เลขประจำตัวประชาชนที่รู้จัก\n\nหัวข้อคอลัมน์ที่พบ:\n${fileHeaders.map((h, i) => `${i + 1}. ${h}`).join('\n')}\n\nกรุณาใส่หมายเลข (1-${fileHeaders.length}) ของคอลัมน์ที่เป็นเลขประจำตัวประชาชน:`
                );
                
                const selectedIndex = parseInt(userSelectedColumn || '0') - 1;
                if (selectedIndex >= 0 && selectedIndex < fileHeaders.length) {
                    const selectedHeader = fileHeaders[selectedIndex];
                    columnMap[selectedHeader] = 'idcardnumber';
                    console.log(`ใช้คอลัมน์ "${selectedHeader}" เป็นเลขประจำตัวประชาชน`);
                } else {
                    setErrorMessage("ไม่ได้เลือกคอลัมน์เลขประจำตัวประชาชน กรุณาลองใหม่");
                    setShowProgressCard(false);
                    setLoading(false);
                    return;
                }
            }
            
            console.log("การตรวจสอบคอลัมน์: ผ่าน");

            const newExaminers: Omit<Examiner, 'examinerid'>[] = jsonData.map((row: any, index: number) => {
                const mappedRow: any = {};
                
                console.log(`\n=== แถวที่ ${index + 1} ===`);
                console.log('ข้อมูลดิบ:', row);
                
                // แมปคอลัมน์ตาม columnMap
                for (const excelHeader in row) {
                    if (excelHeader.startsWith('__EMPTY') || !excelHeader.trim()) {
                        continue;
                    }
                    
                    const cleanHeader = excelHeader.trim();
                    const cellValue = row[excelHeader];
                    
                    console.log(`ตรวจสอบคอลัมน์: "${cleanHeader}" = "${cellValue}"`);
                    
                    // ตรวจสอบการแมปแบบตรงเป็นหลัก
                    let mapped = false;
                    for (const mapKey in columnMap) {
                        if (cleanHeader === mapKey) {
                            const dbColumn = columnMap[mapKey];
                            mappedRow[dbColumn] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปแบบตรง "${cleanHeader}" -> "${dbColumn}" = "${cellValue}"`);
                            break;
                        }
                    }
                    
                    // หากไม่พบการแมปที่ตรงกัน ลองหาโดยดูคำสำคัญ
                    if (!mapped) {
                        // ตรวจสอบเลขประจำตัวประชาชน
                        if ((cleanHeader.includes('เลข') && cleanHeader.includes('ประชาชน')) ||
                            (cleanHeader.includes('บัตร') && cleanHeader.includes('ประชาชน')) ||
                            cleanHeader.toUpperCase().includes('ID') ||
                            cleanHeader.includes('รหัสประจำตัว')) {
                            mappedRow['idcardnumber'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (ID) "${cleanHeader}" -> idcardnumber = "${cellValue}"`);
                        }
                        // ตรวจสอบรอบสอบ
                        else if (cleanHeader.includes('รอบ') && cleanHeader.includes('สอบ')) {
                            mappedRow['sessionid'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (Session) "${cleanHeader}" -> sessionid = "${cellValue}"`);
                        }
                        // ตรวจสอบศูนย์สอบ/ห้องสอบ
                        else if ((cleanHeader.includes('ศูนย์') && cleanHeader.includes('สอบ')) ||
                                 (cleanHeader.includes('ห้อง') && cleanHeader.includes('สอบ'))) {
                            mappedRow['roomid'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (Room) "${cleanHeader}" -> roomid = "${cellValue}"`);
                        }
                        // ตรวจสอบชื่อ (ที่ไม่ใช่นามสกุล)
                        else if (cleanHeader === 'ชื่อ' || 
                                (cleanHeader.includes('ชื่อ') && !cleanHeader.includes('นาม') && 
                                 !cleanHeader.includes('สกุล') && !cleanHeader.includes('EN'))) {
                            mappedRow['firstname'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (FirstName) "${cleanHeader}" -> firstname = "${cellValue}"`);
                        }
                        // ตรวจสอบนามสกุล
                        else if (cleanHeader.includes('นามสกุล') || 
                                (cleanHeader.includes('ชื่อ') && cleanHeader.includes('สกุล'))) {
                            mappedRow['lastname'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (LastName) "${cleanHeader}" -> lastname = "${cellValue}"`);
                        }
                        // ตรวจสอบเพศ
                        else if (cleanHeader.includes('เพศ')) {
                            mappedRow['gender'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (Gender) "${cleanHeader}" -> gender = "${cellValue}"`);
                        }
                        // ตรวจสอบเบอร์โทร
                        else if (cleanHeader.includes('โทร') || cleanHeader.includes('เบอร์')) {
                            mappedRow['phone'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (Phone) "${cleanHeader}" -> phone = "${cellValue}"`);
                        }
                        // ตรวจสอบอีเมล
                        else if (cleanHeader.includes('อีเมล') || cleanHeader.toUpperCase().includes('EMAIL')) {
                            mappedRow['email'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (Email) "${cleanHeader}" -> email = "${cellValue}"`);
                        }
                        // ตรวจสอบสัญชาติ
                        else if (cleanHeader.includes('สัญชาติ') || cleanHeader.includes('ชาติ')) {
                            mappedRow['nationality'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (Nationality) "${cleanHeader}" -> nationality = "${cellValue}"`);
                        }
                        // ตรวจสอบความต้องการพิเศษ
                        else if (cleanHeader.includes('ความต้องการพิเศษ') || cleanHeader.includes('ข้อกำหนดพิเศษ')) {
                            mappedRow['specialneeds'] = cellValue;
                            mapped = true;
                            console.log(`✓ แมปโดยคำสำคัญ (Special Needs) "${cleanHeader}" -> specialneeds = "${cellValue}"`);
                        }
                    }
                    
                    if (!mapped) {
                        console.log(`⚠ ไม่สามารถแมปคอลัมน์ "${cleanHeader}" ได้`);
                    }
                }

                console.log('ผลการแมปทั้งหมด:', mappedRow);

                // จัดการเลขประจำตัวประชาชน
                let idcardnumber: string = '';
                const idCardRaw = mappedRow.idcardnumber;

                if (typeof idCardRaw === 'number') {
                    idcardnumber = String(idCardRaw);
                    if (idcardnumber.includes('e') || idcardnumber.includes('E')) {
                        console.warn(`[คำเตือน] เลขประจำตัวประชาชนแถวที่ ${index + 1} อยู่ในรูปแบบ Scientific Notation: ${idCardRaw}`);
                        console.warn("แนะนำให้แปลงคอลัมน์เป็น 'Text' ใน Excel ก่อนการ Import");
                    }
                } else if (typeof idCardRaw === 'string') {
                    idcardnumber = idCardRaw.trim();
                } else if (idCardRaw !== undefined && idCardRaw !== null) {
                    idcardnumber = String(idCardRaw).trim();
                }

                // จัดการชื่อภาษาอังกฤษ - รวม NameMidEN เข้ากับ firstnameeng
                let firstnameeng = String(mappedRow.firstnameeng || '').trim();
                // eslint-disable-next-line prefer-const
                let middlenameeng = String(mappedRow.middlenameeng || '').trim();
                // eslint-disable-next-line prefer-const
                let lastnameeng = String(mappedRow.lastnameeng || '').trim();
                
                // รวมชื่อกลางเข้ากับชื่อ (ถ้ามี)
                if (middlenameeng && firstnameeng) {
                    firstnameeng = `${firstnameeng} ${middlenameeng}`;
                } else if (middlenameeng && !firstnameeng) {
                    firstnameeng = middlenameeng;
                }

                // ตรวจสอบข้อมูลที่จำเป็น
                const requiredFields = {
                    idcardnumber: idcardnumber,
                    firstname: String(mappedRow.firstname || '').trim(),
                    lastname: String(mappedRow.lastname || '').trim()
                };

                console.log(`ข้อมูลที่จำเป็น:`, requiredFields);

                const examinerData: Omit<Examiner, 'examinerid'> = {
                    sessionid: mappedRow.sessionid !== undefined && mappedRow.sessionid !== null && mappedRow.sessionid !== '' ? Number(mappedRow.sessionid) : null,
                    roomid: mappedRow.roomid !== undefined && mappedRow.roomid !== null && mappedRow.roomid !== '' ? Number(mappedRow.roomid) : null,
                    idcardnumber: idcardnumber,
                    title: String(mappedRow.title || '').trim(),
                    firstname: requiredFields.firstname,
                    lastname: requiredFields.lastname,
                    gender: String(mappedRow.gender || '').trim(),
                    titleeng: String(mappedRow.titleeng || '').trim(),
                    firstnameeng: firstnameeng,
                    lastnameeng: lastnameeng,
                    phone: String(mappedRow.phone || '').trim(), // อนุญาตให้ว่างได้
                    email: String(mappedRow.email || '').trim(),
                    specialneeds: String(mappedRow.specialneeds || '').trim(),
                    nationality: String(mappedRow.nationality || 'ไทย').trim(),
                };

                console.log(`ข้อมูลสุดท้าย:`, examinerData);
                return examinerData;
            }).filter((ex, index) => {
                // ตรวจสอบข้อมูลที่จำเป็นต้องมี (ไม่รวม phone และ NameMidEN)
                if (!ex.idcardnumber || ex.idcardnumber.trim() === '') {
                    console.warn(`❌ แถวที่ ${index + 1} ไม่มีเลขประจำตัวประชาชน จะถูกข้าม`);
                    return false;
                }
                if (!ex.firstname || ex.firstname.trim() === '') {
                    console.warn(`❌ แถวที่ ${index + 1} ไม่มีชื่อ จะถูกข้าม`);
                    return false;
                }
                if (!ex.lastname || ex.lastname.trim() === '') {
                    console.warn(`❌ แถวที่ ${index + 1} ไม่มีนามสกุล จะถูกข้าม`);
                    return false;
                }
                
                console.log(`✅ แถวที่ ${index + 1} ผ่านการตรวจสอบ`);
                return true;
            });

            console.log("ข้อมูลที่แมปแล้วและพร้อมบันทึก:", newExaminers);

            if (newExaminers.length === 0) {
                setErrorMessage("ไม่พบข้อมูลที่ถูกต้อง กรุณาตรวจสอบ:\n1. หัวข้อคอลัมน์ต้องตรงกับรูปแบบที่กำหนด\n2. คอลัมน์ 'เลขประจำตัวประชาชน', 'ชื่อ', 'นามสกุล' ต้องไม่ว่างเปล่า\n3. คอลัมน์ 'NameMidEN' และ 'เบอร์โทร' สามารถว่างได้");
                setShowProgressCard(false);
                setLoading(false);
                return;
            }

            setProgressMessage(`กำลังบันทึก ${newExaminers.length} รายการลงฐานข้อมูล...`);
            
            // จำลองความคืบหน้า
            for (let i = 0; i < 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 50));
                setProgressValue(Math.min(i, 99));
            }

            const { error } = await supabase
                .from('examiner')
                .insert(newExaminers);

            if (error) {
                console.error('เกิดข้อผิดพลาดในการบันทึก:', error);
                setErrorMessage(`เกิดข้อผิดพลาดในการบันทึกข้อมูล: ${error.message}`);
                setShowProgressCard(false);
            } else {
                // ดึงข้อมูลล่าสุดมาแสดง
                const { data: updatedData, error: fetchError } = await supabase
                    .from('examiner')
                    .select('*')
                    .order('examinerid', { ascending: true });
                    
                if (updatedData) setExaminers(updatedData);
                if (fetchError) setErrorMessage(`เกิดข้อผิดพลาดในการดึงข้อมูลอัปเดต: ${fetchError.message}`);

                setProgressValue(100);
                setProgressMessage(`นำเข้าข้อมูลสำเร็จ ${newExaminers.length} รายการ!`);
                alert(`นำเข้าข้อมูลผู้เข้าสอบสำเร็จ ${newExaminers.length} รายการ!`);
                setTimeout(() => setShowProgressCard(false), 1500);
                window.location.reload();
            }
        } catch (err: any) {
            console.error('เกิดข้อผิดพลาดในการประมวลผลไฟล์:', err);
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
        setProgressMessage('กำลังเตรียมข้อมูลสำหรับส่งออก...');
        setLoading(true);

        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress <= 100) {
                setProgressValue(Math.min(progress, 90));
            } else {
                clearInterval(interval);

                try {
                    setProgressMessage('กำลังสร้างไฟล์ Excel...');

                    // ใช้หัวข้อคอลัมน์เหมือนกับที่ใช้ใน Import ตามรูปภาพ
                    const dataToExport = examiners.map(examiner => {
                        const sessionValue = examiner.sessionid !== null && examiner.sessionid !== undefined ? examiner.sessionid : '';
                        const roomValue = examiner.roomid !== null && examiner.roomid !== undefined ? examiner.roomid : '';

                        return {
                            'เลขประจำตัวประชาชน': examiner.idcardnumber || '',
                            'รอบสอบ': sessionValue,
                            'ศูนย์สอบ': roomValue,
                            'คำนำหน้า': examiner.title || '',
                            'ชื่อ': examiner.firstname || '',
                            'นามสกุล': examiner.lastname || '',
                            'เพศ': examiner.gender || '',
                            'Name1EN': examiner.titleeng || '',
                            'Name2EN': examiner.firstnameeng || '',
                            'NameMidEN': '', // เว้นว่างไว้สำหรับชื่อกลาง
                            'Name3EN': examiner.lastnameeng || '',
                            'เบอร์โทร': examiner.phone || '', // อนุญาตให้ว่างได้
                            'อีเมล': examiner.email || '',
                            'ความต้องการพิเศษ': examiner.specialneeds || '',
                            'สัญชาติ': examiner.nationality || 'ไทย',
                        };
                    });

                    console.log('ข้อมูลที่จะส่งออก:', dataToExport);

                    // สร้าง worksheet
                    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

                    // ปรับความกว้างคอลัมน์
                    const columnWidths = [
                        { wch: 18 }, // เลขประจำตัวประชาชน
                        { wch: 10 }, // รอบสอบ
                        { wch: 10 }, // ศูนย์สอบ
                        { wch: 12 }, // คำนำหน้า
                        { wch: 15 }, // ชื่อ
                        { wch: 15 }, // นามสกุล
                        { wch: 8 },  // เพศ
                        { wch: 10 }, // Name1EN
                        { wch: 15 }, // Name2EN
                        { wch: 15 }, // NameMidEN
                        { wch: 15 }, // Name3EN
                        { wch: 15 }, // เบอร์โทร
                        { wch: 20 }, // อีเมล
                        { wch: 20 }, // ความต้องการพิเศษ
                        { wch: 10 }, // สัญชาติ
                    ];
                    worksheet['!cols'] = columnWidths;

                    // สร้าง workbook
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'ข้อมูลผู้เข้าสอบ');

                    // สร้างชื่อไฟล์พร้อมวันที่
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    }).replace(/\//g, '-');
                    const timeStr = now.toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    }).replace(/:/g, '');
                    
                    const fileName = `รายชื่อผู้เข้าสอบ_${dateStr}_${timeStr}.xlsx`;

                    setProgressMessage('กำลังบันทึกไฟล์...');
                    
                    // บันทึกไฟล์
                    XLSX.writeFile(workbook, fileName);

                    setProgressValue(100);
                    setProgressMessage(`ส่งออกข้อมูลสำเร็จ ${examiners.length} รายการ!`);
                    alert(`ส่งออกข้อมูลผู้เข้าสอบสำเร็จ ${examiners.length} รายการ!\nชื่อไฟล์: ${fileName}`);
                    
                    setTimeout(() => setShowProgressCard(false), 2000);
                    
                } catch (error: any) {
                    console.error('เกิดข้อผิดพลาดในการส่งออก:', error);
                    setErrorMessage(`เกิดข้อผิดพลาดในการส่งออกไฟล์: ${error.message}`);
                    setProgressMessage('ส่งออกไฟล์ล้มเหลว');
                    setTimeout(() => setShowProgressCard(false), 2000);
                } finally {
                    setLoading(false);
                }
            }
        }, 100);
    };

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