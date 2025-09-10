"use client"

import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)

  const currentTheme = theme || "system"

  const options = [
    { label: "Light", value: "light", icon: <Sun className="h-4 w-4" /> },
    { label: "Dark", value: "dark", icon: <Moon className="h-4 w-4" /> },
    { label: "System", value: "system", icon: <Monitor className="h-4 w-4" /> },
  ]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = () => {
      if (open) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [open])

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setOpen(!open)
  }

  const handleOptionClick = (value: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTheme(value)
    setOpen(false)
  }

  if (!mounted) {
    return (
      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
        <Monitor className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggleClick}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
        aria-label="Toggle theme"
      >
        {options.find(o => o.value === currentTheme)?.icon}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-36 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {options.map((opt) => {
            const isActive = currentTheme === opt.value
            return (
              <button
                key={opt.value}
                onClick={(e) => handleOptionClick(opt.value, e)}
                className={`relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground ${
                  isActive ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                {opt.icon}
                <span className="ml-2">{opt.label}</span>
                {isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}