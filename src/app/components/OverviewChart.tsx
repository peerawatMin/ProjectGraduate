/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { supabase } from '@/lib/supabaseClient';
import React, { useEffect, useState, useMemo, useCallback, ReactNode } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';
import { PostgrestError } from '@supabase/supabase-js';

interface SeatingPlan {
  seatpid: string;
  created_at: string;
  total_examinees: number;
}

interface ChartData {
  date: string;
  count: number;
  formattedDate: string;
  cumulative: number;
}

interface Statistics {
  totalExaminees: number;
  totalPlans: number;
  averageExaminees: number;
  peakDay: {
    formattedDate: ReactNode; date: string; count: number 
} | null;
  growthRate: number;
}

type ChartType = 'line' | 'area' | 'bar';
type TimeRange = '7d' | '30d' | '90d' | 'all';

const OverviewChart: React.FC = () => {
  const [planData, setPlanData] = useState<SeatingPlan[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [showCumulative, setShowCumulative] = useState<boolean>(false);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const getTimeRangeFilter = useCallback((range: TimeRange): Date => {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  }, []);

  // Fill missing dates to ensure continuous line
  const fillMissingDates = useCallback((data: ChartData[], range: TimeRange): ChartData[] => {
    if (data.length === 0 || range === 'all') return data;

    const startDate = getTimeRangeFilter(range);
    const endDate = new Date();
    const filledData: ChartData[] = [];
    
    // Create a map of existing data
    const dataMap = new Map<string, ChartData>();
    data.forEach(item => {
      dataMap.set(item.date, item);
    });

    // Fill in missing dates
    let currentDate = new Date(startDate);
    let cumulative = 0;

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = dataMap.get(dateStr);
      
      if (existingData) {
        cumulative = existingData.cumulative;
        filledData.push(existingData);
      } else {
        // Add missing date with 0 count
        filledData.push({
          date: dateStr,
          count: 0,
          formattedDate: formatDate(dateStr),
          cumulative: cumulative
        });
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledData;
  }, [getTimeRangeFilter, formatDate]);

  const filteredData = useMemo(() => {
    const filterDate = getTimeRangeFilter(timeRange);
    const filtered = chartData.filter(item => new Date(item.date) >= filterDate);
    return fillMissingDates(filtered, timeRange);
  }, [chartData, timeRange, getTimeRangeFilter, fillMissingDates]);

  const statistics = useMemo((): Statistics => {
    if (filteredData.length === 0) {
      return {
        totalExaminees: 0,
        totalPlans: 0,
        averageExaminees: 0,
        peakDay: null,
        growthRate: 0
      };
    }

    const totalExaminees = filteredData.reduce((sum, item) => sum + item.count, 0);
    const totalPlans = filteredData.length;
    const averageExaminees = Math.round(totalExaminees / totalPlans);
    const peakDay = filteredData.reduce((max, item) => 
      item.count > (max?.count || 0) ? item : max, filteredData[0]);

    // Calculate growth rate (first vs last)
    const firstWeek = filteredData.slice(0, Math.min(7, filteredData.length));
    const lastWeek = filteredData.slice(-Math.min(7, filteredData.length));
    const firstAvg = firstWeek.reduce((sum, item) => sum + item.count, 0) / firstWeek.length;
    const lastAvg = lastWeek.reduce((sum, item) => sum + item.count, 0) / lastWeek.length;
    const growthRate = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;

    return {
      totalExaminees,
      totalPlans,
      averageExaminees,
      peakDay,
      growthRate
    };
  }, [filteredData]);

  const fetchSeatingPlans = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data, error } = await supabase
        .from('seating_plans')
        .select('seatpid, created_at, total_examinees')
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error((error as PostgrestError).message);
      }

      const plans = (data as SeatingPlan[]) || [];
      setPlanData(plans);

      // Group by date and calculate cumulative
      const grouped: Record<string, number> = {};
      plans.forEach(plan => {
        const date = new Date(plan.created_at).toISOString().split('T')[0];
        grouped[date] = (grouped[date] || 0) + (plan.total_examinees || 0);
      });

      let cumulative = 0;
      const chartArray: ChartData[] = Object.keys(grouped)
        .sort()
        .map(date => {
          cumulative += grouped[date];
          return {
            date,
            count: grouped[date],
            formattedDate: formatDate(date),
            cumulative
          };
        });

      setChartData(chartArray);
    } catch (err) {
      setErrorMessage((err as Error).message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด');
      setPlanData([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [formatDate]);

  useEffect(() => {
    fetchSeatingPlans();
  }, [fetchSeatingPlans]);

  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 20, right: 30, left: 20, bottom: 60 }
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-600 rounded-lg p-3 shadow-xl">
            <p className="text-gray-300 text-sm font-medium">{data.formattedDate}</p>
            <p className="text-purple-400 font-semibold">
              ผู้เข้าสอบ: {payload[0].value?.toLocaleString()} คน
            </p>
            {showCumulative && payload[1] && (
              <p className="text-blue-400 font-semibold">
                สะสม: {payload[1].value?.toLocaleString()} คน
              </p>
            )}
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.1}/>
              </linearGradient>
              {showCumulative && (
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#9ca3af" 
              tick={{ fontSize: 11 }}
              angle={filteredData.length > 10 ? -45 : 0}
              textAnchor={filteredData.length > 10 ? "end" : "middle"}
              height={filteredData.length > 10 ? 80 : 60}
              interval={filteredData.length > 20 ? 'preserveStartEnd' : 0}
            />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} width={60} />
            <Tooltip content={<CustomTooltip />} />
            {showCumulative && <Legend />}
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#9c27b0" 
              fillOpacity={1}
              fill="url(#colorCount)"
              name="รายวัน"
            />
            {showCumulative && (
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#colorCumulative)"
                name="สะสม"
              />
            )}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#9ca3af" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} width={60} />
            <Tooltip content={<CustomTooltip />} />
            {showCumulative && <Legend />}
            <Bar dataKey="count" fill="#9c27b0" name="รายวัน" />
            {showCumulative && (
              <Bar dataKey="cumulative" fill="#3b82f6" name="สะสม" />
            )}
          </BarChart>
        );
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#9ca3af" 
              tick={{ fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 11 }} width={60} />
            <Tooltip content={<CustomTooltip />} />
            {showCumulative && <Legend />}
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#9c27b0" 
              strokeWidth={3}
              activeDot={{ r: 6, fill: "#9c27b0" }}
              dot={{ r: 4, fill: "#9c27b0" }}
              connectNulls={false}
              name="รายวัน"
            />
            {showCumulative && (
              <Line 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#3b82f6" 
                strokeWidth={2}
                strokeDasharray="5 5"
                activeDot={{ r: 6, fill: "#3b82f6" }}
                dot={{ r: 3, fill: "#3b82f6" }}
                connectNulls={true}
                name="สะสม"
              />
            )}
          </LineChart>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-tr from-indigo-800 to-sky-800 p-6 mx-2 md:mx-0 backdrop-blur-md shadow-lg rounded-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="bg-gradient-to-tr from-red-800 to-pink-800 p-6 mx-2 md:mx-0 backdrop-blur-md shadow-lg rounded-xl">
        <h2 className="text-lg font-medium mb-4 text-gray-100">เกิดข้อผิดพลาด</h2>
        <p className="text-red-200 mb-4">{errorMessage}</p>
        <button
          onClick={fetchSeatingPlans}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-tr from-indigo-800 via-blue-700 to-sky-600 p-4 md:p-6 mx-2 md:mx-0 backdrop-blur-md shadow-lg rounded-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100 mb-4 md:mb-0">
          ภาพรวมการจัดสอบ
        </h2>
        
        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-1 bg-gray-700 text-gray-200 rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="7d">7 วันล่าสุด</option>
            <option value="30d">30 วันล่าสุด</option>
            <option value="90d">90 วันล่าสุด</option>
            <option value="all">ทั้งหมด</option>
          </select>

          {/* Chart Type Selector */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="px-3 py-1 bg-gray-700 text-gray-200 rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="line">เส้น</option>
            <option value="area">พื้นที่</option>
            <option value="bar">แท่ง</option>
          </select>

          {/* Cumulative Toggle */}
          <label className="flex items-center text-gray-200 text-sm">
            <input
              type="checkbox"
              checked={showCumulative}
              onChange={(e) => setShowCumulative(e.target.checked)}
              className="mr-2 rounded"
            />
            แสดงสะสม
          </label>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 items-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">ผู้เข้าสอบทั้งหมด</p>
          <p className="text-white text-lg font-semibold text-right mx-2">
            {statistics.totalExaminees.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">จำนวนแผนสอบ</p>
          <p className="text-white text-lg font-semibold text-right mx-2">
            {statistics.totalPlans.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">เฉลี่ยต่อวัน</p>
          <p className="text-white text-lg font-semibold text-right mx-2">
            {statistics.averageExaminees.toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
          <p className="text-gray-300 text-xs">อัตราเติบโต</p>
          <p className={`text-lg font-semibold text-right mx-2 ${statistics.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {statistics.growthRate > 0 ? '+' : ''}{statistics.growthRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      {filteredData.length === 0 ? (
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-300 text-center">ไม่พบข้อมูลในช่วงเวลาที่เลือก</p>
        </div>
      ) : (
        <div className="h-80 md:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      )}

      {/* Peak Day Info */}
      {statistics.peakDay && (
        <div className="mt-2 text-center">
          <p className="text-gray-300 text-sm">
            วันที่มีผู้เข้าสอบมากที่สุด: <span className="text-purple-400 font-semibold">
              {statistics.peakDay.formattedDate} ({statistics.peakDay.count.toLocaleString()} คน)
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default OverviewChart;