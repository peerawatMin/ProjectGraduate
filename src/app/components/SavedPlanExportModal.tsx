/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { SavedPlan, ExamRoomAllocation } from '@/types/examTypes';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'react-toastify';
import {
  QrCode, Download, Upload, Save, LayoutGrid, Square,
  Building2, ChevronDown, ChevronUp, Check, Search, BarChart2
} from 'lucide-react';

export type ExamSessionLite = {
  session_id: string;
  session_name?: string;
  exam_date: string;
  exam_start_time: string;
  exam_end_time: string;
} | null;

type Props = {
  plan: SavedPlan;
  examSession?: ExamSessionLite; // kept for compatibility (not used)
  onClose: () => void;
  onSaved?: (u: { pngUrl?: string; qrUrl?: string; roomPngUrl?: string }) => void;
};

/* ===== ใช้ ENV สำหรับลิงก์ที่จะแชร์ (ดีที่สุด) ===== */
const SHARE_BASE = process.env.NEXT_PUBLIC_SHARE_BASE_URL ?? '';

/* -------------------- Helpers -------------------- */
function explainError(e: any): string {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e.message) return e.message;
  if (e.error?.message) return e.error.message;
  if (e.data?.message) return e.data.message;
  if (e.statusText) return `${e.status} ${e.statusText}`;
  try { return JSON.stringify(e); } catch { return String(e); }
}

type LooseExaminer = {
  firstname?: string; lastname?: string; first_name?: string; last_name?: string;
  student_code?: string; studentCode?: string; id?: string;
};
const pickExaminer = (e?: unknown) => {
  const ex = (e ?? {}) as LooseExaminer;
  return {
    firstname: ex.firstname ?? ex.first_name ?? '',
    lastname:  ex.lastname  ?? ex.last_name  ?? '',
    student:   ex.student_code ?? ex.studentCode ?? ex.id ?? '',
  };
};

/** normalize arrangement_data */
function normalizeAllocations(input: unknown): ExamRoomAllocation[] {
  let data: unknown = input;
  try { if (typeof input === 'string') data = JSON.parse(input); } catch {}
  if (!Array.isArray(data)) return [];
  const arr = (data as any[]).filter((a) => a?.room?.id && Array.isArray(a?.seatArrangement));
  return arr.map((a) => ({
    ...a,
    allocatedSeats: Number(a.allocatedSeats ?? a.seatArrangement?.length ?? 0),
    room: { ...a.room, name: a.room?.name ?? a.room?.id, totalSeats: Number(a.room?.totalSeats ?? a.seatArrangement?.length ?? 0) },
    seatArrangement: a.seatArrangement.map((s: any, i: number) => ({
      ...s,
      gridRow: Number(s.gridRow ?? 0), gridCol: Number(s.gridCol ?? 0),
      seat_number: s.seat_number ?? s.seatNumber ?? i + 1,
    })),
  })) as ExamRoomAllocation[];
}

/** order seats + continuous numbering across rooms */
const seatComparator = (a: any, b: any) => {
  const an = a.seat_number ?? a.seatNumber; const bn = b.seat_number ?? b.seatNumber;
  if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
  if (a.gridRow !== b.gridRow) return a.gridRow - b.gridRow;
  return a.gridCol - b.gridCol;
};
function withContinuousNumbers(allocs: ExamRoomAllocation[]) {
  const byRoom = [...allocs].sort((a, b) => (a.room.name || a.room.id).localeCompare(b.room.name || b.room.id));
  let counter = 0;
  return byRoom.map(a => {
    const ordered = [...a.seatArrangement].sort(seatComparator);
    return { ...a, seatArrangement: ordered.map(s => ({ ...s, __displayIndex: ++counter })) };
  });
}

const slugify = (s: string) =>
  (s || 'room').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

/* -------------------- Buttons -------------------- */
type IconCmp = React.ComponentType<{ className?: string }>;

