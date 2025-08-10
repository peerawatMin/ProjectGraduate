import React from 'react'
import { motion } from 'framer-motion'
const StatCard = ({name, icon:Icon , value }:{name:string , icon:React.ElementType, value:string}) => {
  return (
    <motion.div 
    whileHover={{y:5 , boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.5)"}}
    className="bg-linear-to-tr from-indigo-800 to-sky-600 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
            <span className='flex items-center text-sm font-medium text-white'>
                <Icon size={20} className="mr-2"/>
                {name}
            </span>
            <p className="my-2 mt-5 text-3xl text-right font-semibold text-white">{value}</p>
        </div>
    </motion.div>
  )
}

export default StatCard