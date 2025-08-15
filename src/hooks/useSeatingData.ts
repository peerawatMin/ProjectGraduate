/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useSeatingData.ts
"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "../services/supabaseServices";

export type SeatingPlan = {
  seatpid: string;                // uuid
  plan_name: string | null;       // text
  seating_pattern: string | null; // text
  room_rows: number | null;       // integer
  room_cols: number | null;       // integer
  arrangement_data: any | null;   // jsonb
  created_at: string;             // timestamptz
  updated_at: string | null;      // timestamptz
  user_id: string | null;         // uuid
  exam_count: number | null;      // integer
  exam_room_name: string | null;  // text
  exam_room_description: string | null; // text
  total_examinees: number | null; // integer
};

type LoadOptions = {
  from?: string | null; // yyyy-mm-dd
  to?: string | null;   // yyyy-mm-dd
  rooms?: string[] | null;
  search?: string | null;
};

export function useSeatingData() {
  const [seatingPlans, setSeatingPlans] = useState<SeatingPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [realtimeOn, setRealtimeOn] = useState<boolean>(true);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadData = useCallback(
    async (opts: LoadOptions = {}) => {
      setLoading(true);
      setErrorMessage(null);
      try {
        let query = supabase
          .from("seating_plans")
          .select(
            "seatpid, plan_name, seating_pattern, room_rows, room_cols, arrangement_data, created_at, updated_at, user_id, exam_count, exam_room_name, exam_room_description, total_examinees"
          )
          .order("created_at", { ascending: true });

        // server-side filters (optional, เฉพาะวันที่เพื่อคัดบนฐานข้อมูล)
        if (opts.from) query = query.gte("created_at", new Date(opts.from).toISOString());
        if (opts.to) {
          // เพิ่ม 1 วันเพื่อรวมวันที่ to ให้ครบ
          const toISO = new Date(new Date(opts.to).getTime() + 24 * 60 * 60 * 1000).toISOString();
          query = query.lt("created_at", toISO);
        }
        // ใส่ rooms / search ทำฝั่ง client ก็ได้ แต่รองรับ param ไว้ก่อน
        const { data, error } = await query;

        if (error) throw error;

        let rows = (data || []) as SeatingPlan[];
        // client-side filters (rooms + search)
        if (opts.rooms?.length) {
          const set = new Set(opts.rooms);
          rows = rows.filter((r) => set.has(r.exam_room_name || "ไม่ระบุ"));
        }
        if (opts.search && opts.search.trim()) {
          const q = opts.search.toLowerCase();
          rows = rows.filter((r) =>
            [
              r.plan_name,
              r.seating_pattern,
              r.exam_room_name,
              r.exam_room_description,
              r.user_id,
            ]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(q))
          );
        }

        setSeatingPlans(rows);
      } catch (err: any) {
        setErrorMessage(err.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime subscribe
  useEffect(() => {
    if (!realtimeOn) {
      // ปิด realtime
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // เปิด realtime
    if (!channelRef.current) {
      const channel = supabase
        .channel("seating_plans_changes")
        .on<SeatingPlan>(
          "postgres_changes",
          { event: "*", schema: "public", table: "seating_plans" },
          async () => {
            // โหลดใหม่ทั้งชุดเพื่อความง่าย/ถูกต้อง
            await loadData();
          }
        )
        .subscribe();

      channelRef.current = channel;
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [realtimeOn, loadData]);

  return { seatingPlans, loading, errorMessage, loadData, realtimeOn, setRealtimeOn };
}
