'use client'

import Link from 'next/link'
import React from 'react'

const NavbarWithSection = () => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-xs shadow-sm text-gray-800 p-4">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <a href="#" className="uppercase tracking-[.25rem] font-bold text-2xl">SeatEx</a>

        {/* ลิงก์ไปยังแต่ละ section */}
        <div className="hidden md:flex gap-6 items-center">
          <a href="#intro" className="hover:text-white text-[18px] transition duration-300">หน้าแรก</a>
          <a href="#plan" className="hover:text-white transition text-[18px] duration-300">แผนผัง</a>
          <a href="#auto-assign" className="hover:text-white transition text-[18px] duration-300">จัดที่นั่ง</a>
        </div>

        <Link
          href="/login"
          className="ml-6 hover:bg-gray-100 hover:text-gray-800 font-semibold border-2 border-white rounded shadow p-2 px-6 transition duration-300"
        >
          Sign In
        </Link>
      </div>
    </nav>
  )
}

export default NavbarWithSection