function IconButton(props: {
  title: string;
  icon: IconCmp;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'solid' | 'ghost';
}) {
  const { title, icon: Icon, onClick, disabled, variant = 'ghost' } = props;
  const base =
    'group inline-flex items-center justify-center rounded-xl h-10 w-10 transition-all outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]';
  const style =
    variant === 'solid'
      ? 'bg-gradient-to-tr from-indigo-700 to-sky-600 text-white hover:from-indigo-600 hover:to-sky-500 focus:ring-indigo-500 shadow-sm hover:shadow-md'
      : 'bg-white text-gray-700 border hover:bg-gray-50 focus:ring-indigo-500 shadow-sm hover:shadow-md';
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${style} disabled:opacity-60`}
    >
      <Icon className="h-5 w-5 transition-transform group-hover:-translate-y-[1px]" />
    </button>
  );
}

function PrimaryButton(props: {
  title?: string;
  children?: React.ReactNode;
  icon?: IconCmp;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'gradient' | 'green' | 'outline';
}) {
  const { title, children, icon: Icon, onClick, disabled, variant = 'gradient' } = props;
  const base =
    'group inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]';
  const styles: Record<string, string> = {
    gradient:
      'text-white bg-gradient-to-tr from-indigo-700 to-sky-600 hover:from-indigo-600 hover:to-sky-500 focus:ring-indigo-500 shadow-sm hover:shadow-md',
    green: 'text-white bg-gradient-to-tr from-emerald-700 to-green-600 hover:from-emerald-600 hover:to-green-500 focus:ring-emerald-500 shadow-sm hover:shadow-md',
    outline:
      'text-gray-800 bg-white border hover:bg-gray-50 focus:ring-indigo-500 shadow-sm hover:shadow-md',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${base} ${styles[variant]} disabled:opacity-60`}
    >
      {Icon && <Icon className="h-5 w-5 transition-transform group-hover:-translate-y-[1px]" />}
      {children && <span>{children}</span>}
    </button>
  );
}

/* -------------------- RoomSelect (ดรอปดาวน์พร้อม badge + progress) -------------------- */
type RoomItem = { id: string; name: string; stats?: { allocated: number; total: number } };

function useOutsideClick<T extends HTMLElement>(open: boolean, onClose: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', key);
    };
  }, [open, onClose]);
  return ref;
}

