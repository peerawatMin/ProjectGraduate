// ตัวอย่าง: src/app/Dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import DashboardLayoutClient from './DashboardLayoutClient'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('authToken')?.value
  if (!token) {
    redirect('/login?redirect=/Dashboard')
  }
  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    redirect('/login?redirect=/Dashboard')
  }
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
