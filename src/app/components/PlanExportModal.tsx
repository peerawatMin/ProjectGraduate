/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { supabase } from '../../lib/supabaseClient';
import { SavedPlan, ExamRoomAllocation } from '@/types/examTypes';
import { toast } from 'react-toastify';

type ExamSession = {
  session_id: string;
  exam_date: string;       // YYYY-MM-DD (หรือรูปแบบ string จาก DB)
  exam_start_time: string; // HH:mm
  exam_end_time: string;   // HH:mm
};

type Props = {
  plan: SavedPlan;
  examSession?: ExamSession | null;
  onClose: () => void;
};

const patternTH = (pattern: string) => {
  switch (pattern) {
    case 'single_row': return 'แถวเดี่ยว';
    case 'zigzag': return 'สลับฟันปลา';
    case 'checkerboard': return 'หมากรุกดำ';
    case 'diagonal': return 'แนวทแยง';
    case 'spiral': return 'เกลียวหอย';
    case 'random': return 'สุ่ม';
    case 'sequential': return 'จัดตามลำดับ';
    default: return pattern;
  }
};

export default function PlanExportModal({ plan, examSession, onClose }: Props) {
  // ✅ แก้ชนิด ref ให้ถูกต้อง — อ้างอิง <canvas> ที่ QRCodeCanvas สร้างขึ้น
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadedPngUrl, setUploadedPngUrl] = useState<string | null>(null);
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/plans/${plan.seatpid}`;
  }, [plan.seatpid]);

  const totalArrangedSeats = useMemo(() => {
    if (!Array.isArray(plan.arrangement_data)) return 0;
    return (plan.arrangement_data as ExamRoomAllocation[])
      .reduce((sum, r) => sum + (r?.allocatedSeats ?? 0), 0);
  }, [plan.arrangement_data]);

  const getCanvasOrWarn = useCallback((): HTMLCanvasElement | null => {
    const canvas = qrRef.current;
    if (!canvas) toast.error('ไม่พบแคนวาสของ QR');
    return canvas;
  }, []);

  const downloadPNG = useCallback(() => {
    const canvas = getCanvasOrWarn();
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${plan.seatpid}.png`;
    a.click();
  }, [getCanvasOrWarn, plan.seatpid]);

  const buildPDF = useCallback((qrDataUrl?: string) => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(plan.plan_name || 'แผนที่นั่งสอบ', 14, 18);

    doc.setFontSize(11);
    const lines: string[] = [
      `รหัสแผน: ${plan.seatpid}`,
      `รูปแบบ: ${patternTH(plan.seating_pattern)}`,
      `ขนาดห้อง: ${plan.room_rows} × ${plan.room_cols}`,
      `ผู้เข้าสอบ: ${plan.total_examinees ?? 0} คน`,
      `จัดที่นั่งแล้ว: ${plan.exam_count ?? 0} คน`,
      `รวมที่จัด: ${totalArrangedSeats} ที่นั่ง`,
    ];
    if (plan.exam_room_name) lines.push(`ห้องสอบ: ${plan.exam_room_name}`);
    if (examSession) {
      lines.push(
        `วันที่สอบ: ${examSession.exam_date}`,
        `เวลา: ${examSession.exam_start_time} - ${examSession.exam_end_time}`
      );
    }
    if (plan.exam_room_description) lines.push(`หมายเหตุ: ${plan.exam_room_description}`);

    let y = 28;
    lines.forEach((l) => { doc.text(l, 14, y); y += 7; });

    if (qrDataUrl) {
      doc.addImage(qrDataUrl, 'PNG', 140, 20, 50, 50);
    }
    doc.setTextColor(0, 0, 255);
    doc.textWithLink(shareUrl, 14, y + 4, { url: shareUrl });
    doc.setTextColor(0, 0, 0);

    return doc;
  }, [examSession, plan, shareUrl, totalArrangedSeats]);

  const downloadPDF = useCallback(() => {
    const canvas = getCanvasOrWarn();
    if (!canvas) return;
    const qrDataUrl = canvas.toDataURL('image/png');
    const doc = buildPDF(qrDataUrl);
    doc.save(`plan-${plan.seatpid}.pdf`);
  }, [buildPDF, getCanvasOrWarn, plan.seatpid]);

  const dataURLtoBlob = (dataUrl: string) => {
    const [header, b64] = dataUrl.split(',');
    const mime = header.match(/data:(.*?);/)?.[1] ?? 'image/png';
    const bin = atob(b64);
    const u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new Blob([u8], { type: mime });
  };

  const uploadToSupabase = useCallback(async () => {
    const canvas = getCanvasOrWarn();
    if (!canvas) return;

    try {
      setUploading(true);

      // 1) อัป PNG (QR)
      const pngDataUrl = canvas.toDataURL('image/png');
      const pngBlob = dataURLtoBlob(pngDataUrl);
      const pngPath = `qr/${plan.seatpid}.png`;

      const up1 = await supabase.storage
        .from('exports')
        .upload(pngPath, pngBlob, { upsert: true, contentType: 'image/png' });
      if (up1.error) throw up1.error;

      const { data: pub1 } = supabase.storage.from('exports').getPublicUrl(pngPath);
      setUploadedPngUrl(pub1.publicUrl);

      // 2) อัป PDF
      const doc = buildPDF(pngDataUrl);
      const pdfBlob = new Blob([doc.output('arraybuffer')], { type: 'application/pdf' });
      const pdfPath = `pdf/plan-${plan.seatpid}.pdf`;

      const up2 = await supabase.storage
        .from('exports')
        .upload(pdfPath, pdfBlob, { upsert: true, contentType: 'application/pdf' });
      if (up2.error) throw up2.error;

      const { data: pub2 } = supabase.storage.from('exports').getPublicUrl(pdfPath);
      setUploadedPdfUrl(pub2.publicUrl);

      toast.success('อัปโหลด QR และ PDF สำเร็จ');
    } catch (err: any) {
      toast.error(`อัปโหลดไม่สำเร็จ: ${err?.message ?? err}`);
    } finally {
      setUploading(false);
    }
  }, [buildPDF, getCanvasOrWarn, plan.seatpid]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
         role="dialog" aria-modal="true" aria-label="ส่งออกแผนที่นั่งสอบ">
      <div className="w-full max-w-lg bg-white rounded-2xl p-5 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold">แชร์/ส่งออกแผน: {plan.plan_name}</h3>
          <button className="text-gray-500 hover:text-black" onClick={onClose} aria-label="ปิด">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ฝั่ง QR + ดาวน์โหลด */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">ลิงก์แชร์</p>
            <a className="text-blue-600 break-all underline"
               href={shareUrl} target="_blank" rel="noreferrer">
              {shareUrl}
            </a>

            <div className="mt-4 flex items-center justify-center">
              {/* ✅ ref เป็น HTMLCanvasElement */}
              <QRCodeCanvas value={shareUrl} size={220} level="M" includeMargin ref={qrRef} />
            </div>

            <div className="mt-3 flex gap-2">
              <button
                onClick={downloadPNG}
                className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-800"
                aria-label="ดาวน์โหลด PNG QR"
              >
                ดาวน์โหลด PNG
              </button>
              <button
                onClick={downloadPDF}
                className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                aria-label="ดาวน์โหลด PDF"
              >
                ดาวน์โหลด PDF
              </button>
            </div>
          </div>

          {/* ฝั่งอัปโหลดขึ้น Supabase */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">อัปโหลดขึ้น Supabase Storage</p>
            <button
              disabled={uploading}
              onClick={uploadToSupabase}
              className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-60"
              aria-label="อัปโหลด PNG และ PDF ไปยัง Supabase"
            >
              {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลด PNG + PDF'}
            </button>

            {uploadedPngUrl && (
              <div className="mt-3 text-sm">
                ✅ PNG:{' '}
                <a href={uploadedPngUrl} target="_blank" rel="noreferrer"
                   className="text-blue-600 underline break-all">
                  {uploadedPngUrl}
                </a>
              </div>
            )}
            {uploadedPdfUrl && (
              <div className="mt-1 text-sm">
                ✅ PDF:{' '}
                <a href={uploadedPdfUrl} target="_blank" rel="noreferrer"
                   className="text-blue-600 underline break-all">
                  {uploadedPdfUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 text-xs text-gray-500">
          *ตรวจสอบว่าได้สร้าง bucket ชื่อ <code>exports</code> และตั้ง Public (หรือใช้ Signed URL ตามนโยบาย)
        </div>
      </div>
    </div>
  );
}
