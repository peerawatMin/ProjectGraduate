'use client'
import Link from 'next/link'
import React from 'react'

const Bg_main = () => {
  
  return (
    <main className='flex flex-col justify-center items-center p-24 max-h-screen overflow-hidden'>
            <h1 className='uppercase text-white tracking-[1.25rem] font-medium px-8 text-4xl mt-20'>Welcome to Examination</h1>
            <div className='flex items-center justify-center'>
                <Link href="/getstarted" className='bg-transparent text-white border border-white text-[12px] 
                uppercase tracking-[0.5rem] transition duration-300 hover:bg-white hover:text-black
                cursor-pointer hover:transition-duration-300 px-4 py-6 mx-3 my-4 rounded'>Get started</Link>
                <Link href="/login" className='bg-transparent text-white border border-white text-[12px] 
                uppercase tracking-[0.5rem] transition duration-300 hover:bg-white hover:text-black
                cursor-pointer hover:transition-duration-300 px-4 py-6 mx-3 my-4 rounded'>Go To Login</Link>
            </div>
        <video src='/video_bg.mp4' autoPlay muted loop className='absolute top-0 z-[-1] w-full h-full object-cover'  ></video>
    </main>
  )
}

export default Bg_main