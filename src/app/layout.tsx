// src/app/layout.tsx
import { AuthProvider } from '../hooks/useAuth'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SEATEX',
  description: 'Exam Management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <AuthProvider>
                {children}
        </AuthProvider>
        <ToastContainer
            position="top-right"
            autoClose={1000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
      </body>
    </html>
  )
}