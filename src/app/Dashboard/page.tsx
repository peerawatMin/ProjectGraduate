// app/Dashboard/page.tsx
'use client'
import React from 'react'
// ไม่ต้อง import AdminSidebarWrapper ที่นี่แล้ว
// import AdminSidebarWrapper from '../components/AdminSidebarWrapper' // <-- ลบบรรทัดนี้

import {motion} from "framer-motion"
import {
  User,
  DollarSign,
  ShoppingBag,
  SquareActivityIcon
} from "lucide-react"
import HeaderDB from '../components/HeaderDB'
import StatCard from '../components/StatCard'
import OverviewChart from '../components/OverviewChart'

export default function Mainpage() {
  return (
    <>
        <div className="flex h-screen w-full overflow-hidden max-h-dvh">
            <div className="flex flex-col flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto w-full">
                    <HeaderDB/>
                    <div className="py-4 px-4 lg:px-8">
                      <motion.div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
                          initial={{opacity: 0, y:20}}
                          animate={{opacity: 1 , y:0}}
                          transition={{duration:1}}
                      >
                          <StatCard name="Total Sales" icon={DollarSign} value="$15,646" />
                          <StatCard name="Total Examiner" icon={User} value="$15,646" />
                          <StatCard name="Total Seat_Assignment" icon={ShoppingBag} value="$15,646" />
                          <StatCard name="Stock" icon={SquareActivityIcon} value="$15,646" />
                      </motion.div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          <OverviewChart/>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    {/* </div>  <-- ลบ div ปิดที่เคยห่อหุ้มโครงสร้าง flex หลักออก */}
    </>

  )
}