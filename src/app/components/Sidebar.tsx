'use client'

import { MoreVertical, ChevronLast, ChevronFirst, LogOut, User } from "lucide-react"
import { useContext, createContext, useState } from "react"
import Image from "next/image"
import Link from "next/link"

interface SidebarContextType {
  expanded: boolean;
}

const SidebarContext = createContext<SidebarContextType>({ expanded: true });

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
  phone?: string
}

interface SidebarProps {
  children: React.ReactNode
  user?: User | null
  onLogout?: () => void
}

export default function Sidebar({ children, user, onLogout }: SidebarProps) {
  const [expanded, setExpanded] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Default user data if user is not provided
  const defaultUser: User = {
    id: 'guest',
    name: 'Admin User',
    email: 'admin@example.com',
    avatar: '/boy.png',
    role: 'admin'
  }

  const currentUser = user || defaultUser

  return (
    <aside className="h-screen">
      <nav className="h-full flex flex-col bg-gradient-to-b from-sky-600 to-indigo-700 border-r shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"}`}>
            <h1 className="text-white font-bold text-xl">SEATEX</h1>
          </div>
          <button
            onClick={() => setExpanded((curr) => !curr)}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            {expanded ? <ChevronFirst className="text-white" /> : <ChevronLast className="text-white" />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex-1 px-3 py-2">{children}</ul>
        </SidebarContext.Provider>

        <div className="border-t border-indigo-500/30 flex p-3 relative">
          <div className="w-10 h-10 rounded-md bg-transparent flex items-center justify-center">
            {currentUser.avatar ? (
              <Image
                src={currentUser.avatar}
                alt="User Avatar"
                width={40}
                height={40}
                className="w-10 h-10 rounded-md object-cover"
              />
            ) : (
              <User className="text-white" size={20} />
            )}
          </div>
          
          <div
            className={`
              flex justify-between items-center
              overflow-hidden transition-all ${expanded ? "w-52 ml-3" : "w-0"}
            `}
          >
            <div className="leading-4">
              <h4 className="font-semibold text-white text-sm">{currentUser.name}</h4>
              <span className="text-xs text-indigo-200">{currentUser.email}</span>
              
            </div>
            {currentUser.role && (
                <span className="text-xs text-right mt-6 ml-5 text-yellow-600 block capitalize">
                  {currentUser.role}
                </span>
              )}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-1 rounded hover:bg-white/20 transition-colors"
            >
              <MoreVertical size={16} className="text-white" />
            </button>
          </div>

          {/* User Menu */}
          {showUserMenu && expanded && (
            <div className="absolute bottom-full right-3 mb-2 bg-white rounded-lg shadow-lg border py-1 min-w-36 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-blue-900">{currentUser.name}</p>
                <p className="text-xs text-blue-500">{currentUser.email}</p>
              </div>
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout()
                    setShowUserMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-300 flex items-center gap-2 text-red-600"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              )}
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}

export function SidebarItem({ icon, text, active, alert, href = "#" }: { 
  icon: React.ReactNode
  text: string
  active?: boolean
  alert?: boolean
  href?: string 
}) {
  const { expanded } = useContext(SidebarContext)

  return (
    <Link href={href}>
      <li
        className={`
          relative flex items-center py-2 px-3 my-1
          font-medium rounded-md cursor-pointer transition-colors group
          ${
            active
              ? "bg-white/20 text-white shadow-sm"
              : "text-indigo-100 hover:bg-white/10 hover:text-white"
          }
        `}
      >
        <div className="flex-shrink-0">
          {icon}
        </div>
        <span
          className={`overflow-hidden transition-all ${
            expanded ? "w-52 ml-3" : "w-0"
          }`}
        >
          {text}
        </span>
        {alert && (
          <div
            className={`absolute right-2 w-2 h-2 rounded-full bg-red-400 ${
              expanded ? "" : "top-2"
            }`}
          />
        )}

        {!expanded && (
          <div
            className={`
              absolute left-full rounded-md px-2 py-1 ml-6
              bg-gray-900 text-white text-sm whitespace-nowrap
              invisible opacity-0 -translate-x-3 transition-all
              group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
              z-50
            `}
          >
            {text}
          </div>
        )}
      </li>
    </Link>
  )
}