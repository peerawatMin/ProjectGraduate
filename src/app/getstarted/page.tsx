// src/app/page.tsx
'use client';

import { useState } from 'react';
import Section from '../components/Section';
import ScrollProgressBar from '../components/ScrollProgressBar';
import Link from 'next/link';
import SmoothScrollControl from '../components/SmoothScrollControl';
import NavbarWithSection from '../components/NavbarWithSection';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
    const [selectedPlan, setSelectedPlan] = useState<{
    title: string;
    desc: string;
    img: string;
  } | null>(null);
    const plans = [
    {
      title: "รูปแบบแผนผังที่ 1",
      desc: "แผนผังที่นั่งสอบรูปนี้เป็นแบบแถวแนวคอลัมน์ ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวตั้ง",
      img: "/planA.png",
      bg: "bg-gradient-to-tr from-emerald-900 via-green-800 to-emerald-700"
    },
    {
      title: "รูปแบบแผนผังที่ 2",
      desc: "แผนผังที่นั่งสอบรูปนี้เป็นแบบแถวแนวคอลัมน์ ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวตั้ง แต่จะแค่ตรงกลางที่ไม่มีที่นั่ง 1 แถว",
      img: "/planB.png",
      bg: "bg-gradient-to-tr from-emerald-900 via-green-800 to-emerald-700"
    },
    {
      title: "รูปแบบแผนผังที่ 3",
      desc: "แผนผังที่นั่งสอบรูปนี้เป็นแบบแถวแนวนอน ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวนอน",
      img: "/planC.png",
      bg: "bg-gradient-to-tr from-emerald-900 via-green-800 to-emerald-700"
    },
    {
      title: "รูปแบบแผนผังที่ 4",
      desc: "แผนผังที่นั่งสอบรูปนี้เป็นแบบทรงเหมือนกรวยแนวตั้ง ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวนอน",
      img: "/planD.png",
      bg: "bg-gradient-to-tr from-emerald-900 via-green-800 to-emerald-700"
    }
  ];

  return (
    <>
    <ScrollProgressBar />
    <SmoothScrollControl /> 
    <NavbarWithSection />
      <main id="main-scroll" className="h-screen overflow-y-scroll snap-y snap-mandatory hide-scrollbar">
        
        <Section id="intro" className="bg-[url('/bgSec6.png')] bg-cover bg-center">
        
        <div className='space-y-4 gap-8'>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className='bg-transparent backdrop-blur-xs p-4 mt-8'>
                  <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-sm">ยินดีต้อนรับเข้าสู่</h2>
                  <h2 className="text-4xl font-bold mb-6 text-white drop-shadow-sm">เว็ปไซต์จัดที่นั่งสอบ</h2>
                      <p className="text-xl text-left shadow-xs text-shadow-black text-white mb-10 max-w-xl mx-auto">
                      เว็ปไซต์ของเราได้พัฒนามาเพื่อจัดที่นั่งสอบ เราจะแนะนำวิธีใช้เว็ปไซต์ของเรา โดยเลื่อนลงไปทีละหน้าจะมีวิธีสอนและอธิบายเกี่ยวกับเว็ปไซต์ของเรา
                      </p>
                      
              </div>
              <div className='flex justify-end-safe items-center'>
                  <Link href="/login" className='bg-transparent backdrop-blur-xs text-white border-2 border-white shadow text-[18px] 
                  uppercase transition duration-300 hover:bg-white hover:text-green-900
                  cursor-pointer hover:transition-duration-300 px-6 py-4 mx-3 my-4 mt-[250px] rounded-[100px]'>เริ่มต้นใช้งาน</Link>
              </div>
          </div>
        </div>
        
         
        </Section>
        <Section id="plan" className="bg-gradient-to-br from-[rgb(63,107,112)] to-[rgb(105,139,107)] relative w-full overflow-hidden py-20">
              <div className="relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl px-4 mx-auto">
                  {plans.map((plan, idx) => (
                    <div
                    key={idx}
                    className={`${plan.bg} rounded-2xl shadow-lg p-4 flex flex-col items-center gap-4 cursor-pointer`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <Image
                      src={plan.img}
                      alt={plan.title}
                      width={500}
                      height={500}
                      className="object-cover rounded-md"
                    />
                    <span className="text-white font-semibold text-center">{plan.title}</span>
                  </div>
                  ))}
                </div>
              </div>

              {/* Modal */}
              <AnimatePresence>
              {selectedPlan && (
                <motion.div
                  className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={() => setSelectedPlan(null)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />

                  {/* Card */}
                  <motion.div
                    className="relative bg-gradient-to-tr from-emerald-800 via-green-700 to-emerald-600 rounded-3xl shadow-2xl max-w-5xl w-full sm:h-auto p-6 sm:p-8 z-50 flex flex-col items-center"
                    initial={{ y: 50, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }}
                    exit={{ y: 50, opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } }}
                  >
                    {/* Close button */}
                    <button
                      className="absolute top-4 right-4 text-red-600 hover:text-red-900 font-bold text-3xl"
                      onClick={() => setSelectedPlan(null)}
                    >
                      ✕
                    </button>

                    {/* Image */}
                    <Image
                      src={selectedPlan.img}
                      alt={selectedPlan.title}
                      width={600}
                      height={600}
                      className="object-cover rounded w-full sm:w-[80%] max-h-[60vh] mb-6"
                    />

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 text-center text-white">
                      {selectedPlan.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-100 text-center sm:text-lg max-w-2xl">
                      {selectedPlan.desc}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
        </Section>


        <Section id="auto-assign" className="bg-gradient-to-tr from-[rgb(63,107,112)] to-[rgb(105,139,107)] bg-cover bg-center">
        <video
          className=" top-0 left-0 w-full h-full object-cover z-0 rounded-2xl "
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/vdoSec2.mp4" type="video/mp4" />
        </video>
        </Section>

      <Section id="visual" className="bg-gradient-to-br from-[#6A9BA1] to-[#A7BBA8] bg-cover bg-center">
        <h2 className="text-4xl font-semibold mb-6 text-gray-800">จัดที่นั่งสอบอัตโนมัติ</h2>
       
        {/* ตัวอย่างไอคอน หรือภาพประกอบ */}
        <div className="flex justify-between gap-8">
          <div className="items-center p-8 w-full ">
            <p className="text-3xl text-gray-800 max-w-xl mx-auto mb-2">วิธีการใช้งานเบื้องต้น</p> 
            <p className="text-xl text-gray-800 max-w-xl mx-auto mb-2 text-left">
              - กรอกชื่อการสอบที่เราจะจัดที่นั่งสอบ
            </p>
            <p className="text-xl text-gray-800 max-w-xl mx-auto mb-2 text-left">
              - กรอกจำนวนที่ต้องการจัดที่นั่งสอบ
            </p>
            <p className="text-xl text-gray-800 max-w-xl mx-auto mb-2 text-left">
              - เขียนคำอธิบาย ไว้สำหรับหมายเหตุ หรืออธิบายเกี่ยวกับการสอบ
            </p>
            <p className="text-xl text-gray-800 max-w-xl mx-auto mb-2 text-left">
              - เลือกรูปแบบการจัดที่นั่ง เช่น สุ่ม หรือเรียงลำดับได้ตามต้องการ และเลือกทิศทางการจัดเรียง
            </p>
            <p className="text-xl text-gray-800 max-w-xl mx-auto mb-2 text-left">
              - เลือกห้องสอบที่ต้องการใช้ สามารถดูรูปแบบห้องได้ 
            </p>
          </div>
          <div className="items-center bg-gray-800 p-2 rounded-2xl">
            <video src="/vdoSec1.mp4" autoPlay muted loop className='object-fit h-full w-full items-center rounded-2xl'></video>
            <div className='mt-4'>
              <span className='text-white text-center items-center'>** เป็นคลิปตัวอย่างการใช้งานเว็ปไซต์ **</span>
            </div>
          </div>
          
        </div>
      </Section>
      </main>
    </>
  );
}
