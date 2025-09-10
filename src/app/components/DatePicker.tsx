"use client"
import { useState } from "react"

interface Holiday {
  monthDay: string // "MM-DD"
  name: string
  type: "public" | "buddha" | "other" | "global"
}

interface DatePickerProps {
  label: string
  value: string      // ค่าที่เป็น ISO เช่น "2025-08-25"
  onChange: (value: string) => void
}

// วันสำคัญไทย + โลก
const thaiHolidays: Holiday[] = [
  { monthDay: "01-01", name: "วันขึ้นปีใหม่", type: "public" },
  { monthDay: "04-06", name: "วันจักรี", type: "public" },
  { monthDay: "04-13", name: "วันสงกรานต์", type: "public" },
  { monthDay: "04-14", name: "วันสงกรานต์", type: "public" },
  { monthDay: "04-15", name: "วันสงกรานต์", type: "public" },
  { monthDay: "05-01", name: "วันแรงงาน", type: "public" },
  { monthDay: "05-04", name: "วันฉัตรมงคล", type: "public" },
  { monthDay: "06-03", name: "วันเฉลิมพระชนมพรรษา ราชินี", type: "public" },
  { monthDay: "07-28", name: "วันเฉลิมพระชนมพรรษา ร.10", type: "public" },
  { monthDay: "08-12", name: "วันแม่แห่งชาติ", type: "public" },
  { monthDay: "10-13", name: "วันคล้ายวันสวรรคต ร.9", type: "public" },
  { monthDay: "10-23", name: "วันปิยมหาราช", type: "public" },
  { monthDay: "12-05", name: "วันชาติ / วันพ่อแห่งชาติ", type: "public" },
  { monthDay: "12-10", name: "วันรัฐธรรมนูญ", type: "public" },
  { monthDay: "12-31", name: "วันสิ้นปี", type: "public" },

  { monthDay: "02-12", name: "วันมาฆบูชา", type: "buddha" },
  { monthDay: "05-12", name: "วันวิสาขบูชา", type: "buddha" },
  { monthDay: "07-10", name: "วันอาสาฬหบูชา", type: "buddha" },
  { monthDay: "07-11", name: "วันเข้าพรรษา", type: "buddha" },
  { monthDay: "11-15", name: "วันออกพรรษา", type: "buddha" },

  { monthDay: "01-11", name: "วันเด็กแห่งชาติ", type: "other" },
  { monthDay: "01-16", name: "วันครู", type: "other" },
  { monthDay: "01-29", name: "วันตรุษจีน", type: "other" },
  { monthDay: "03-20", name: "วันวสันตวิษุวัต", type: "other" },
  { monthDay: "05-09", name: "วันพืชมงคล", type: "other" },
  { monthDay: "06-01", name: "วันวิสาขบูชา", type: "other" },
  { monthDay: "09-23", name: "วันเริ่มฤดูใบไม้ร่วง", type: "other" },
  { monthDay: "11-15", name: "วันลอยกระทง", type: "other" },
  { monthDay: "11-01", name: "วันฮาโลวีน", type: "other" },
]

const globalHolidays: Holiday[] = [
  { monthDay: "02-14", name: "วันวาเลนไทน์", type: "global" },
  { monthDay: "07-04", name: "วันประกาศอิสระภาพ", type: "global" },
  { monthDay: "12-25", name: "วันคริสต์มาส", type: "global" },
]

const allHolidays = [...thaiHolidays, ...globalHolidays]

export function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date())
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)
  const today = new Date()

  const monthNames = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน",
    "พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม",
    "กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"
  ]
  const weekDays = ["อา","จ","อ","พ","พฤ","ศ","ส"]

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const daysInMonth = endOfMonth.getDate()
  const startDay = startOfMonth.getDay()

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1,1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1,1))

  const formatISO = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2,"0")}`

  const formatThai = (d: Date) =>
    `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`

  const handleDateSelect = (day:number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    onChange(formatISO(selectedDate))   // ส่ง ISO สำหรับ DB
    setCurrentDate(selectedDate)        // สำหรับแสดง input
    setShowCalendar(false)
  }

  const getHolidayColor = (type: string) => {
    switch(type){ 
      case "public": return "bg-blue-600 text-white"
      case "buddha": return "bg-yellow-500 text-black"
      case "global": return "bg-rose-600 text-white"
      default: return "bg-green-600 text-white"
    }
  }

  return (
    <div className="w-full relative text-sm">
      <label className="block font-medium text-white mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value ? formatThai(new Date(value)) : ""}
          readOnly
          onFocus={()=>setShowCalendar(true)}
          placeholder="เลือกวันที่"
          className="w-full p-3 pr-10 rounded-lg bg-transparent text-white
                     border border-gray-300 placeholder-gray-400
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500
                     outline-none transition-all cursor-pointer"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" 
              onClick={() => setShowCalendar(!showCalendar)}>📅</span>

        {showCalendar && (
          <div className="absolute z-10 mt-2 w-64 bg-gray-800 border border-gray-500 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-2 px-2 py-1 text-gray-200 font-semibold">
              <button onClick={handlePrevMonth} className="px-2 py-1 rounded hover:bg-gray-600">&lt;</button>
              <div>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
              <button onClick={handleNextMonth} className="px-2 py-1 rounded hover:bg-gray-600">&gt;</button>
            </div>

            <div className="grid grid-cols-7 text-center mb-1 bg-gray-700">
              {weekDays.map(day => <div key={day} className=" text-gray-400 p-1 rounded">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 text-center gap-0.5 p-1">
              {Array.from({ length: startDay }).map((_, i)=><div key={"empty-"+i}></div>)}
              {Array.from({ length: daysInMonth }).map((_, i)=>{
                const d = i+1
                const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), d)
                const isToday = dateObj.getFullYear()===today.getFullYear() &&
                                dateObj.getMonth()===today.getMonth() &&
                                dateObj.getDate()===today.getDate()
                const isWeekend = dateObj.getDay()===0 || dateObj.getDay()===6
                const monthDay = `${String(dateObj.getMonth()+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`
                const holidays = allHolidays.filter(h=>h.monthDay===monthDay)

                return (
                  <div key={d} className="relative">
                    <button
                        onMouseDown={()=>handleDateSelect(d)}
                        onMouseEnter={()=>setHoveredDay(monthDay)}
                        onMouseLeave={()=>setHoveredDay(null)}
                        className={`p-2 rounded transition-colors w-full
                            ${isToday ? "bg-blue-500 text-white" : ""}
                            ${isWeekend && !isToday ? "text-red-400" : "text-white"}
                            ${holidays.length > 0 ? getHolidayColor(holidays[0].type) : ""}
                            hover:bg-gray-600
                        `}>
                        {d}
                    </button>

                    {hoveredDay===monthDay && holidays.length>0 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 w-36">
                        {holidays.map((h,i)=>(
                          <div key={i} className={`relative ${getHolidayColor(h.type)} text-xs px-2 py-1 rounded mb-1 shadow-lg truncate text-center whitespace-nowrap overflow-hidden`}>
                            {h.name}
                            <div className={`absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 ${getHolidayColor(h.type)} rotate-45`}></div>
                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
