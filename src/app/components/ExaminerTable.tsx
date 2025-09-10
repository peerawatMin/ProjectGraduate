import React from 'react';
import { Examiner } from '../components/Exam_List'; // นำเข้า Type Examiner

type ExaminerTableProps = {
    examiners: Examiner[];
    onDelete: (examinerId: number) => void;
};

export default function ExaminerTable({ examiners }: ExaminerTableProps) {
    return (
        <div className="overflow-x-auto bg-gradient-to-r from-indigo-800 to-sky-600 shadow-md rounded-lg">
            <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-t from-sky-600 to-blue-800">
                    <tr>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">ลำดับ</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">รหัสประจำตัวผู้สอบ</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">ชื่อ-นามสกุล</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">เพศ</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">สัญชาติ</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">บัตรประชาชน</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">Title</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">Firstname</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">Mid Name</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">Lastname </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">เบอร์ติดต่อ</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">อีเมล</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-white uppercase tracking-wider">ความต้องการพิเศษ</th>
                    </tr>
                </thead>
                <tbody className="bg-gradient-to-t from-sky-600 to-blue-700 divide-y divide-gray-200">
                    {examiners.map((examiner) => (
                        <tr key={examiner.examinerid}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{examiner.examinerid}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{examiner.examinee_number || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-white">{examiner.title} {examiner.firstname} {examiner.lastname}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.gender || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.nationality || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.idcardnumber}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.titleeng || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.firstnameeng || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.middlenameeng || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.lastnameeng || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.phone || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm text-white">{examiner.email || '-'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-center text-sm">
                                {examiner.specialneeds ? <span className="text-yellow-400">{examiner.specialneeds}</span> : <span className="text-white"> - </span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
