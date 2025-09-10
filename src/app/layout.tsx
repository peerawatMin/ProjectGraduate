// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "../hooks/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEATEX",
  description: "Exam Management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      {/* ลบ bg-background ออก เพื่อไม่ให้ทับ gradient ของ System/Dark */}
      <body className={inter.className}>
        
          <AuthProvider>
            {children}
          </AuthProvider>

          {/* จะให้ Toast เปลี่ยนตามธีมจริง ให้เปลี่ยน theme="colored" เป็น light/dark ตาม resolvedTheme ก็ได้ */}
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
  );
}
