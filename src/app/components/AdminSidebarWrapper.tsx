// src/components/AdminSidebarWrapper.tsx
'use client'

import { useAuth } from '../../hooks/useAuth'
import Sidebar, { SidebarItem } from './Sidebar'
import { Users, Cuboid, Armchair, House, HousePlus, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminSidebarWrapper() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="h-screen w-64 bg-gradient-to-b from-sky-600 to-indigo-700 animate-pulse flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Sidebar user={user} onLogout={handleLogout}>
      <SidebarItem 
        icon={<LayoutDashboard size={20} />} 
        text="Dashboard" 
        href="/Dashboard"  
        active={false}
      />
      <SidebarItem 
        icon={<Users size={20} />} 
        text="User Management" 
        href="/Manage_user" 
        active={false}
      />
      <SidebarItem 
        icon={<Armchair size={20} />} 
        text="Seat Assignment" 
        href="/seat_assignment" 
        active={false}
      />
      
      <SidebarItem 
        icon={<Cuboid size={20} />} 
        text="SeatPlans" 
        href="/exam-dashboard" 
        active={false}
      />
      <SidebarItem 
        icon={<House size={20} />} 
        text="Rooms" 
        href="/rooms" 
        active={false}
      />
      <SidebarItem 
        icon={<HousePlus size={20} />} 
        text="CreateRoom" 
        href="/create-room" 
        active={false}
      />
    </Sidebar>
  )
}