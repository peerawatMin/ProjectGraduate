'use client'

import { motion } from 'framer-motion'

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-transparent">
      {/* วงแหวนเส้นวิ่ง */}
      <motion.div
        className="relative h-16 w-16"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: 'linear',
        }}
      >
        {/* เส้นโค้งไล่สี + glow */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, #2c57f2 0deg, #2c3ff2 60deg, transparent 120deg, transparent 360deg)',
            filter: 'drop-shadow(0 0 15px #1300ba)',
            maskImage: 'radial-gradient(circle, transparent 60%, black 61%)', // วงในโปร่งใส
            WebkitMaskImage: 'radial-gradient(circle, transparent 60%, black 61%)',
          }}
        />
      </motion.div>

      {/* ข้อความ */}
      <motion.p
        className="text-xl font-mono tracking-widest text-blue-600 mt-6 drop-shadow-[0_0_5px_#3b82f6]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      >
        Loading
      </motion.p>
    </div>
  )
}

export default Loading
