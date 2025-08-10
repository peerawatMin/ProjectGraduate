// src/app/page.tsx
'use client';

import Section from '../components/Section';
import ScrollProgressBar from '../components/ScrollProgressBar';
import Link from 'next/link';
import SmoothScrollControl from '../components/SmoothScrollControl';
import NavbarWithSection from '../components/NavbarWithSection';
import Image from 'next/image';

export default function Home() {
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
        <Section id="plan" className="bg-gradient-to-br from-[#6A9BA1] to-[#A7BBA8] relative w-full overflow-hidden py-20" >

        {/* ชั้น overlay ทึบ ๆ เพื่อให้อ่าน text ง่าย */}
        <div className="absolute top-0 left-0 w-full h-full z-10" />

        {/* เนื้อหาหลัก */}
        <div className="relative z-20">
          <h2 className="text-3xl text-white font-bold mb-4 text-center">
            รูปแบบแผนผังจัดที่นั่งสอบ
          </h2>
          <p className="text-white mb-6 text-center">
            รูปแบบของแต่ละห้องที่ทางเว็บไซต์เราเตรียมไว้
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl px-4 mx-auto">
            {/* Item 1 */}
            <div className="bg-rose-600/90 rounded-xl shadow p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Image
                src="/planA.png"
                alt="แผนผังที่นั่งสอบ 1"
                width={300}
                height={300}
                className="object-cover rounded-md"
              />
              <div>
                <h3 className="text-[16px] font-semibold mb-2 text-white">รูปแบบแผนผังที่ 1</h3>
                <p className="text-white text-left">
                  แผนผังที่นั่งสอบรูปนี้เป็นแบบแถวแนวคอลัมน์ ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวตั้ง
                </p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="bg-yellow-600/90 rounded-xl shadow p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Image
                src="/planB.png"
                alt="แผนผังที่นั่งสอบ 2"
                width={300}
                height={300}
                className="object-cover rounded-md"
              />
              <div>
                <h3 className="text-[16px] font-semibold mb-2 text-white">รูปแบบแผนผังที่ 2</h3>
                <p className="text-white text-left">
                  แผนผังที่นั่งสอบรูปนี้เป็นแบบแถวแนวคอลัมน์ ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวตั้ง แต่จะแค่ตรงกลางที่ไม่มีที่นั่ง 1 แถว
                </p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="bg-green-600/90 rounded-xl shadow p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Image
                src="/planC.png"
                alt="แผนผังที่นั่งสอบ 3"
                width={300}
                height={300}
                className="object-cover rounded-md"
              />
              <div>
                <h3 className="text-[16px] font-semibold mb-2 text-white">รูปแบบแผนผังที่ 3</h3>
                <p className="text-white text-left">
                  แผนผังที่นั่งสอบรูปนี้เป็นแบบแถวแนวนอน ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวนอน
                </p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="bg-blue-600/90 rounded-xl shadow p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Image
                src="/planD.png"
                alt="แผนผังที่นั่งสอบ 4"
                width={300}
                height={300}
                className="object-cover rounded-md"
              />
              <div>
                <h3 className="text-[16px] font-semibold mb-2 text-white">รูปแบบแผนผังที่ 4</h3>
                <p className="text-white text-left">
                  แผนผังที่นั่งสอบรูปนี้เป็นแบบทรงเหมือนกรวยแนวตั้ง ผู้เข้าสอบจะถูกจัดให้นั่งตามลำดับแนวนอน
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>


        <Section id="auto-assign" className="bg-gradient-to-tr from-[#6A9BA1] to-[#A7BBA8] bg-cover bg-center">
        <video
          className=" top-0 left-0 w-full h-full object-cover z-0 rounded-2xl"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/vdoSec1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
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
