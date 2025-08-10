// components/ActionButtonsExam.tsx
import { FileDown, FileUp } from 'lucide-react';
import React from 'react';
import { motion } from 'framer-motion';

type ActionButtonsProps = {
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export default function ActionButtonsExam({ onExport, onImport }: ActionButtonsProps) {
    return (
        <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
                <motion.div whileHover={{ y: 5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)" }}>
                <label htmlFor="excel-upload" className="flex items-center cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-[10px]">
                    <FileUp className='mx-3'/>
                    นำเข้า
                    <input
                        type="file"
                        id="excel-upload"
                        accept=".xlsx, .xls"
                        onChange={onImport}
                        className="hidden"
                    />
                </label>
                </motion.div>
                <motion.div whileHover={{ y: 5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)" }}>
                <button
                    onClick={onExport}
                    className="bg-rose-400 flex hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-[10px]"
                >
                    <FileDown className='mx-3'/>
                    ส่งออก
                </button>
                </motion.div>
            </div>
        </div>
    );
}