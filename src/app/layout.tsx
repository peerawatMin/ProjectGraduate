// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "../hooks/useAuth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SupabaseAuthListener from "./components/SupabaseAuthListener";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEATEX",
  description: "Exam Management",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="th" suppressHydrationWarning>
      <body className={inter.className}>
        {/* sync session ฝั่ง client -> server */}
        <SupabaseAuthListener serverAccessToken={session?.access_token} />

        <AuthProvider>{children}</AuthProvider>

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
