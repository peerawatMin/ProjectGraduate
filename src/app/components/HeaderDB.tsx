'use client'
import React from 'react'
import Image from 'next/image'
import { Bell } from 'lucide-react'

const HeaderDB = () => {
  return (
    <header className="bg-linear-to-tr from-indigo-800 to-sky-600 shadow-lg border-b mx-4 sm:mx-6 lg:mx-8 mt-4 mb-2 rounded-lg">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 flex items-center justify-between">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-100">
                DashBoard
            </h1>
        

        <div className="flex items-center space-x-3 sm:space-x-6">
            <Image 
                src="/flag.png"
                alt="country flag"
                width={25}
                height={18}
                className="rounded-full object-cover shadow-md cursor-pointer"
            />
            <div className="relative">
                <Bell className="w-5 sm:w-6 h-5 sm:h-6 text-gray-300 cursor-pointer hover:text-white"/>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
                <Image
                    src="/boy.png"
                    alt="profile"
                    width={35}
                    height={35}
                    className="rounded-full border border-gray-600"
                />

                <span className="hidden sm:block text-green-100 font-medium">MIn Taken</span>
            </div>
        </div>
    </div>

    </header>
  )
}

export default HeaderDB