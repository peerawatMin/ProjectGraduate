"use client"
import { useState, useEffect } from "react"

interface ComboboxProps {
  label: string
  placeholder?: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export function Combobox({ label, placeholder, options, value, onChange }: ComboboxProps) {
  const [filteredOptions, setFilteredOptions] = useState(options)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(value.toLowerCase())
      )
    )
  }, [value, options])

  const handleSelect = (option: string) => {
    onChange(option)
    setShowDropdown(false)
    setHighlightIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      )
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlightIndex >= 0) {
        handleSelect(filteredOptions[highlightIndex])
      } else if (value.trim() !== "") {
        // เพิ่ม option ใหม่ถ้ายังไม่มี
        if (!options.includes(value.trim())) {
          options.push(value.trim())
        }
        handleSelect(value.trim())
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  return (
    <div className="w-full text-sm ">
      <label className="block font-medium text-white mb-2">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full p-3 pr-10 rounded-lg bg-transparent text-white 
                     placeholder-gray-400 border border-gray-300 
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
                     outline-none transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          ▼
        </span>

        {showDropdown && filteredOptions.length > 0 && (
          <ul className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg max-h-40 overflow-auto shadow-lg">
            {filteredOptions.map((option, index) => (
              <li
                key={index}
                onMouseDown={() => handleSelect(option)}
                className={`px-4 py-2 text-white cursor-pointer transition-colors 
                  ${highlightIndex === index ? "bg-blue-600" : "hover:bg-blue-500"}`}
              >
                {option}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
