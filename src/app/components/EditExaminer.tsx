import React from 'react';
import { Examiner } from '../components/Exam_List'; // นำเข้า Type Examiner
import { Save, X } from 'lucide-react';

type EditExaminerModalProps = {
    examiner: Examiner;
    onSave: () => void;
    onClose: () => void;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    loading: boolean; // เพิ่ม prop loading
    errorMessage: string; // เพิ่ม prop errorMessage
};

export default function EditExaminerModal({
    examiner,
    onSave,
    onClose,
    onInputChange,
    loading,
    errorMessage,
}: EditExaminerModalProps) {
    return (
        <div className="fixed inset-0 bg-tranparent backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-indigo-800 to-sky-600 p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">แก้ไขข้อมูลผู้เข้าสอบ: {examiner.firstname} {examiner.lastname}</h2>

                {errorMessage && <p className="text-red-300 mb-4 text-center">{errorMessage}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Row 1: ชื่อ-สกุลไทย */}
                    <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 mb-2">
                        <label className="flex-1 min-w-[80px] text-white text-sm font-semibold mb-1">
                            คำนำหน้า (ไทย):
                            <input
                                type="text"
                                name="title"
                                value={examiner.title || ''}
                                onChange={onInputChange}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                            />
                        </label>
                        <label className="flex-1 min-w-[120px] text-white text-sm font-semibold mb-1">
                            ชื่อ (ไทย):
                            <input
                                type="text"
                                name="firstname"
                                value={examiner.firstname || ''}
                                onChange={onInputChange}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                            />
                        </label>
                        <label className="flex-1 min-w-[120px] text-white text-sm font-semibold mb-1">
                            นามสกุล (ไทย):
                            <input
                                type="text"
                                name="lastname"
                                value={examiner.lastname || ''}
                                onChange={onInputChange}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                            />
                        </label>
                    </div>

                    {/* Row 2: ชื่อ-สกุลอังกฤษ */}
                    <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 mb-2">
                        <label className="flex-1 min-w-[80px] text-white text-sm font-semibold mb-1">
                            คำนำหน้า (อังกฤษ):
                            <input
                                type="text"
                                name="titleeng"
                                value={examiner.titleeng || ''}
                                onChange={onInputChange}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                            />
                        </label>
                        <label className="flex-1 min-w-[120px] text-white text-sm font-semibold mb-1">
                            ชื่อ (อังกฤษ):
                            <input
                                type="text"
                                name="firstnameeng"
                                value={examiner.firstnameeng || ''}
                                onChange={onInputChange}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                            />
                        </label>
                        <label className="flex-1 min-w-[120px] text-white text-sm font-semibold mb-1">
                            นามสกุล (อังกฤษ):
                            <input
                                type="text"
                                name="lastnameeng"
                                value={examiner.lastnameeng || ''}
                                onChange={onInputChange}
                                className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                            />
                        </label>
                    </div>

                    {/* Row 3: รอบสอบ, ห้องสอบ, เพศ, สัญชาติ */}
                    <label className="block text-white text-sm font-semibold mb-2">
                        รอบสอบ:
                        <input
                            type="number"
                            name="sessionid"
                            value={examiner.sessionid || ''}
                            onChange={onInputChange}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                        />
                    </label>
                    <label className="block text-white text-sm font-semibold mb-2">
                        ห้องสอบ:
                        <input
                            type="number"
                            name="roomid"
                            value={examiner.roomid || ''}
                            onChange={onInputChange}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                        />
                    </label>
                    <label className="block text-white text-sm font-semibold mb-2">
                        เพศ:
                        <input
                            type="text"
                            name="gender"
                            value={examiner.gender || ''}
                            onChange={onInputChange}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                        />
                    </label>
                    <label className="block text-white text-sm font-semibold mb-2">
                        สัญชาติ:
                        <input
                            type="text"
                            name="nationality"
                            value={examiner.nationality || ''}
                            onChange={onInputChange}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                        />
                    </label>

                    {/* Row 4: เลขบัตรประชาชน, เบอร์ติดต่อ, อีเมล */}
                    <label className="block text-white text-sm font-semibold mb-2">
                        เลขบัตรประชาชน:
                        <input
                            type="text"
                            name="idcardnumber"
                            value={examiner.idcardnumber || ''}
                            onChange={onInputChange}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                        />
                    </label>
                    <label className="block text-white text-sm font-semibold mb-2">
                        เบอร์ติดต่อ:
                        <input
                            type="text"
                            name="phone"
                            value={examiner.phone || ''}
                            onChange={onInputChange}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                        />
                    </label>
                    <label className="block text-white text-sm font-semibold mb-2">
                        อีเมล:
                        <input
                            type="email"
                            name="email"
                            value={examiner.email || ''}
                            onChange={onInputChange}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-white"
                        />
                    </label>

                    {/* Row 5: ความต้องการพิเศษ */}
                    <label className="col-span-1 md:col-span-2 block text-white text-sm font-semibold mb-2">
                        ความต้องการพิเศษ:
                        <textarea
                            name="specialneeds"
                            value={examiner.specialneeds || ''}
                            onChange={onInputChange}
                            rows={3}
                            className="mt-1 block w-full p-2 border border-gray-600 rounded-md shadow-sm bg-gray-400 text-yellow-300 resize-y"
                        ></textarea>
                    </label>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onSave}
                        className="bg-green-600 hover:bg-green-700 flex text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                        disabled={loading} // ปิดการใช้งานปุ่มขณะโหลด
                    >
                        <Save className=''/>
                        {loading ? 'กำลังบันทึก...' : ''}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
                        disabled={loading} // ปิดการใช้งานปุ่มขณะโหลด
                    >
                        <X className='item-center'/>
                    </button>
                </div>
            </div>
        </div>
    );
}