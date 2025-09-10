"use client"
import { useState, useEffect } from "react"

interface PerfectSliderProps {
  label: string
  min?: number
  max?: number
  step?: number
  value: number
  onChange: (value: number) => void
}

export function PerfectSlider({
  label,
  min = 0,
  max = 200,
  step = 1,
  value,
  onChange
}: PerfectSliderProps) {
  const [internalValue, setInternalValue] = useState(value)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (val: number) => {
    if (val < min) val = min
    if (val > max) val = max
    setInternalValue(val)
    onChange(val)
  }

  const handleIncrement = () => handleChange(internalValue + step)
  const handleDecrement = () => handleChange(internalValue - step)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numeric = Number(e.target.value)
    if (!isNaN(numeric)) handleChange(numeric)
  }

  const percent = ((internalValue - min) / (max - min)) * 100

  // Multi-color gradientตามช่วงที่คุณบอก
  let sliderColor = "#34d399" // default green
  if (percent > 50 && percent <= 75) sliderColor = "#10b981" // green dark
  else if (percent > 75) sliderColor = "#ef4444" // red

  const sliderStyle = {
    background: `linear-gradient(to right, ${sliderColor} 0%, ${sliderColor} ${percent}%, #374151 ${percent}%, #374151 100%)`,
    transition: "background 0.3s ease"
  }

  return (
    <div className="w-full">
  <label className="block text-sm font-medium text-white mb-2">{label}</label>

  {/* Container หลัก flex */}
  <div className="relative flex justify-around items-center gap-2 mt-5">
    
    <div className="relative flex-1">
    <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={(e) => handleChange(Number(e.target.value))}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onTouchStart={() => setIsDragging(true)}
        onTouchEnd={() => setIsDragging(false)}
        className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-transparent transition-all"
        style={sliderStyle}
    />

    {/* Tooltip อยู่ใน container ของ slider */}
    {isDragging && (
        <div
        className="absolute -top-6 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg transition-all duration-300 ease-out"
        style={{ left: `calc(${percent}% )` }}
        >
        {internalValue}
        </div>
    )}
    </div>


    {/* Input + ปุ่ม */}
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleDecrement}
        className="text-xs p-2 bg-transparent border text-white rounded-l-lg hover:bg-red-500 transition"
      >
        -
      </button>
      <input
        type="number"
        value={internalValue}
        onChange={handleInputChange}
        className="w-14 p-2 text-center text-xs no-spinner border bg-transparent focus:bg-indigo-700 text-white focus:outline-none"
      />
      <button
        type="button"
        onClick={handleIncrement}
        className="text-xs p-2 bg-transparent border text-white rounded-r-lg hover:bg-green-700 transition"
      >
        +
      </button>
    </div>
    
  </div>
</div>

  )
}
