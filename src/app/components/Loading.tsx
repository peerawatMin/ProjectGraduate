'use client'

import { motion } from 'framer-motion'

const Loading = () => {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-transparent text-white">
      {/* วงกลมแบบ futuristic */}
      <motion.div
        className="rounded-full border-t-4 border-b-4 border-blue-500 h-24 w-24 mb-10 shadow-[0_0_40px_#3b82f6] bg-gradient-to-tr from-blue-800 to-blue-600"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut',
        }}
      />

      {/* ข้อความพิมพ์ดีด */}
      <motion.p
        className="text-xl font-mono tracking-widest text-blue-800"
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