function RoomSelect({
  rooms,
  value,
  onChange,
  className = '',
}: {
  rooms: RoomItem[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState<string>(value);
  const ref = useOutsideClick<HTMLDivElement>(open, () => setOpen(false));

  useEffect(() => { setActive(value); }, [value]);

  const display = rooms.find(r => r.id === value)?.name ?? 'เลือกห้อง';
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return rooms;
    return rooms.filter(r => r.name.toLowerCase().includes(qq));
  }, [rooms, q]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    const idx = filtered.findIndex(r => r.id === active);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = filtered[Math.min(idx + 1, filtered.length - 1)];
      if (next) setActive(next.id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = filtered[Math.max(idx - 1, 0)];
      if (prev) setActive(prev.id);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active) { onChange(active); setOpen(false); }
    }
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-2 rounded-2xl border bg-white px-3 py-2 text-sm text-gray-800 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="เลือกห้อง"
      >
        <Building2 className="h-4 w-4 text-indigo-600" />
        <span className="max-w-[200px] truncate">{display}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-80 rounded-2xl border bg-white shadow-xl ring-1 ring-black/5 overflow-hidden"
          onKeyDown={onKeyDown}
        >
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-50">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ค้นหาห้อง…"
              className="w-full bg-transparent outline-none text-sm placeholder:text-gray-400"
            />
          </div>

          {/* List */}
          <div className="max-h-72 overflow-auto py-1">
            {filtered.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">ไม่พบห้องที่ตรงกับคำค้น</div>
            )}
            {filtered.map((r) => {
              const selected = r.id === value;
              const isActive = r.id === active;
              const allocated = r.stats?.allocated ?? 0;
              const total = r.stats?.total ?? 0;
              const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;

              return (
                <button
                  key={r.id}
                  type="button"
                  onMouseEnter={() => setActive(r.id)}
                  onClick={() => { onChange(r.id); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                    isActive ? 'bg-indigo-50' : 'bg-white'
                  } hover:bg-indigo-50`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{r.name}</span>
                      <span className="shrink-0 inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-2 py-[2px] text-[10px]">
                        {allocated}/{total}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-600 to-sky-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="pl-2">
                    {selected ? <Check className="h-4 w-4 text-indigo-600" /> : <BarChart2 className="h-4 w-4 text-gray-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------- Seat Maps -------------------- */
function SeatMapOneRoom({ allocation }: { allocation: ExamRoomAllocation }) {
  const getGrid = (a: ExamRoomAllocation) => {
    let r=0,c=0; a.seatArrangement.forEach((s: any) => { if (s.gridRow > r) r = s.gridRow; if (s.gridCol > c) c = s.gridCol; });
    return { rows: r + 1, cols: c + 1 };
  };
  const { rows, cols } = getGrid(allocation);
  const base = 56; // ขนาดฐานคงที่ (ไม่มี zoom)
  const cellSize = `clamp(36px, ${base}px, 88px)`;
  return (
    <div className="rounded-2xl border shadow-sm bg-white inline-block w-full">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-2xl">
        <div className="font-semibold">
          ห้อง: {allocation.room.name}{' '}
          <span className="text-sm text-gray-500">
            ({allocation.allocatedSeats}/{allocation.room.totalSeats})
          </span>
        </div>
      </div>
      <div className="p-4">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${cellSize})`,
            gridTemplateRows: `repeat(${rows}, ${cellSize})`,
          }}
        >
          {allocation.seatArrangement.map((seat: any) => {
            const occupied = !!seat.examiner;
            const ex = pickExaminer(seat.examiner);
            const displayNo = seat.__displayIndex ?? seat.seat_number;
            return (
              <div
                key={`${allocation.room.id}-${seat.gridRow}-${seat.gridCol}`}
                style={{ gridColumn: seat.gridCol + 1, gridRow: seat.gridRow + 1 }}
                className={`rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs text-center px-1 ${
                  occupied ? 'bg-[#ECFDF5] border-[#6EE7B7]' : 'bg-[#F9FAFB] border-[#D1D5DB]'
                } shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]`}
                title={occupied ? `${ex.firstname} ${ex.lastname}` : 'ที่นั่งว่าง'}
              >
                <div className="leading-tight">
                  <div className="font-semibold">{displayNo}</div>
                  {occupied && ex.student && (
                    <div className="truncate max-w-[70%] mx-auto">{ex.student}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2" style={{ background: '#ECFDF5', borderColor: '#6EE7B7' }} />
            <span>มีผู้เข้าสอบ</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2" style={{ background: '#F9FAFB', borderColor: '#D1D5DB' }} />
            <span>ว่าง</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeatMapAllRooms({ allocations }: { allocations: ExamRoomAllocation[] }) {
  if (!allocations?.length) {
    return <div className="p-8 text-center text-gray-500 bg-white rounded-xl border">ยังไม่มีข้อมูลแผนผังที่จัดไว้</div>;
  }
  const base = 56; // ขนาดฐานคงที่ (ไม่มี zoom)
  const cellSize = `clamp(36px, ${base}px, 88px)`;
  const getGrid = (a: ExamRoomAllocation) => {
    let r=0,c=0; a.seatArrangement.forEach((s: any)=>{ if(s.gridRow>r) r=s.gridRow; if(s.gridCol>c) c=s.gridCol; });
    return { rows:r+1, cols:c+1 };
  };
  return (
    <div className="space-y-6 bg-white">
      {allocations.map((alloc) => {
        const { rows, cols } = getGrid(alloc);
        return (
          <div key={alloc.room.id} className="rounded-2xl border shadow-sm bg-white inline-block w-full">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50 rounded-t-2xl">
              <div className="font-semibold">
                ห้อง: {alloc.room.name}{' '}
                <span className="text-sm text-gray-500">
                  ({alloc.allocatedSeats}/{alloc.room.totalSeats})
                </span>
              </div>
            </div>
            <div className="p-4">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${cols}, ${cellSize})`,
                  gridTemplateRows: `repeat(${rows}, ${cellSize})`,
                }}
              >
                {alloc.seatArrangement.map((seat: any) => {
                  const occupied = !!seat.examiner;
                  const ex = pickExaminer(seat.examiner);
                  const displayNo = seat.__displayIndex ?? seat.seat_number;
                  return (
                    <div
                      key={`${alloc.room.id}-${seat.gridRow}-${seat.gridCol}`}
                      style={{ gridColumn: seat.gridCol + 1, gridRow: seat.gridRow + 1 }}
                      className={`rounded-lg border-2 flex items-center justify-center text-[10px] sm:text-xs text-center px-1 ${
                        occupied ? 'bg-[#ECFDF5] border-[#6EE7B7]' : 'bg-[#F9FAFB] border-[#D1D5DB]'
                      } shadow-[inset_0_0_0_1px_rgba(0,0,0,0.02)]`}
                      title={occupied ? `${ex.firstname} ${ex.lastname}` : 'ที่นั่งว่าง'}
                    >
                      <div className="leading-tight">
                        <div className="font-semibold">{displayNo}</div>
                        {occupied && ex.student && (
                          <div className="truncate max-w-[70%] mx-auto">{ex.student}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{ background: '#ECFDF5', borderColor: '#6EE7B7' }} />
                  <span>มีผู้เข้าสอบ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2" style={{ background: '#F9FAFB', borderColor: '#D1D5DB' }} />
                  <span>ว่าง</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- Main -------------------- */
export default function SavedPlanExportModal({ plan, examSession, onClose, onSaved }: Props) {
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [uploaded, setUploaded] = useState<{ pngUrl?: string; qrUrl?: string; roomPngUrl?: string }>({});
  const [fitScale, setFitScale] = useState(1);
  const [viewMode, setViewMode] = useState<'single' | 'all'>('single');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  const shareUrl = useMemo(() => {
    let base =
      (SHARE_BASE && SHARE_BASE.trim()) ||
      (typeof window !== 'undefined' ? window.location.origin : '');
    if (!base) return '';
    base = base.replace(/\/+$/, '');
    return `${base}/plans/${encodeURIComponent(plan.seatpid)}`;
  }, [plan.seatpid]);

  useEffect(() => {
    if (!shareUrl) return;
    try {
      const u = new URL(shareUrl);
      const isLocal =
        u.hostname === 'localhost' ||
        u.hostname === '127.0.0.1' ||
        /^10\./.test(u.hostname) ||
        /^192\.168\./.test(u.hostname) ||
        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(u.hostname);
      if (isLocal) {
        toast.info('QR นี้อ้างอิงลิงก์ภายใน (localhost/LAN) — เปิดได้เฉพาะอุปกรณ์ที่เข้าถึงเครื่องนี้เท่านั้น');
      } else if (u.protocol !== 'https:') {
        toast.warn('แนะนำให้ใช้ HTTPS เพื่อให้เปิดจากมือถือได้เสถียร');
      }
    } catch {}
  }, [shareUrl]);

  const rawAllocations = useMemo<ExamRoomAllocation[]>(() => normalizeAllocations(plan.arrangement_data), [plan.arrangement_data]);
  const allocations = useMemo(() => withContinuousNumbers(rawAllocations), [rawAllocations]);

  const roomList = useMemo(
    () =>
      allocations.map((a) => ({
        id: a.room.id,
        name: a.room.name || a.room.id,
        stats: { allocated: a.allocatedSeats, total: a.room.totalSeats },
      })),
    [allocations]
  );

  useEffect(() => {
    if (!selectedRoomId && roomList.length) setSelectedRoomId(roomList[0].id);
  }, [roomList, selectedRoomId]);
  const selectedAlloc = useMemo(() => allocations.find((a) => a.room.id === selectedRoomId), [allocations, selectedRoomId]);

  /* fit-to-view (ไม่มี zoom แล้ว) */
  const recalcFit = useCallback(() => {
    const c = previewRef.current, n = contentRef.current; if (!c || !n) return;
    const { clientWidth: cw, clientHeight: ch } = c; const { scrollWidth: nw, scrollHeight: nh } = n;
    let scale = Math.min(1, (cw-8)/nw, (ch-8)/nh);
    if (!isFinite(scale) || scale <= 0) scale = 1;
    setFitScale(scale);
  }, []);
  useEffect(() => {
    recalcFit();
    const ro = new ResizeObserver(() => recalcFit());
    if (previewRef.current) ro.observe(previewRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    const t = setTimeout(recalcFit, 50);
    const t2 = setTimeout(recalcFit, 250);
    return () => { ro.disconnect(); clearTimeout(t); clearTimeout(t2); };
  }, [recalcFit, allocations, viewMode, selectedRoomId]);

  /* capture from contentRef */
  const captureCurrentPNG = useCallback(async (): Promise<string> => {
    if (!contentRef.current) throw new Error('ไม่พบคอนเทนเนอร์แผนผัง');
    try { // @ts-ignore
      if ((document as any).fonts?.ready) await (document as any).fonts.ready;
    } catch {}
    const pixelRatio = Math.max(2, (window.devicePixelRatio || 2));
    return await toPng(contentRef.current, {
      backgroundColor: '#ffffff',
      pixelRatio,
      cacheBust: true,
      style: {
        '--b1': '#ffffff',
        '--b2': '#f3f4f6',
        '--b3': '#e5e7eb',
        '--bc': '#1f2937',
        '--p': '#2563eb',
        '--pc': '#ffffff',
        '--s': '#10b981',
        '--sc': '#064e3b',
        '--a': '#f97316',
        '--ac': '#7c2d12',
        colorScheme: 'light',
        background: '#ffffff',
      } as any,
    });
  }, []);

  /* ===== plan_exports (PNG/QR) ===== */
  async function saveExportUrls({ pngUrl, qrUrl }: { pngUrl?: string; qrUrl?: string }) {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบ');
    const { error } = await supabase
      .from('plan_exports')
      .upsert({
        seatpid: plan.seatpid,
        user_id: user.id,
        plan_png_url: pngUrl ?? null,
        qr_png_url: qrUrl ?? null,
      });
    if (error) throw new Error(explainError(error));
  }

  /* download */
  const downloadPNG_CurrentView = useCallback(async () => {
    const url = await captureCurrentPNG();
    const a = document.createElement('a');
    const name =
      viewMode === 'single' && selectedAlloc
        ? `plan-${plan.seatpid}-${slugify(selectedAlloc.room.name)}.png`
        : `plan-${plan.seatpid}.png`;
    a.href = url;
    a.download = name;
    a.click();
  }, [captureCurrentPNG, plan.seatpid, selectedAlloc, viewMode]);

  const downloadQRPNG = useCallback(() => {
    if (!qrRef.current) return;
    const url = qrRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${plan.seatpid}.png`;
    a.click();
  }, [plan.seatpid]);

  /* upload current view (PNG) */
  const uploadCurrentView = useCallback(async () => {
    try {
      setBusy(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนอัปโหลด');
      const baseKey = `${user.id}/${plan.seatpid}`;

      const seatmapDataUrl = await captureCurrentPNG();
      const seatBlob = await (await fetch(seatmapDataUrl)).blob();
      const fileKey =
        viewMode === 'single' && selectedAlloc
          ? `rooms/${slugify(selectedAlloc.room.name)}.png`
          : 'plan.png';
      const up = await supabase.storage
        .from('exports')
        .upload(`${baseKey}/${fileKey}`, seatBlob, { upsert: true, contentType: 'image/png' });
      if (up.error) throw new Error(explainError(up.error));
      const { data: pub } = supabase.storage.from('exports').getPublicUrl(`${baseKey}/${fileKey}`);

      if (viewMode === 'single' && selectedAlloc) {
        setUploaded((u) => ({ ...u, roomPngUrl: pub.publicUrl }));
        toast.success('อัปโหลด PNG (ห้องนี้) สำเร็จ');
      } else {
        setUploaded((u) => ({ ...u, pngUrl: pub.publicUrl }));
        await saveExportUrls({ pngUrl: pub.publicUrl });
        toast.success('อัปโหลด PNG (ทั้งแผน) และบันทึก URL สำเร็จ');
      }
    } catch (e: any) {
      toast.error(explainError(e) || 'อัปโหลดไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }, [captureCurrentPNG, plan.seatpid, selectedAlloc, viewMode]);

  /* upload QR only */
  const uploadQR = useCallback(async () => {
    try {
      if (!qrRef.current) throw new Error('ไม่พบ QR');
      setBusy(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนอัปโหลด');
      const baseKey = `${user.id}/${plan.seatpid}`;

      const qrDataUrl = qrRef.current.toDataURL('image/png');
      const qrBlob = await (await fetch(qrDataUrl)).blob();
      const qrPath = `${baseKey}/qr.png`;
      const upQr = await supabase.storage
        .from('exports')
        .upload(qrPath, qrBlob, { upsert: true, contentType: 'image/png' });
      if (upQr.error) throw new Error(explainError(upQr.error));
      const { data: pubQr } = supabase.storage.from('exports').getPublicUrl(qrPath);

      setUploaded((u) => ({ ...u, qrUrl: pubQr.publicUrl }));
      await saveExportUrls({ qrUrl: pubQr.publicUrl });
      toast.success('อัปโหลด QR สำเร็จ');
    } catch (e: any) {
      toast.error(explainError(e) || 'อัปโหลด QR ไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }, [plan.seatpid]);

  /* one-click: PNG(current view) + QR + save */
  const createUploadAndSave = useCallback(async () => {
    try {
      setBusy(true);
      const { data: { user }, error: userErr } = await supabase.auth.getUser();
      if (userErr || !user) throw new Error('กรุณาเข้าสู่ระบบก่อนอัปโหลด');

      // PNG — ใช้มุมมองที่เห็น (single หรือ all)
      const seatmapDataUrl = await captureCurrentPNG();
      const seatBlob = await (await fetch(seatmapDataUrl)).blob();
      const seatPath = `${user.id}/${plan.seatpid}/plan.png`;
      const upPlan = await supabase.storage.from('exports').upload(seatPath, seatBlob, {
        upsert: true,
        contentType: 'image/png',
      });
      if (upPlan.error) throw new Error(`อัปโหลด plan.png ไม่สำเร็จ: ${explainError(upPlan.error)}`);
      const { data: pubPlan } = supabase.storage.from('exports').getPublicUrl(seatPath);

      // QR
      if (!qrRef.current) throw new Error('ไม่พบ QR');
      const qrDataUrl = qrRef.current.toDataURL('image/png');
      const qrBlob = await (await fetch(qrDataUrl)).blob();
      const qrPath = `${user.id}/${plan.seatpid}/qr.png`;
      const upQr = await supabase.storage.from('exports').upload(qrPath, qrBlob, {
        upsert: true,
        contentType: 'image/png',
      });
      if (upQr.error) throw new Error(`อัปโหลด qr.png ไม่สำเร็จ: ${explainError(upQr.error)}`);
      const { data: pubQr } = supabase.storage.from('exports').getPublicUrl(qrPath);

      await saveExportUrls({ pngUrl: pubPlan.publicUrl, qrUrl: pubQr.publicUrl });

      setUploaded({ pngUrl: pubPlan.publicUrl, qrUrl: pubQr.publicUrl });
      onSaved?.({ pngUrl: pubPlan.publicUrl, qrUrl: pubQr.publicUrl });
      toast.success('สร้าง & บันทึก (PNG + QR) สำเร็จ');
    } catch (e: any) {
      console.error('createUploadAndSave failed:', e, explainError(e));
      toast.error(explainError(e) || 'อัปโหลด/บันทึกไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  }, [captureCurrentPNG, plan.seatpid]);

  /* -------------------- UI -------------------- */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      {/* Card */}
      <div className="w-[90vw] max-w-[1200px] max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col ring-1 ring-black/5">
        {/* Header */}
        <div className="px-6 py-4 border-b text-white bg-gradient-to-tr from-indigo-800 to-sky-600 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold truncate">
            ส่งออกแผน: {plan.plan_name}
          </h3>
          <button
            className="text-white/90 hover:text-white text-2xl leading-none rounded-lg px-2 focus:outline-none focus:ring-2 focus:ring-white/60"
            onClick={onClose}
            aria-label="ปิด"
            title="ปิด"
          >
            ×
          </button>
        </div>

        {/* Toolbar (flex + wrap ป้องกันซ้อนทับ) */}
        <div className="px-6 py-3 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 sticky top-0 z-10">
          <div className="flex flex-wrap items-center gap-4">
            {/* Left: QR Box */}
            <div className="flex items-center gap-3 bg-white rounded-2xl p-2 border shadow-sm shrink-0">
              <div className="rounded-xl border p-2 bg-white shadow-sm">
                <QrCode className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                <QRCodeCanvas value={shareUrl || 'about:blank'} size={78} includeMargin level="M" ref={qrRef} />
              </div>
              <div className="flex items-center gap-2">
                <IconButton title="ดาวน์โหลด QR (PNG)" icon={Download} onClick={downloadQRPNG} disabled={!shareUrl} />
                <IconButton title="อัปโหลด QR" icon={Upload} onClick={uploadQR} disabled={!shareUrl || busy} />
              </div>
            </div>

            {/* Middle: View toggle + RoomSelect */}
            <div className="flex items-center gap-3 min-w-[320px] flex-1">
              <div className="inline-flex overflow-hidden rounded-2xl border bg-white shadow-sm shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('single')}
                  aria-pressed={viewMode === 'single'}
                  title="ดูทีละห้อง"
                  className={`px-3.5 py-2.5 text-sm inline-flex items-center gap-2 transition-colors ${
                    viewMode === 'single'
                      ? 'text-white bg-gradient-to-tr from-indigo-700 to-sky-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Square className="h-4 w-4" />
                  <span className="hidden sm:inline">ทีละห้อง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('all')}
                  aria-pressed={viewMode === 'all'}
                  title="ดูทุกห้อง"
                  className={`px-3.5 py-2.5 text-sm inline-flex items-center gap-2 border-l transition-colors ${
                    viewMode === 'all'
                      ? 'text-white bg-gradient-to-tr from-indigo-700 to-sky-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">ทุกห้อง</span>
                </button>
              </div>

              {viewMode === 'single' && (
                <RoomSelect
                  rooms={roomList}
                  value={selectedRoomId}
                  onChange={setSelectedRoomId}
                  className="min-w-[14rem] max-w-[22rem]"
                />
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 ml-auto flex-wrap justify-end">
              <PrimaryButton
                title="ดาวน์โหลด PNG ของมุมมองปัจจุบัน"
                icon={Download}
                onClick={downloadPNG_CurrentView}
                variant="green"
              >
                <span className="hidden sm:inline">ดาวน์โหลด</span>
              </PrimaryButton>

              <PrimaryButton
                title={`อัปโหลด PNG (${viewMode === 'single' ? 'ห้องนี้' : 'ทั้งแผน'})`}
                icon={Upload}
                onClick={uploadCurrentView}
                disabled={busy}
              >
                <span className="hidden sm:inline">อัปโหลด</span>
              </PrimaryButton>

              <PrimaryButton
                title="สร้าง & บันทึก (PNG+QR)"
                icon={Save}
                onClick={createUploadAndSave}
                disabled={busy}
              >
                <span className="hidden sm:inline">บันทึก</span>
              </PrimaryButton>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-auto bg-gradient-to-tr from-indigo-50 to-sky-50 p-4">
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <div ref={previewRef} className="w-full h-[60vh] overflow-hidden flex items-center justify-center">
              <div style={{ transform: `scale(${fitScale})`, transformOrigin: 'center center' }}>
                <div ref={contentRef} style={{ display: 'inline-block', background: '#fff' }}>
                  {viewMode === 'single' && selectedAlloc ? (
                    <SeatMapOneRoom allocation={selectedAlloc} />
                  ) : (
                    <SeatMapAllRooms allocations={allocations} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {(uploaded.pngUrl || uploaded.qrUrl || uploaded.roomPngUrl) && (
            <div className="mt-4 text-sm">
              <div className="bg-white rounded-2xl border p-4 space-y-1">
                {uploaded.pngUrl && (
                  <div>
                    ✅ PNG ผัง (ทั้งแผน):{' '}
                    <a href={uploaded.pngUrl} className="text-indigo-700 underline break-all" target="_blank" rel="noreferrer">
                      เปิด
                    </a>
                  </div>
                )}
                {uploaded.roomPngUrl && (
                  <div>
                    ✅ PNG ผัง (ห้องนี้):{' '}
                    <a href={uploaded.roomPngUrl} className="text-indigo-700 underline break-all" target="_blank" rel="noreferrer">
                      เปิด
                    </a>
                  </div>
                )}
                {uploaded.qrUrl && (
                  <div>
                    ✅ PNG QR:{' '}
                    <a href={uploaded.qrUrl} className="text-indigo-700 underline break-all" target="_blank" rel="noreferrer">
                      เปิด
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
