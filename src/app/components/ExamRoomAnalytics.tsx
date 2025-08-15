/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useMemo } from "react";
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line, BarChart,Bar
} from "recharts";
import { useSeatingData } from "../../hooks/useSeatingData";
import Loading from "./Loading";

const COLORS = {
  primary: ["#6366F1","#22C55E","#F59E0B","#EF4444","#06B6D4","#A78BFA","#10B981","#F97316"],
  rooms:   ["#60A5FA","#F472B6","#34D399","#FBBF24","#93C5FD","#C084FC","#4ADE80","#FDBA74",
            "#67E8F9","#FCA5A5","#A7F3D0","#FDE68A"],
};

export default function ExamRoomAnalytics() {
  const { seatingPlans, loading, errorMessage } = useSeatingData();
  const [selectedView, setSelectedView] = useState<"usage"|"occupancy"|"trend">("usage");

  const totalExaminees = useMemo(
    () => seatingPlans.reduce((s, p) => s + (p.total_examinees || 0), 0),
    [seatingPlans]
  );

  const distinctRooms = useMemo(
    () => Array.from(new Set(seatingPlans.map(p => p.exam_room_name || "ไม่ระบุ"))),
    [seatingPlans]
  );

  const roomUsageData = useMemo(() => {
    const roomCount: Record<string, { count: number; description: string }> = {};
    seatingPlans.forEach((p) => {
      const room = p.exam_room_name || "ไม่ระบุ";
      if (!roomCount[room]) roomCount[room] = { count: 1, description: p.exam_room_description || "ไม่มีคำอธิบาย" };
      else roomCount[room].count += 1;
    });
    return Object.entries(roomCount).map(([room, { count, description }]) => ({ room, count, description }));
  }, [seatingPlans]);

    const roomOccupancyData = useMemo(() => {
    const data: {
        room: string;
        occupancy: number;
        used: number;
        capacity: number;
        description: string;
    }[] = [];

    seatingPlans.forEach((p) => {
        const room = p.exam_room_name || "ไม่ระบุ";
        const capacity = (p.room_rows || 0) * (p.room_cols || 0);
        const used = p.total_examinees || 0;
        const occupancy = capacity > 0 ? Math.round((used / capacity) * 100) : 0;

        data.push({
        room,
        occupancy,
        used,
        capacity,
        description: p.exam_room_description || "ไม่มีคำอธิบาย",
        });
    });

    return data;
    }, [seatingPlans]);

  const roomTrendData = useMemo(() => {
    const daily: Record<string, Record<string, number>> = {};
    seatingPlans.forEach((p) => {
      const date = p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "ไม่ทราบ";
      const room = p.exam_room_name || "ไม่ระบุ";
      if (!daily[date]) daily[date] = {};
      daily[date][room] = (daily[date][room] || 0) + (p.total_examinees || 0);
    });
    const dates = Object.keys(daily).sort();
    const rooms = Array.from(new Set(seatingPlans.map(p => p.exam_room_name || "ไม่ระบุ")));
    return dates.map((d) => {
      const row: any = { date: d, formattedDate: new Date(d).toLocaleDateString("th-TH",{ day:"2-digit", month:"short" }) };
      rooms.forEach(r => row[r] = daily[d][r] || 0);
      return row;
    });
  }, [seatingPlans]);

  if (loading) return <Loading/>;
  if (errorMessage) return <p className="text-red-500">{errorMessage}</p>;
  if (!seatingPlans.length) return <p>ไม่พบข้อมูล</p>;

  return (
    <div className="bg-gradient-to-tr from-indigo-800 via-blue-700 to-sky-600 p-4 md:p-6 mx-2 md:mx-0 backdrop-blur-md shadow-lg rounded-xl transition-all duration-500 ease-in-out">
      {/* Header + Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100 mb-4 md:mb-0"> วิเคราะห์ห้องสอบ</h2>
        <select
          value={selectedView}
          onChange={(e)=>setSelectedView(e.target.value as any)}
          className="px-3 py-1 bg-gray-700 text-gray-200 rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option className="bg-gray-700" value="usage">📊 ความถี่การใช้งานห้องสอบ</option>
          <option className="bg-gray-700" value="occupancy">📉 อัตราการใช้ความจุห้องสอบ</option>
          <option className="bg-gray-700" value="trend">📈 แนวโน้มการใช้งานห้องสอบ</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 ">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">แผนการสอบ</p>
          <p className="text-white text-lg font-semibold text-right mx-2">{seatingPlans.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">ห้องสอบ</p>
          <p className="text-white text-lg font-semibold text-right mx-2">{distinctRooms.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">ผู้เข้าสอบทั้งหมด</p>
          <p className="text-white text-lg font-semibold text-right mx-2">{totalExaminees.toLocaleString()}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">ค่าเฉลี่ย</p>
          <p className="text-white text-lg font-semibold text-right mx-2">
            {seatingPlans.length ? Math.round(totalExaminees / seatingPlans.length).toLocaleString() : 0}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="h-80 transition-all duration-500 ease-in-out">
        {/* PieChart - Usage */}
        {selectedView === "usage" && (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={roomUsageData}
                dataKey="count"
                nameKey="room"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={50}
                paddingAngle={4}
                label={({ room, percent }) => `${room}: ${(percent*100).toFixed(0)}%`}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                {roomUsageData.map((entry, index) => (
                  <Cell key={index} fill={COLORS.primary[index % COLORS.primary.length]} />
                ))}
              </Pie>

              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const { room, count, description } = payload[0].payload;
                    const total = roomUsageData.reduce((sum, r) => sum + r.count, 0);
                    const percent = ((count / total) * 100).toFixed(0);
                    const colorIndex = roomUsageData.findIndex(r => r.room === room);
                    return (
                    <div className="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 min-w-[160px] max-w-[280px]">
                        <div className="flex items-center mb-1">
                            <div
                            style={{ backgroundColor: COLORS.primary[colorIndex % COLORS.primary.length] }}
                            className="w-4 h-4 rounded mr-2 flex-shrink-0"
                            />
                            <p className="font-semibold text-sm truncate max-w-[300px]">{room}</p>
                        </div>
                        <p className="text-sm text-purple-300 mb-1">{count} ครั้ง ({percent}%)</p>
                        <p className="text-xs text-gray-300 line-clamp-2">{description}</p>
                    </div>

                    );
                  }
                  return null;
                }}
                cursor={{ fill: "rgba(255,255,255,0.05)" }}
              />

            <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            layout="vertical" // ให้จัดเป็นคอลัมน์
            formatter={(value) => {
                const room = value as string;
                const index = roomUsageData.findIndex(r => r.room === room);
                const total = roomUsageData.reduce((sum, r) => sum + r.count, 0);
                const percent = ((roomUsageData[index].count / total) * 100).toFixed(0);

                return (
                <span
                    style={{
                    color: "#f9fafb",
                    fontSize: 12,
                    display: "inline-flex",
                    width: 160, // กำหนดความกว้างเท่ากันทุกช่อง
                    justifyContent: "space-between"
                    }}
                >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 110 }}>
                    {room}
                    </span>
                    <span>{percent}%</span>
                </span>
                );
            }}
            wrapperStyle={{
                display: "grid",
                gridTemplateColumns: "repeat(2, auto)", // 2 คอลัมน์ (ปรับได้)
                gap: "4px 12px",
                justifyContent: "center",
                marginTop:30
            }}
            />

            </PieChart>

          </ResponsiveContainer>
        )}

        {selectedView === "occupancy" && (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={roomOccupancyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e3a8a" />
            <XAxis dataKey="room" stroke="#48d98e" />
            <YAxis unit="%" stroke="#48d98e" domain={[0, 100]} />
            <Tooltip
                content={({ active, payload }) => {
                if (active && payload && payload.length) {
                    const { room, occupancy, used, capacity, description } = payload[0].payload;
                    return (
                    <div className="bg-gray-800 text-white p-3 rounded-lg border border-gray-600 min-w-[160px] max-w-[280px]">
                        <p className="font-semibold text-sm">{room}</p>
                        <p className="text-sm text-purple-300">
                        {occupancy}% ({used}/{capacity} ที่นั่ง)
                        </p>
                        <p className="text-xs text-gray-300">{description}</p>
                    </div>
                    );
                }
                return null;
                }}
            />
            <Bar dataKey="occupancy" fill="#00d179" radius={[6, 6, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
        )}

        {/* LineChart - Trend */}
        {selectedView === "trend" && (
        <ResponsiveContainer width="100%" height={350}>
            <LineChart data={roomTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" />
            <XAxis dataKey="formattedDate" stroke="#d1fae5" />
            <YAxis stroke="#d1fae5" />

            {/* Tooltip กระชับ + คงขนาด */}
            <Tooltip
                content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                    const total = payload.reduce((sum, p) => sum + (Number(p.value) || 0), 0);

                    return (
                    <div
                        className="bg-gray-800 text-white p-2 rounded-lg border border-gray-600"
                        style={{ width: 180, maxHeight: 200, overflowY: "auto" }}
                    >
                        <p className="font-semibold text-xs mb-1">{label}</p>
                        {payload.map((entry, index) => {
                        const value = Number(entry.value) || 0;
                        const percent = total > 0 ? ((value / total) * 100).toFixed(1) : "0.0";
                        return (
                            <div key={index} className="flex items-center mb-1">
                            <div
                                style={{ backgroundColor: entry.color }}
                                className="w-3 h-3 rounded mr-2 flex-shrink-0"
                            />
                            <p
                                className="text-xs truncate"
                                style={{ maxWidth: 130 }}
                                title={String(entry.name)}
                            >
                                {String(entry.name)}: {value} ({percent}%)
                            </p>
                            </div>
                        );
                        })}
                    </div>
                    );
                }
                return null;
                }}
                cursor={{ stroke: "#d1fae5", strokeWidth: 1, strokeDasharray: "3 3" }}
            />

            {/* Legend แบบตัดข้อความ */}
            <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "4px 12px",
                justifyContent: "center",
                marginTop: 16
                }}
                formatter={(value) => {
                const name = String(value ?? "");
                const maxLength = 14;
                const truncated =
                    name.length > maxLength ? name.slice(0, maxLength) + "…" : name;

                return (
                    <span
                    style={{
                        color: "#f9fafb",
                        fontSize: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        maxWidth: 110
                    }}
                    title={name}
                    >
                    {truncated}
                    </span>
                );
                }}
            />

            {Object.keys(roomTrendData[0] || {})
                .filter((k) => k !== "date" && k !== "formattedDate")
                .map((room, i) => (
                <Line
                    key={room}
                    type="monotone"
                    dataKey={room}
                    stroke={COLORS.rooms[i % COLORS.rooms.length]}
                    strokeWidth={3}
                    isAnimationActive={true}
                    animationDuration={800}
                    animationEasing="ease-in-out"
                />
                ))}
            </LineChart>
        </ResponsiveContainer>
        )}

      </div>
    </div>
  );
}
