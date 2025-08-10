// src/app/signup/page.tsx
'use client'

import { ToastContainer } from 'react-toastify'
import AuthForm from '../components/AuthForm'

export default function SignupPage() {
  return (
  <>
   <ToastContainer/>
    <main className='flex justify-center items-center max-h-screen'>
          <div className=" opacity-85 p-8 w-[600px] items-center mt-14 space-y-6">
            
            <AuthForm isLogin={false} />
          </div>
        <video src='/bg_login.mp4' autoPlay muted loop className='absolute top-0 z-[-1] w-screen h-auto object-cover'  ></video>
    </main>
  </>
 
    
  )
}