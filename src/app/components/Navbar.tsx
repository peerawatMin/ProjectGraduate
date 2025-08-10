"use client"

import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (

    <nav className=" bg-transparent text-white p-4 sm:p-6 md:flex md:justify-between md:items-center">
        <div className="container mx-20 flex justify-between items-center">
            <a href='' className='uppercase tracking-[.25rem] font-bold text-2xl'>SeatEx</a>
            <Link href="/login" className= 'hover:bg-gray-100 hover:text-blue-500 font-semibold border-2 border-white rounded shadow p-2 px-6 transition duration-300'>Sign In</Link>
        </div>
    </nav>
    
  )
}

export default Navbar